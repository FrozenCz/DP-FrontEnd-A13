import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DialogService} from '../../../services/dialog.service';
import {Observable, Subject} from 'rxjs';
import {ICategory} from '../../models/category.model';
import {CategoriesService} from '../../categories.service';
import {map, takeUntil} from 'rxjs/operators';
import {TokenService} from '../../../auth/token.service';
import {RightsTag} from '../../../shared/rights.list';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent implements OnInit, OnDestroy {
  @Input() categoryId!: number;
  category: ICategory | undefined = undefined;
  assetsCreateAllowed = false;
  unsubscribe = new Subject<boolean>();

  constructor(private dialogService: DialogService,
              private categoriesService: CategoriesService,
              private tokenService: TokenService) {
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
  }

  ngOnInit(): void {
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
