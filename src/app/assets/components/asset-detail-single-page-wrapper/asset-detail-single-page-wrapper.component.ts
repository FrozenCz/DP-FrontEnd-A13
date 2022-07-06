import {Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-asset-detail-single-page-wrapper',
  templateUrl: './asset-detail-single-page-wrapper.component.html',
  styleUrls: ['./asset-detail-single-page-wrapper.component.scss']
})
export class AssetDetailSinglePageWrapperComponent implements OnInit, OnDestroy {
  unsubscribe: Subject<boolean> = new Subject<boolean>();
  assetId!: number;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.unsubscribe)).subscribe((routeParams) => {
      if (routeParams['id']) {
        this.assetId = +routeParams['id'];
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
  }

}
