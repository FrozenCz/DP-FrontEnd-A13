import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NbDialogRef, NbToastrService} from '@nebular/theme';
import {CategoriesService} from '../../categories.service';
import {take, takeUntil, tap} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-delete-category-dialog',
  templateUrl: './delete-category-dialog.component.html',
  styleUrls: ['./delete-category-dialog.component.scss']
})
export class DeleteCategoryDialogComponent implements OnInit, OnDestroy {
  @Input() deletedCategoryId!: number;
  ableToDelete: boolean = false;
  unsubscribe: Subject<void> = new Subject<void>();
  checkComplete: boolean = false;

  constructor(private dialogRef: NbDialogRef<DeleteCategoryDialogComponent>,
              private categoriesService: CategoriesService,
              private nbToastrService: NbToastrService) { }

  ngOnInit(): void {
    this.categoriesService.isAbleToDelete(this.deletedCategoryId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((isAble) => {
      this.ableToDelete = isAble;
      this.checkComplete = true;
    })
  }

  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  dismiss(): void {
    this.dialogRef.close();
  }

  deleteCategory(deletedCategoryId: number): void {
    this.categoriesService.deleteCategory(deletedCategoryId)
      .pipe(take(1))
      .subscribe(() => {
        this.dialogRef.close();
        this.nbToastrService.success('smazána', 'Kategorie', {icon: 'grid-outline'});
      },
        () => {
          this.nbToastrService.danger('nebyla smazána', 'Kategorie', {icon: 'grid-outline'});
        }
        );
  }
}
