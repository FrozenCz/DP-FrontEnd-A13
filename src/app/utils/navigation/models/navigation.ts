import {NavigationTab} from './navigationTab';

/**
 * trida reprezentujici navigaci
 * navigace slouzi jak pro ribbon, tak pro sidenav
 * navigace umi vkladat navigacni taby
 */

export class Navigation {
  private _activeLinkClass: string = '';
  private _navTabs: NavigationTab[] = [];

  constructor(activeLinkClass: string) {
    this.activeLinkClass = activeLinkClass;
  }

  get activeLinkClass(): string {
    return this._activeLinkClass;
  }

  set activeLinkClass(value: string) {
    this._activeLinkClass = value;
  }

  get navTabs(): NavigationTab[] {
    return this._navTabs;
  }

  set navTabs(value: NavigationTab[]) {
    this._navTabs = value;
  }




}
