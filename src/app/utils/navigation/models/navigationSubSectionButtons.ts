import {NavSubSectionEnum} from '../components/navigation/nav.model';
import {NavigationSubSection} from './navigationSubSection';
import {NavigationButton} from './navigationButton';

/***
 * trida reprezentujici jeden sloupec sekci s buttony
 */
export class NavigationSubSectionButtons implements NavigationSubSection{
  private _buttons: NavigationButton[] = [];
  private _type: NavSubSectionEnum.buttons = NavSubSectionEnum.buttons;

  get buttons(): NavigationButton[] {
    return this._buttons;
  }

  get type(): NavSubSectionEnum.buttons {
    return this._type;
  }


}
