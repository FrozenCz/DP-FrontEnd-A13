import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CategoriesService} from '../../categories.service';
import {NbComponentStatus, NbDialogRef, NbToastrService, NbTrigger} from '@nebular/theme';
import { withLatestFrom} from 'rxjs/operators';
import {ICategory} from '../../models/category.model';
import {Subject} from 'rxjs';


@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.scss']
})
export class CategoryEditComponent implements OnInit, OnDestroy {
  @Input() categoryId!: number;
  category: ICategory;
  categories: ICategory[] = [];
  editCategoryForm: FormGroup;
  categoryNameStatus: NbComponentStatus = 'basic';
  categoryCodeStatus: NbComponentStatus = 'info';
  unsubscribe: Subject<void> = new Subject<void>();
  triggerNoop = NbTrigger.NOOP;


  constructor(
    private categoriesService: CategoriesService,
    private nbDialogRef: NbDialogRef<CategoryEditComponent>,
    private formBuilder: FormBuilder,
    private nbToastrService: NbToastrService
  ) {
     const category = this.categoriesService.getCategoryById(this.categoryId);
    if (!category) {
      throw new Error('');
    } else {
      this.category = category;
    }
    this.editCategoryForm = this.formBuilder.group({
      name: [this.category.name, [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-zÁ-ž0-9 ]*$/)]],
      code: [this.category.code, [Validators.maxLength(20), Validators.pattern(/^[A-zÁ-ž0-9 ]*$/)]],
    });

  }


  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  ngOnInit(): void {

    if(!this.category) {
      this.nbDialogRef.close();
      this.nbToastrService.danger('nenalezena', 'Kategorie');
    }

    this.editCategoryForm.controls['name'].valueChanges
      .pipe(withLatestFrom(this.categoriesService.getCategories()))
      .subscribe(
        ([value, categories]) => {
          if (categories.find(category => category.name.toLowerCase() === value.toLowerCase().trim())) {
            this.categoryNameStatus = 'warning';
          } else if (value.length > 0) {
            this.categoryNameStatus = this.editCategoryForm.controls['name'].valid ? 'success' : 'warning';
          } else {
            this.categoryNameStatus = 'basic';
          }
        }
      );

  }



  submit(): void {
    const {name, code = null} = this.editCategoryForm.value || {};
    if (name) {
      this.categoriesService.updateCategory(name.trim(), code.trim(), this.categoryId).subscribe(
        (newCategory) => {
          if (newCategory) {
            this.dismiss();
            this.nbToastrService.success('úspěšně změněna', 'Kategorie', {duration: 2000});
          }
        },
        error => {
          this.nbToastrService.danger(error.error.message, 'Kategorie nebyla změněna');
        }
      );
    }
  }

  dismiss(): void {
    this.nbDialogRef.close();
  }

}
