interface Context {
  id: string;
  mapbox_id: string;
  wikidata: string;
  short_code: string;
  text: string;
}

interface Geometry {
  type: string;
  coordinates: [number, number];
}

interface Properties {
  mapbox_id: string;
  wikidata: string;
  short_code: string;
}

export interface Feature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: Properties;
  text: string;
  place_name: string;
  bbox: [number, number, number, number];
  center: [number, number];
  geometry: Geometry;
  context: Context[];
}

export type MapboxPlacesGetResDto = Feature[];
