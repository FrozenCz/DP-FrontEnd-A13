export interface Unit {
  id: number;
  name: string;
  parent: any;
  children: number[];
  tree: string[];
}

export interface IUnitGet {
  id: number;
  name: string;
  parent: IUnitGet;
}

export interface UnitUpdate {
  id: number;
  name: string;
}

export interface UnitsGetObject {
  id: number;
  name: string;
  children: UnitsGetObject[];
}
