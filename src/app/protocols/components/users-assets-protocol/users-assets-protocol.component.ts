import {Component, Input} from '@angular/core';
import {IAssetsExt} from '../../../assets/assets.service';

@Component({
  selector: 'app-users-assets-protocol',
  templateUrl: './users-assets-protocol.component.html',
  styleUrls: ['./users-assets-protocol.component.scss']
})
export class UsersAssetsProtocolComponent {
  @Input() data: IAssetsExt[] = [];
  todayDate = new Date().toLocaleDateString();
}
