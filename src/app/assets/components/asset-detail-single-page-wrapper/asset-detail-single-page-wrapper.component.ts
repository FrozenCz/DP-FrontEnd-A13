import {Component, OnDestroy, OnInit} from '@angular/core';
import {switchMap, takeUntil, tap} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {firstValueFrom, Observable, Subject} from 'rxjs';
import {Asset} from '../../models/assets.model';
import {AssetsService} from '../../assets.service';
import {AssetDetailPermissions} from '../asset-detail/asset-detail.component';
import {Category} from '../../../categories/models/category.model';
import {CategoriesService} from '../../../categories/categories.service';

@Component({
  selector: 'app-asset-detail-single-page-wrapper',
  templateUrl: './asset-detail-single-page-wrapper.component.html',
  styleUrls: ['./asset-detail-single-page-wrapper.component.scss']
})
export class AssetDetailSinglePageWrapperComponent implements OnInit {
  asset$!: Observable<Asset>;
  permissions!: AssetDetailPermissions;
  category: Category | undefined;

  constructor(private route: ActivatedRoute, private assetService: AssetsService, private categoryService: CategoriesService) {
  }

  ngOnInit(): void {
    this.asset$ = this.route.params.pipe(
      switchMap(routeParams => {
        const assetId = +routeParams['id'];
        if (!assetId) {
          throw new Error('You must specify id of asset');
        }
        return this.assetService.assetsStore$.getOne$(assetId).pipe(tap(asset => {
          firstValueFrom(this.categoryService.categoriesStore$.getOne$(asset.category_id)).then(category => {
            this.category = category;
          })
        }))
      }))
  }


}
