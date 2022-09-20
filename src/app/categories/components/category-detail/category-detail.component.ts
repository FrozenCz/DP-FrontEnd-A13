import {Component, Input, OnInit} from '@angular/core';
import {DialogService} from '../../../services/dialog.service';
import {firstValueFrom, Observable, switchMap} from 'rxjs';
import {Category} from '../../models/category.model';
import {CategoriesService} from '../../categories.service';
import {map} from 'rxjs/operators';
import {TokenService} from '../../../auth/token.service';
import {RightsTag} from '../../../shared/rights.list';
import {IAssetsExt} from '../../../assets/assets.service';
import {AssetSource, Facade} from '../../../facade/facade';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent implements OnInit {
  @Input() categoryId!: number;
  category$!: Observable<Category>;
  assetsCreateAllowed$: Observable<boolean>;
  assetsFilteredByCategory$!: Observable<IAssetsExt[]>;

  constructor(private dialogService: DialogService,
              private categoriesService: CategoriesService,
              private tokenService: TokenService,
              private facade: Facade
  ) {
    this.assetsCreateAllowed$ = this.tokenService.getPermission$(RightsTag.createAssets);
  }

  ngOnInit(): void {
    this.assetsFilteredByCategory$ = this.categoriesService.getDescendants(this.categoryId)
      .pipe(
        map(cats => cats.map(c => c.name)),
        switchMap((cats) => this.facade.getAssetExt(AssetSource.STORE)
          .pipe(
            map(assets => assets.filter(a => cats.includes(a.categories[a.categories.length - 1]))))),
      )
    this.category$ = this.categoriesService.getCategoryById(this.categoryId);
  }

  onNewClicked(): void {
    firstValueFrom(this.category$).then(category => {
      this.dialogService.showCreateAssetsDialog(category);
    })
  }
}
