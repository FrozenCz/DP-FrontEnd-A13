import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import {NbSidebarComponent} from '@nebular/theme';
import {NavSubSectionEnum} from '../navigation/nav.model';
import {Navigation} from '../../models/navigation';
import {NavigationTab} from '../../models/navigationTab';
import {NavigationAcceptedIconsEnum} from '../../models/navigation.types';
import {NavButtonsIdsEnum} from '../../models/navButtonsIds.enum';


export interface NavActionEmit {
  id: NavButtonsIdsEnum,
  context?: any
}

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent implements OnChanges {
  @Input() sideBarRef!: NbSidebarComponent;
  @Input() navigation!: Navigation;
  @Input() activeTab!: string;
  @Output() actionEmitted: EventEmitter<NavActionEmit> = new EventEmitter<NavActionEmit>();

  navTab: NavigationTab | undefined = undefined;
  subsectionEnum = NavSubSectionEnum;
  navIconType = NavigationAcceptedIconsEnum;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.navTab = this.navigation.navTabs?.find(t => t.id.toLowerCase() === this.activeTab?.toLowerCase());

    if (!this.navTab || this.navTab?.sections?.length < 1) {
      this.sideBarRef.collapse();
    } else {
      this.sideBarRef.expand();
    }
  }


}
