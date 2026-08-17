import { SavedLocation } from "../lib/storage/locations";

export const DUMMY_LOCATION: SavedLocation = {
  data: {
    address: {},
    addresstype: '',
    boundingbox: ['0', '0', '0', '0'],
    class: '',
    display_name: 'Unable to geocode',
    importance: 0,
    lat: '0',
    licence: '',
    lon: '0',
    name: '',
    osm_id: 0,
    osm_type: '',
    place_id: 0,
    place_rank: 0,
    type: ''
  },
  lat: 0,
  lng: 0,
  savedAt: new Date().toISOString()
};