import {Component, OnInit} from '@angular/core';
import {CategoriesService, CategorySettingsEnum} from '../../categories.service';
import {Observable} from 'rxjs';
import {Category} from '../../models/category.model';
import {tap, withLatestFrom} from 'rxjs/operators';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {NbToastrService, NbWindowRef} from '@nebular/theme';


@Component({
  selector: 'app-edit-category-columns-dialog',
  templateUrl: './edit-category-columns-dialog.component.html',
  styleUrls: ['./edit-category-columns-dialog.component.scss']
})

export class EditCategoryColumnsDialogComponent implements OnInit {
  categories$!: Observable<Category[]>;
  treeLength = 0;
  editColumnNamesForm!: FormGroup;
  column = new FormArray([]);


  constructor(
    private categoriesService: CategoriesService,
    private fb: FormBuilder,
    private nbWindowRef: NbWindowRef,
    private nbToastrService: NbToastrService
  ) {
  }

  ngOnInit(): void {
    this.categories$ = this.categoriesService.getCategories();
    this.editColumnNamesForm = this.fb.group({column: this.column});

    this.categories$
      .pipe(
        tap((categories) => {
          categories.forEach((category) => {
            this.treeLength = category.tree.length > this.treeLength ? category.tree.length : this.treeLength;
          });
        }),
        withLatestFrom(this.categoriesService.getCatSettings())
      ).subscribe(([categories, catSettings]) => {
        let columns = [];
        if (catSettings) {
          columns = JSON.parse(catSettings.config);
        }

      for (let i = 0; i < this.treeLength; i++) {
        this.column.push(new FormGroup({
          name: new FormControl(columns[i]?.name),
          codeName: new FormControl(columns[i]?.codeName),
          useCodeAsColumn: new FormControl(columns[i]?.useCodeAsColumn)
        }));
      }
    });
  }

  submit(columnNames: FormGroup): void {
    const config = columnNames.value?.column;
    this.categoriesService.saveColumnSettings({name: CategorySettingsEnum.categoryColumnNames, config: JSON.stringify(config)})
      .subscribe(
        (result) => {
          this.nbWindowRef.close();
          this.nbToastrService.success('Nastavení hlaviček úspěšně provedeno', 'Nastavení upraveno', {duration: 2000})
        },
        error => {
          this.nbToastrService.danger(error.error?.message, 'Nastavení selhalo', )
        }
      );
  }

  dismiss(): void {
    this.nbWindowRef.close();
  }

  getControls(arrayName: string): AbstractControl[] {
    return (this.editColumnNamesForm.get(arrayName) as FormArray).controls;
  }

  setValueForColumn(column: AbstractControl): void {
    column.get('useCodeAsColumn')?.setValue(!column.get('useCodeAsColumn')?.value)
  }
}
