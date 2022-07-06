import {Component, OnDestroy} from '@angular/core';
import {AssetsService, IAssetsExt} from '../../../assets/assets.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-working-list',
  templateUrl: './working-list.component.html',
  styleUrls: ['./working-list.component.scss']
})
export class WorkingListComponent implements OnDestroy{
  assetsWorkingList: IAssetsExt[] = [];
  gridUid = 'assetList';
  unsubscribe: Subject<void> = new Subject<void>();

  constructor(private assetsService: AssetsService) {
    this.assetsService.getAssetsWorkingList$()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(assets => this.assetsWorkingList = assets);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

}
