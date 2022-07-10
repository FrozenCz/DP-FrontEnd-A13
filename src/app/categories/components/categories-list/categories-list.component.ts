import {Component, OnDestroy, OnInit} from '@angular/core';
import {CategoriesService} from '../../categories.service';
import {combineLatest, Observable, Subject, Subscription} from 'rxjs';
import {ICategoryWithColumnNames} from '../../models/category.model';
import {ColDef, GridApi, GridOptions, GridReadyEvent} from 'ag-grid-community';
import {NbDialogService, NbWindowService} from '@nebular/theme';
import {ContextMenuItem} from '../../../utils/agGrid/contextMenuItem.interface';
import {map, takeUntil} from 'rxjs/operators';
import {BooleanCellRenderComponent} from '../../../utils/agGrid/boolean-cell-render/boolean-cell-render.component';
import {CategoryDetailComponent} from '../category-detail/category-detail.component';
import {CreateCategoryDialogComponent} from '../create-category-dialog/create-category-dialog.component';
import {DeleteCategoryDialogComponent} from '../delete-category-dialog/delete-category-dialog.component';
import {CategoryEditComponent} from '../category-edit/category-edit.component';
import {AG_GRID_LOCALE_CS} from '../../../utils/agGrid/locale.cs';
import {TokenService} from '../../../auth/token.service';
import {RightsTag} from '../../../shared/rights.list';


@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss']
})

export class CategoriesListComponent implements OnInit, OnDestroy {
  categoriesWithColumnNames: ICategoryWithColumnNames[] = [];
  unsubscribe: Subject<void> = new Subject<void>();

  storedFilterModel: any;
  columnDefs: ColDef[] = [
    {field: 'code', headerName: 'Kód'},
    {field: 'name', headerName: 'Název sloupce kategorie'},
    {field: 'codeName', headerName: 'Název kódového sloupce'},
    {field: 'useCodeAsColumn', headerName: 'Kód jako samostatný sloupec', cellRenderer: 'booleanCellRendererComponent'}
  ];
  autoGroupColumnDef = {
    headerName: 'Kategorie',
    cellRendererParams: {suppressCount: true}
  };

  gridApi!: GridApi;
  gridOptions: GridOptions = {
    localeText: AG_GRID_LOCALE_CS,
    treeData: true,
    animateRows: true,
    suppressCellSelection: true,
    defaultColDef: {
      sortable: true,
      floatingFilter: true,
      filter: 'agTextColumnFilter',
      enableRowGroup: true,
    },
    rowSelection: 'single',
    sideBar: {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Sloupce',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
        },
        {
          id: 'filters',
          labelDefault: 'Filtry',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
        }
      ],
      hiddenByDefault: false
    },
    frameworkComponents: {
      booleanCellRendererComponent: BooleanCellRenderComponent
    }
  };
  gridContext = {
    nbWindowService: this.nbWindowService,
    nbDialogService: this.nbDialogService,
    permissions: {
      categoriesCreateAllowed: false,
      categoriesDeleteAllowed: false,
      categoriesEditAllowed: false,
    }
  };

  constructor(
    private categoriesService: CategoriesService,
    private nbWindowService: NbWindowService,
    private nbDialogService: NbDialogService,
    private tokenService: TokenService
  ) {
  }

  ngOnInit(): void {
    this.tokenService.getToken().pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.gridContext.permissions.categoriesCreateAllowed = this.tokenService.getPermission(RightsTag.createCategory);
      this.gridContext.permissions.categoriesDeleteAllowed = this.tokenService.getPermission(RightsTag.deleteCategory);
      this.gridContext.permissions.categoriesEditAllowed = this.tokenService.getPermission(RightsTag.updateCategory);
    });

    combineLatest(
      [this.categoriesService.getCategories(), this.categoriesService.getCategoryColumnNames()])
      .pipe(
        map(([categories, columnNames]) => {
          const catWithNames: ICategoryWithColumnNames[] = categories.map((category) => {
            if (!columnNames?.length) {
              columnNames = [];
            }
            return {
              ...category,
              name: columnNames[category.tree.length - 1]?.name,
              codeName: columnNames[category.tree.length - 1]?.codeName,
              useCodeAsColumn: columnNames[category.tree.length - 1]?.useCodeAsColumn
            };
          });
          return catWithNames;
        }),
        takeUntil(this.unsubscribe),
      ).subscribe(categoriesWithColumnName => {
      this.categoriesWithColumnNames = categoriesWithColumnName;
    })

  }

  onGridSizeChanged(): void {
    this.gridApi?.sizeColumnsToFit();
  }

  filterSet(): void {
    this.storedFilterModel = this.gridApi.getFilterModel();
  }

  onGridReady($event: GridReadyEvent): void {
    this.gridApi = $event.api;

    // byl subscribe na names why?
      if (this.storedFilterModel) {
        setTimeout(() => {
          this.gridApi.setFilterModel(this.storedFilterModel);
        });
      }

  }

  getDataPath = (data: any) => {
    return data.tree;
  }

  getContextMenuItems(params: any): any {
    const contextMenuItems: (ContextMenuItem | string)[] = [];
    const permissions = params.context.permissions;


    contextMenuItems.push({
      name: 'Detail kategorie',
      action: () => {
        params.context.nbWindowService.open(CategoryDetailComponent, {
          title: params.node?.data?.tree.join(' | '),
          context: {
            categoryId:  params.node?.data?.id
          },
          closeOnBackdropClick: false
        });
      },
      icon: '&#9871;'
    });
    contextMenuItems.push('separator');
    if (permissions.categoriesCreateAllowed) {
      contextMenuItems.push({
        name: 'Přidání podkategorie',
        action: () => {
          params.context.nbDialogService.open(CreateCategoryDialogComponent, {
            title: params.node?.data?.tree.join(' | '),
            context: {
              parentCategoryId: params.node?.data?.id
            },
            closeOnBackdropClick: false
          });
        },
        icon: '<i class="fas fa-plus text-primary-color"></i>'
      });
    }

    if (permissions.categoriesEditAllowed) {
      contextMenuItems.push({
        name: 'Editace kategorie',
        action: () => {
          params.context.nbDialogService.open(CategoryEditComponent, {
            title: params.node?.data?.tree.join(' | '),
            context: {
              categoryId: params.node?.data?.id
            },
            closeOnBackdropClick: false
          });
        },
        icon: '<i class="far fa-edit text-warning-color"></i>'
      });
    }
    if (permissions.categoriesDeleteAllowed) {
      contextMenuItems.push({
        name: 'Smazání kategorie',
        action: () => {
          params.context.nbDialogService.open(DeleteCategoryDialogComponent, {
            title: params.node?.data?.tree.join(' | '),
            context: {
              deletedCategoryId: params.node?.data?.id
            },
            closeOnBackdropClick: false
          });
        },
        icon: '<i class="fas fa-minus text-danger-color"></i>'
      });
    }

    return [
      ...contextMenuItems,

      'copy',
      'separator',
      'csvExport',
      'excelExport',
      'separator',
      'expandAll',
      'contractAll',
    ];
  }

  openCategoryDetail(params: any): void {
    params.context.nbWindowService.open(CategoryDetailComponent, {
      title: params.node?.data?.tree.join(' | '),
      context: {
        categoryId:  params.node?.data?.id
      },
      closeOnBackdropClick: false
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
