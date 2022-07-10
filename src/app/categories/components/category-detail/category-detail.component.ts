import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DialogService} from '../../../services/dialog.service';
import {combineLatest, Subject, switchMap, tap} from 'rxjs';
import {ICategory} from '../../models/category.model';
import {CategoriesService} from '../../categories.service';
import {map, takeUntil} from 'rxjs/operators';
import {TokenService} from '../../../auth/token.service';
import {RightsTag} from '../../../shared/rights.list';
import {AssetsService, IAssetsExt} from '../../../assets/assets.service';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent implements OnInit, OnDestroy {
  @Input() categoryId!: number;
  category: ICategory | undefined = undefined;
  assetsCreateAllowed = false;
  unsubscribe = new Subject<void>();
  assetsFilteredByCategory: IAssetsExt[] = [];

  constructor(private dialogService: DialogService,
              private categoriesService: CategoriesService,
              private assetsService: AssetsService,
              private tokenService: TokenService) {
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnInit(): void {
    this.categoriesService.getDescendants(this.categoryId)
      .pipe(
        map(cats => cats.map(c => c.name)),
        switchMap((cats) => this.assetsService.getAssets()
          .pipe(map(assets => assets.filter(a => cats.includes(a.categories[a.categories.length - 1]))))),
        takeUntil(this.unsubscribe)
      ).subscribe((assets) => {
      this.assetsFilteredByCategory = assets;
    })

    this.tokenService.getToken().pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.assetsCreateAllowed = this.tokenService.getPermission(RightsTag.createAssets);
    });
    this.categoriesService.getCategories()
      .pipe(
        takeUntil(this.unsubscribe))
      .subscribe(categories => {
        this.category = categories.find(value => value.id === this.categoryId);
      });
  }

  onNewClicked(): void {
    if (this.category) {
      this.dialogService.showCreateAssetsDialog(this.category);
    }
  }
}
