export interface ICategory {
  id: number;
  name: string;
  code?: string;
  tree: string[];
  treeIds: number[];
  columnValues: ColumnValues[];
  children: number[];
  parent: number;
  parentName: string;
}

export interface DefaultCategory {
  id: number | null;
  name: string | null;
  code?: string;
  tree: string[];
  treeIds: number[];
  columnValues: ColumnValues[];
  children: number[];
  parent: number | null;
  parentName: string | null;
}

export interface ColumnValues {
  name: string;
  codeName: string;
  useCodeAsColumn: boolean;
}


export interface IColumnName {
  name: string;
  codeName: string;
  useCodeAsColumn: boolean;
}


export interface ICategoryWithColumnNames extends ICategory, IColumnName {
}


export interface ICategoryGet {
  id: number;
  name: string;
  code: string;
  parent: ICategoryGet;
}

export interface ICategoryGetObject {
  id: number;
  name: string;
  code: string;
  children: ICategoryGetObject[];
}


