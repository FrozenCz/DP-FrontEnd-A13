/**
 * trida reprezentujici tlacitko na navigaci
 */
import {NavigationAcceptedIconsEnum} from './navigation.types';
import {NavButtonsIdsEnum} from './navButtonsIds.enum';


export class NavigationButton {
  private readonly _id: NavButtonsIdsEnum;
  private readonly _name: string;
  private readonly _icon: string;
  private readonly _iconType: NavigationAcceptedIconsEnum;
  private readonly _url: string[] = [];
  private _target: '_self' | '_blank' = '_self';
  private _disabled: boolean = false;
  private _class?: string | undefined;
  private _badge?: {
    status: 'basic' | 'primary' | 'warning' | 'danger' | 'info' | 'success';
    text: string;
  };
  private _routerLinkActiveExactOptions: boolean = false;


  constructor(id: NavButtonsIdsEnum, name: string, icon: { name: string, iconType: NavigationAcceptedIconsEnum }, url?: string[]) {
    this._id = id;
    this._name = name;
    this._icon = icon.name;
    this._iconType = icon.iconType;
    if (url && Array.isArray(url)) {
      this._url = url;
    }
  }


  get id(): NavButtonsIdsEnum {
    return this._id;
  }

  get name(): string {
    return this._name;
  }


  get icon(): string {
    return this._icon;
  }

  get iconType(): NavigationAcceptedIconsEnum {
    return this._iconType;
  }

  get url(): string[] {
    return this._url;
  }

  get badge(): { status: "basic" | "primary" | "warning" | "danger" | "info" | "success"; text: string } | undefined {
    return this._badge;
  }

  get target(): "_self" | "_blank" {
    return this._target;
  }

  set target(value: "_self" | "_blank") {
    this._target = value;
  }

  get disabled(): boolean {
    if (this._badge && this._badge.text.toString() === '0') {
      return true;
    }
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
  }

  get class(): string | undefined {
    return this._class;
  }

  set class(value: string | undefined) {
    this._class = value;
  }


  set badge(value: { status: "basic" | "primary" | "warning" | "danger" | "info" | "success"; text: string } | undefined) {
    this._badge = value;
  }

  setBadgeText(value: string | number): void {
    const stringedValue = typeof value === 'string' ? value : value.toString();
    if (this._badge) {
      this._badge.text = stringedValue;
    }
  }

  get routerLinkActiveExactOptions(): boolean {
    return this._routerLinkActiveExactOptions;
  }

  set routerLinkActiveExactOptions(value: boolean) {
    this._routerLinkActiveExactOptions = value;
  }
}
