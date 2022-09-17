export class Category {
  private _id: number;
  private _name: string;
  private _code: string = '';
  private _tree: string[] = [];
  private _treeIds: number[] = [];
  private _columnValues: ColumnValues[] = [];
  private _children: number[] = [];
  private _parent: number;
  private _parentName: string;

  constructor(id: number, name: string, parent?: number, parentName?: string) {
    this._id = id;
    this._name = name;
    this._parent = parent ?? id;
    this._parentName = parentName ?? name;
  }


  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get code(): string {
    return this._code;
  }

  set code(value: string) {
    this._code = value;
  }

  get tree(): string[] {
    return this._tree;
  }

  set tree(value: string[]) {
    this._tree = value;
  }

  get treeIds(): number[] {
    return this._treeIds;
  }

  set treeIds(value: number[]) {
    this._treeIds = value;
  }

  get columnValues(): ColumnValues[] {
    return this._columnValues;
  }

  set columnValues(value: ColumnValues[]) {
    this._columnValues = value;
  }

  get children(): number[] {
    return this._children;
  }

  set children(value: number[]) {
    this._children = value;
  }

  get parent(): number {
    return this._parent;
  }

  set parent(value: number | undefined) {
    this._parent = value ?? this._id;
  }

  get parentName(): string {
    return this._parentName;
  }

  set parentName(value: string) {
    this._parentName = value;
  }
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


export interface ICategoryWithColumnNames extends IColumnName {
  id: number;
  code: string;
  tree: string[];
}


export interface ICategoryGet {
  id: number;
  name: string;
  code: string;
  parent: ICategoryGet;
}

export interface CategoryGetDTO {
  id: number;
  name: string;
  code: string;
  children: CategoryGetDTO[];
}


