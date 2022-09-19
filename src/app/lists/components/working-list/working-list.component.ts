import {Component} from '@angular/core';
import {IAssetsExt} from '../../../assets/assets.service';
import {Observable} from 'rxjs';
import {AssetSource, Facade} from '../../../facade/facade';

@Component({
  selector: 'app-working-list',
  templateUrl: './working-list.component.html',
  styleUrls: ['./working-list.component.scss']
})
export class WorkingListComponent{
  assetsWorkingList$: Observable<IAssetsExt[]>;
  gridUid = 'assetList';

  constructor(private facade: Facade) {
    this.assetsWorkingList$ = this.facade.getAssetExt(AssetSource.workingList);
  }


}
