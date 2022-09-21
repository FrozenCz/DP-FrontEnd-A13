export class Location {
  private readonly _uuid: string | null;
  private _name: string;
  private _parent: Location | null;


  constructor(uuid?: string | null, name?: string, parent?: Location | null) {
    this._uuid = uuid ?? null;
    this._name = name ?? '';
    this._parent = parent ?? null;
  }

  get uuid(): string | null {
    return this._uuid;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get parent(): Location | null {
    return this._parent;
  }

  set parent(value: Location | null) {
    this._parent = value;

  }

  get treePath(): string[] {
    return this.recursiveSearch(this, []);
  }

  private recursiveSearch(parent: Location, treePath: string[]): string[] {
    if (parent.uuid) treePath.unshift(parent.uuid)

    if(parent.parent && parent.parent.uuid) {
      return this.recursiveSearch(parent.parent, treePath)
    }
    return treePath;
  }
}
