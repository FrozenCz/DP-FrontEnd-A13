import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {AssetsService, IAssetsExt} from '../../assets.service';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-assets-dashboard',
  templateUrl: './assets-dashboard.component.html',
  styleUrls: ['./assets-dashboard.component.scss']
})
export class AssetsDashboardComponent implements OnDestroy {
  unsubscribe: Subject<void> = new Subject<void>();
  assets: IAssetsExt[] = []

  constructor(private assetsService: AssetsService) {
    this.assetsService.getAssets().pipe(takeUntil(this.unsubscribe))
      .subscribe(assets => this.assets = assets)
  }

  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

}
