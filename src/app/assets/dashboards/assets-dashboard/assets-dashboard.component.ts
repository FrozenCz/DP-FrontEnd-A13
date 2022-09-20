import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {IAssetsExt} from '../../assets.service';
import {AssetSource, Facade} from '../../../facade/facade';

@Component({
  selector: 'app-assets-dashboard',
  templateUrl: './assets-dashboard.component.html',
  styleUrls: ['./assets-dashboard.component.scss']
})
export class AssetsDashboardComponent {
  assets$: Observable<IAssetsExt[]>

  constructor(private facade: Facade) {
    this.assets$ = this.facade.getAssetExt(AssetSource.STORE);
  }







}
