export default function Footer() {
  return (
    <footer className="mt-20 bg-primary-strong text-on-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-base font-bold">Planted It</p>
          <p className="mt-1 text-on-primary/75">Find plants that thrive where you live.</p>
        </div>
        <p className="text-on-primary/75">Map data © OpenStreetMap contributors</p>
      </div>
    </footer>
  );
}
