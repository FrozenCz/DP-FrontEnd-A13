import {NavigationAcceptedIconsEnum, SubSectionType} from './navigation.types';

/**
 * trida reprezentujici sekci v tabu, napriklad muze predstavovat sekci protokoly v zalozce(tabu) majetek
 * a muze obsahovat nekolik podsekci
 */
export class NavigationSection {
  private readonly _id: string;
  private readonly _name: string;
  private _icon?: {name: string, iconType: NavigationAcceptedIconsEnum};
  private _subSections: SubSectionType[] = [];

  constructor(id: string, name: string, icon?: {name: string, iconType: NavigationAcceptedIconsEnum}) {
    this._id = id;
    this._name = name
    if (icon) {
      this._icon = {
        name: icon.name,
        iconType: icon.iconType
      }
    }
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get icon(): string | undefined {
    return this._icon?.name ?? undefined;
  }

  get iconType(): NavigationAcceptedIconsEnum | undefined {
    return this._icon?.iconType
  }


  get subSections(): SubSectionType[] {
    return this._subSections;
  }

}
