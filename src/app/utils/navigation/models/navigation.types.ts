import {NavigationSubSectionButtons} from './navigationSubSectionButtons';
import {NavSubSectionInput, NavSubSectionSelect, NavSubSectionToggle} from '../components/navigation/nav.model';

export enum NavigationAcceptedIconsEnum {
  fontawesome,
  eva
}
export type SubSectionType = NavigationSubSectionButtons | NavSubSectionSelect | NavSubSectionInput | NavSubSectionToggle;
