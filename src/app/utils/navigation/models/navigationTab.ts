import {NavigationSection} from './navigationSection';

/**
 * trida reprezentujici zalozky resp. hlavni sekce v navigaci
 */
export class NavigationTab {

  private readonly _id: string;
  private readonly _name: string;
  private readonly _url: string[];
  private readonly _nbIcon: string;
  private _sections: NavigationSection[] = [];

  constructor(id: string, name: string, url: string[], nbIcon: string) {
    this._id = id;
    this._name = name;
    this._url = url;
    this._nbIcon = nbIcon;
  }


  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get url(): string[] {
    return this._url;
  }

  get nbIcon(): string {
    return this._nbIcon;
  }

  get sections(): NavigationSection[] {
    return this._sections;
  }
}
