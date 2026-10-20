// Builds src/data/invasive-regions.json: for each plant in the `plants` table, the regions where
// the Global Register of Introduced and Invasive Species (GRIIS, published through GBIF) lists it
// as invasive. Run with `npm run build:invasive` and commit the result.
//
// Regions are ISO 3166 codes ("AU", "FR"). The US is split the way GRIIS splits it: "US-AK",
// "US-HI" and "US-L48" for the contiguous states.
//
// The US checklists call anything spreading in the wild "invasive", tomatoes included, so there a
// plant must also be in the Global Invasive Species Database, which only lists species with
// documented harm.

import { readFileSync, writeFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

const GBIF = "https://api.gbif.org/v1";
const GRIIS_PUBLISHER = "cdef28b1-db4e-4c58-aa71-3c5238c2d0b5";
const GISD = "b351a324-77c4-41c9-a909-f30f77268bc4";
const OUTPUT = new URL("../src/data/invasive-regions.json", import.meta.url);
const PAGE_SIZE = 1000;

// GRIIS splits the US into three checklists instead of one per country
const US_REGIONS = [
  [/Alaska/, "US-AK"],
  [/Hawaii/, "US-HI"],
  [/United States \(Contiguous\)/, "US-L48"]
];

function loadEnv() {
  try {
    for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (match && !(match[1] in process.env)) process.env[match[1]] = match[2];
    }
  } catch {
    // Fall back to the real environment
  }
}

async function fetchJson(url, init) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, init);
    if (res.ok) return res.json();
    if (attempt === 3) throw new Error(`${res.status} from ${url}`);
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
  }
}

// "Mentha × piperita L." and "Mentha x piperita 'Chocolate'" both become "mentha x piperita"
function speciesKey(name) {
  const words = name.toLowerCase().replace(/×/g, " x ").replace(/'[^']*'|"[^"]*"/g, " ").split(/\s+/).filter(Boolean);
  const [genus, second, third] = words;
  if (!genus || !second) return null;
  if (second === "x") return third ? `${genus} x ${third}` : null;
  // Authorship ("L.", "(Lam.) Sweet") and genus-only entries ("Acacia sp.") aren't species
  if (!/^[a-z-]+$/.test(second) || second === "sp" || second === "spp") return null;
  return `${genus} ${second}`;
}

async function getPlants() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  const plants = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await fetchJson(
      `${url}/rest/v1/plants?select=uuid,scientific_name&order=uuid&offset=${offset}&limit=${PAGE_SIZE}`,
      { headers: { Authorization: `Bearer ${key}`, apikey: key } }
    );
    plants.push(...page);
    if (page.length < PAGE_SIZE) return plants;
  }
}

// Reads every file out of a zip archive using its central directory
function unzip(buffer) {
  const files = new Map();
  let end = buffer.length - 22;
  while (end >= 0 && buffer.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0) throw new Error("Not a zip archive");

  let entry = buffer.readUInt32LE(end + 16);
  for (let i = buffer.readUInt16LE(end + 10); i > 0; i--) {
    const method = buffer.readUInt16LE(entry + 10);
    const size = buffer.readUInt32LE(entry + 20);
    const nameLength = buffer.readUInt16LE(entry + 28);
    const extraLength = buffer.readUInt16LE(entry + 30);
    const commentLength = buffer.readUInt16LE(entry + 32);
    const local = buffer.readUInt32LE(entry + 42);
    const name = buffer.toString("utf8", entry + 46, entry + 46 + nameLength).replace(/^.*\//, "");

    const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
    const data = buffer.subarray(start, start + size);
    files.set(name, method === 8 ? inflateRawSync(data) : data);
    entry += 46 + nameLength + extraLength + commentLength;
  }
  return files;
}

// Darwin Core archives describe their own columns in meta.xml; returns rows keyed by term name
function readTable(files, meta, rowType) {
  const block = meta.match(new RegExp(`<(core|extension)[^>]*rowType="[^"]*/${rowType}"[\\s\\S]*?</\\1>`));
  if (!block) return [];
  const location = block[0].match(/<location>([^<]+)<\/location>/)?.[1];
  const file = location && files.get(location.replace(/^.*\//, ""));
  if (!file) return [];

  const columns = { id: Number(block[0].match(/<(?:id|coreid) index="(\d+)"/)?.[1] ?? 0) };
  for (const [, index, term] of block[0].matchAll(/<field index="(\d+)" term="[^"]*\/([^"/]+)"/g)) {
    columns[term] = Number(index);
  }
  const skip = Number(block[0].match(/ignoreHeaderLines="(\d+)"/)?.[1] ?? 0);
  const quoted = /fieldsEnclosedBy="&quot;"/.test(block[0]);
  const separator = /fieldsTerminatedBy=","/.test(block[0]) ? "," : "\t";

  return file.toString("utf8").split(/\r?\n/).slice(skip).filter(Boolean).map((line) => {
    const cells = quoted ? splitQuoted(line, separator) : line.split(separator);
    return Object.fromEntries(Object.entries(columns).map(([term, index]) => [term, cells[index]?.trim() ?? ""]));
  });
}

function splitQuoted(line, separator) {
  const cells = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === "\"" && line[i + 1] === "\"" && inQuotes) {
      cell += "\"";
      i++;
    } else if (char === "\"") {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

// The older checklists set isInvasive; the US ones grade degreeOfEstablishment instead
function isInvasive(profile, distribution) {
  if (/^(invasive|yes|true)\b/i.test(profile?.isInvasive ?? "")) return true;
  return /invasive/i.test(distribution?.degreeOfEstablishment ?? "");
}

async function listChecklists() {
  const datasets = [];
  for (let offset = 0; ; offset += 300) {
    const page = await fetchJson(`${GBIF}/dataset/search?publishingOrg=${GRIIS_PUBLISHER}&limit=300&offset=${offset}`);
    datasets.push(...page.results);
    if (page.endOfRecords) break;
  }
  // Protected-area and global lists don't describe a whole country
  return datasets.filter(({ title }) => /^(Global Register|GRIIS Checklist)/.test(title));
}

async function downloadArchive(key) {
  const detail = await fetchJson(`${GBIF}/dataset/${key}`);
  const archive = detail.endpoints.find((endpoint) => endpoint.type === "DWC_ARCHIVE");
  if (!archive) throw new Error("no archive");
  const res = await fetch(archive.url);
  if (!res.ok) throw new Error(`${res.status} downloading archive`);
  const files = unzip(Buffer.from(await res.arrayBuffer()));
  const meta = files.get("meta.xml")?.toString("utf8");
  if (!meta) throw new Error("no meta.xml");
  return { detail, files, meta };
}

async function readHarmful() {
  const { files, meta } = await downloadArchive(GISD);
  return new Set(readTable(files, meta, "Taxon").map((taxon) => speciesKey(taxon.scientificName)).filter(Boolean));
}

async function readChecklist(dataset, harmful) {
  const { detail, files, meta } = await downloadArchive(dataset.key);
  const taxa = readTable(files, meta, "Taxon");
  const distributions = new Map(readTable(files, meta, "Distribution").map((row) => [row.id, row]));
  const profiles = new Map(readTable(files, meta, "SpeciesProfile").map((row) => [row.id, row]));

  const usRegion = US_REGIONS.find(([pattern]) => pattern.test(dataset.title))?.[1];
  const countries = new Set();
  const invasive = new Set();
  for (const taxon of taxa) {
    if (taxon.kingdom && taxon.kingdom !== "Plantae") continue;
    const distribution = distributions.get(taxon.id);
    if (distribution?.countryCode) countries.add(distribution.countryCode.toUpperCase());
    if (!isInvasive(profiles.get(taxon.id), distribution)) continue;
    const keys = [taxon.scientificName, taxon.acceptedNameUsage].map((name) => name && speciesKey(name)).filter(Boolean);
    if (usRegion && !keys.some((key) => harmful.has(key))) continue;
    keys.forEach((key) => invasive.add(key));
  }

  const country = usRegion ?? (countries.size === 1 ? [...countries][0] : detail.countryCoverage?.[0]);
  if (!country) throw new Error("couldn't tell which country it covers");
  return { country, invasive, size: taxa.length };
}

async function main() {
  loadEnv();
  const plants = await getPlants();
  const byKey = new Map();
  for (const plant of plants) {
    const key = plant.scientific_name && speciesKey(plant.scientific_name);
    if (key) byKey.set(key, [...(byKey.get(key) ?? []), plant.uuid]);
  }
  console.log(`${plants.length} plants, ${byKey.size} species`);

  const [checklists, harmful] = await Promise.all([listChecklists(), readHarmful()]);
  const read = [];
  const failed = [];
  let done = 0;

  // A few at a time keeps GBIF and the IPT hosts happy
  const queue = [...checklists];
  await Promise.all(Array.from({ length: 6 }, async () => {
    for (let dataset = queue.shift(); dataset; dataset = queue.shift()) {
      try {
        read.push(await readChecklist(dataset, harmful));
      } catch (err) {
        failed.push(`${dataset.title}: ${err.message}`);
      }
      process.stdout.write(`
${++done}/${checklists.length} checklists`);
    }
  }));
  console.log();

  // Islands and parks can share their country's code ("Pitcairn Islands" is GB). The national
  // checklist is always the largest, and a smaller one mustn't flag plants for the whole country.
  const national = new Map();
  for (const checklist of read) {
    if ((national.get(checklist.country)?.size ?? -1) < checklist.size) national.set(checklist.country, checklist);
  }

  const listed = new Map();
  for (const { country, invasive } of national.values()) {
    for (const key of invasive) {
      for (const uuid of byKey.get(key) ?? []) {
        listed.set(uuid, new Set([...(listed.get(uuid) ?? []), country]));
      }
    }
  }
  const regions = national.keys();

  const sorted = (values) => [...values].sort();
  const output = {
    generated: new Date().toISOString().slice(0, 10),
    plants: Object.fromEntries(sorted(listed.keys()).map((uuid) => [uuid, sorted(listed.get(uuid))])),
    // Regions with a checklist, so a plant missing from `plants` there is known not to be listed
    regions: sorted(regions),
    source: "Global Register of Introduced and Invasive Species (GRIIS) and Global Invasive Species Database, via GBIF"
  };
  writeFileSync(OUTPUT, `${JSON.stringify(output, null, 1)}\n`);

  console.log(`${listed.size} plants invasive somewhere, across ${national.size} regions`);
  if (failed.length) console.warn(`Skipped ${failed.length} checklists:\n  ${failed.join("\n  ")}`);
}

await main();
