import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AssetsService, IAssetsExt, IAssetsExtFilter} from '../../assets.service';
import {Subject} from 'rxjs';
import {takeUntil, tap} from 'rxjs/operators';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss']
})

export class AssetsListComponent implements OnInit, OnDestroy{
  @Input() filter!: IAssetsExtFilter;
  assets: IAssetsExt[] = [];
  gridUid = 'assetList';
  unsubscribe: Subject<void> =  new Subject<void>()

  constructor(private assetsService: AssetsService) {
  }

  ngOnInit(): void {
    this.assetsService.getAssets(this.filter)
      .pipe(
        takeUntil(this.unsubscribe)
      )
      .subscribe(assets => {
        this.assets = assets;
          // console.log(assets);
        }

      );
  }

  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

}




