import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CategoriesComponent} from './categories.component';
import { CategoriesListComponent } from './components/categories-list/categories-list.component';
import {RouterModule} from '@angular/router';
import { CreateCategoryDialogComponent } from './components/create-category-dialog/create-category-dialog.component';
import {
    NbActionsModule,
    NbButtonModule,
    NbCardModule, NbCheckboxModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule, NbSpinnerModule, NbTabsetModule,
    NbTooltipModule
} from '@nebular/theme';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexModule} from '@angular/flex-layout';
import {AgGridModule} from 'ag-grid-angular';
import { EditCategoryColumnsDialogComponent } from './components/edit-category-columns-dialog/edit-category-columns-dialog.component';
import {BooleanCellRenderComponent} from '../utils/agGrid/boolean-cell-render/boolean-cell-render.component';
import { CategoryDetailComponent } from './components/category-detail/category-detail.component';
import {CategoriesRoutingModule} from './categories-routing.module';
import {AssetsModule} from '../assets/assets.module';
import { DeleteCategoryDialogComponent } from './components/delete-category-dialog/delete-category-dialog.component';
import { CategoryEditComponent } from './components/category-edit/category-edit.component';
import { ChooseFirstCategoryDialogComponent } from './components/choose-first-category-dialog/choose-first-category-dialog.component';

@NgModule({
  declarations: [
    CategoriesComponent,
    CategoriesListComponent,
    CreateCategoryDialogComponent,
    EditCategoryColumnsDialogComponent,
    CategoryDetailComponent,
    DeleteCategoryDialogComponent,
    CategoryEditComponent,
    ChooseFirstCategoryDialogComponent
  ],
    imports: [
        CategoriesRoutingModule,
        CommonModule,
        RouterModule,
        NbCardModule,
        NbIconModule,
        ReactiveFormsModule,
        NbButtonModule,
        FlexModule,
        NbInputModule,
        NbTooltipModule,
        NbFormFieldModule,
        NbSelectModule,
        NbCheckboxModule,
        AgGridModule.withComponents(BooleanCellRenderComponent),
        FormsModule,
        NbTabsetModule,
        NbActionsModule,
        AssetsModule,
        NbSpinnerModule
    ]
})
export class CategoriesModule { }
