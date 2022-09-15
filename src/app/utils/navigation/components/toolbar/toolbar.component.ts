import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {NavButtonsIdsEnum} from '../../models/navButtonsIds.enum';

export interface MainTab {
  exact: boolean;
  name: string;
  nbIcon: string;
  url: string[];
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent {
  @Input() navigation: MainTab[] = [];
  @Output() expand: EventEmitter<void> = new EventEmitter<void>();
  @Output() actionEmitted: EventEmitter<{ id: NavButtonsIdsEnum, context?: any }> = new EventEmitter<{ id: NavButtonsIdsEnum, context?: any }>();
  navButtonsIds = NavButtonsIdsEnum;
}
