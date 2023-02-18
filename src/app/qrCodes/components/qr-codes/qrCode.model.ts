export interface Barcode {
  id: number;
  name: string;
  found: boolean;
  location: LocationModel | null;
}

export interface LocationModel {
  uuid: string;
  name: string;
  nfcId: string | null;
}
