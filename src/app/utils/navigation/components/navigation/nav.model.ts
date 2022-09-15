import {NavButtonsIdsEnum} from '../../models/navButtonsIds.enum';

export interface NavButton {
  id: string;
  name: string;
  disabled?: boolean;
  nbIcon?: string;
  faIcon?: string;
  class?: string;
  url?: string[];
  target?: string;
  badge?: {
    status: 'basic' | 'primary' | 'warning' | 'danger' | 'info' | 'success';
    text: string;
  };
  routerLinkActiveExactOptions?: boolean;
}

export interface NavSelect {
  id: NavButtonsIdsEnum;
  selected: number | string;
  options: {value: string, identifier: number | string}[];
}

export interface NavInput {
  identifier: NavButtonsIdsEnum;
  value: string | number;
}

export enum NavSubSectionEnum {
  buttons,
  select,
  input,
  toggle
}

export interface NavSubSectionButton {
  type: NavSubSectionEnum.buttons;
  buttons: NavButton[];
}

export interface NavSubSectionSelect {
  type: NavSubSectionEnum.select;
  select: NavSelect;
}

export interface NavSubSectionInput {
  type: NavSubSectionEnum.input;
  input: NavInput;
}

export interface NavSubSectionToggle {
  type: NavSubSectionEnum.toggle;
  toggle: {
    selected: boolean;
    identifier: NavButtonsIdsEnum;
  };
}

export type SubSectionType = NavSubSectionButton | NavSubSectionSelect | NavSubSectionInput | NavSubSectionToggle

export interface NavSection {
  id?: string;
  name: string;
  nbIcon?: string;
  faIcon?: string;
  subSections: SubSectionType[];
}

export interface NavTab {
  id: string;
  name: string;
  url: string[];
  sections: NavSection[];
  nbIcon?: string;
}

export interface NavigationInterface {
  activeLinkClass: string;
  navTabs: NavTab[];
}
