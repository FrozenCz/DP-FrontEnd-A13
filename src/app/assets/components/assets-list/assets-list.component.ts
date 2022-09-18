import {Component, Input} from '@angular/core';
import {IAssetsExt} from '../../assets.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss']
})

export class AssetsListComponent{
  @Input() assets: IAssetsExt[] = [];
  gridUid = 'assetList';

  constructor() {
  }



}




