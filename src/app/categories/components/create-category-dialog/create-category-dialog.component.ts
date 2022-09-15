import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {DefaultCategory, Category} from '../../models/category.model';
import {CategoriesService} from '../../categories.service';
import {NbComponentStatus, NbDialogRef, NbToastrService, NbTrigger} from '@nebular/theme';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {map, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-create-category-dialog',
  templateUrl: './create-category-dialog.component.html',
  styleUrls: ['./create-category-dialog.component.scss']
})
export class CreateCategoryDialogComponent implements OnInit, OnDestroy {
  @Input() parentCategoryId!: number;
  categories: (Category | DefaultCategory)[] = [];
  unsubscribe: Subject<void> = new Subject<void>();
  defaultCategory: DefaultCategory = {
    name: 'Hlavní kategorie',
    tree: [],
    children: [],
    id: null,
    parent: null,
    columnValues: [],
    treeIds: [],
    parentName: null
  };
  createCategoryForm: FormGroup;
  categoryNameStatus: NbComponentStatus = 'basic';
  categoryCodeStatus: NbComponentStatus = 'info';
  trigger: NbTrigger = NbTrigger.NOOP;



  constructor(
    private categoriesService: CategoriesService,
    private nbDialogRef: NbDialogRef<CreateCategoryDialogComponent>,
    private formBuilder: FormBuilder,
    private nbToastrService: NbToastrService
  ) {
    this.createCategoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-zÁ-ž0-9 ]*$/)]],
      code: ['', [Validators.maxLength(20), Validators.pattern(/^[A-zÁ-ž0-9 ]*$/)]],
      parentCategory: [this.defaultCategory]
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }


  ngOnInit(): void {

    this.categoriesService.getCategories()
      .pipe(
        map((categories) => {
          if (this.parentCategoryId) {
            const parentCategory = categories.find(category => category.id === this.parentCategoryId);
            this.createCategoryForm.patchValue({parentCategory});
          }
          return [this.defaultCategory, ...categories];
        }),
        takeUntil(this.unsubscribe)
      ).subscribe(categories => {
      this.categories = categories
    })



    this.createCategoryForm.controls['name'].valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([value]) => {
          if (this.categories.find(category => category.name?.toLowerCase() === value.toLowerCase().trim())) {
            this.categoryNameStatus = 'warning';
            // this.createCategoryForm.controls.name.setErrors({exists: 'name already exists'});
          } else if (value.length > 0) {
            this.categoryNameStatus = this.createCategoryForm.controls['name'].valid ? 'success' : 'warning';
          } else {
            this.categoryNameStatus = 'basic';
          }
        }
      );

  }


  submit(): void {
    const {name, code = null, parentCategory = null} = this.createCategoryForm.value || {};
    if (name) {
      this.categoriesService.createCategory(name.trim(), code.trim(), parentCategory?.id).subscribe(
        (newCategory) => {
          if (newCategory) {
            this.dismiss();
            this.nbToastrService.success('Kategorie úspěšně vytvořena', 'Kategorie vytvořena', {duration: 2000});
          }
        },
        error => {
          this.nbToastrService.danger(error.error.message, 'Kategorie nebyla vytvořena');
        }
      );
    }
  }

  dismiss(): void {
    this.nbDialogRef.close();
  }

}
