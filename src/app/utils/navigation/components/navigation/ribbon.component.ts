import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {NavActionsEnum} from './navActions.enum';
import { Router} from '@angular/router';
import {Navigation} from '../../models/navigation';
import {NavigationAcceptedIconsEnum} from '../../models/navigation.types';
import {NavButtonsIdsEnum} from '../../models/navButtonsIds.enum';
import {NavigationButton} from '../../models/navigationButton';


export interface NavButClickedEmit {
  action: NavActionsEnum;
  context?: {};
}


@Component({
  selector: 'app-ribbon',
  templateUrl: './ribbon.component.html',
  styleUrls: ['./ribbon.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class RibbonComponent {
  @Input() navigation!: Navigation;
  @Input() activeTab: string = '';
  @Output() actionEmitted: EventEmitter<{ id: NavButtonsIdsEnum, context?: any }> = new EventEmitter<{ id: NavButtonsIdsEnum, context?: any }>();
  subMenuHidden = false;
  navIconType = NavigationAcceptedIconsEnum;
  navButtonsEnum = NavButtonsIdsEnum;

  constructor(private router: Router) {
  }

  menuChange($event: any): void {
    const navTabName = $event.tabTitle.toLowerCase();
    const url = this.navigation.navTabs.find(nav => nav.name.toLowerCase() === navTabName)?.url;
    if (url) {
      this.router.navigate(url);
    }
  }

  actionEmit(button: NavigationButton): void {
    if (!button.url || button.url.length < 1) {
      // nechci emitovat id pro buttony
      this.actionEmitted.emit({id: button.id})
    }
  }

}

