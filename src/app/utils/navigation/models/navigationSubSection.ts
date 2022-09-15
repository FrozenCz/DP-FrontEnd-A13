import {NavSubSectionEnum} from '../components/navigation/nav.model';


export interface NavigationSubSection {
  get type(): NavSubSectionEnum;
}
