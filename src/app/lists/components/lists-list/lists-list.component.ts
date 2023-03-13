import {Component, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, Observable, Subject, Subscription, tap} from 'rxjs';
import {IAssetsList, ListsService} from '../../lists.service';
import {AgGridInstanceService} from '../../../utils/agGrid/ag-grid-instance.service';
import {ColDef, GridOptions, GridReadyEvent, RowNode} from 'ag-grid-community';
import {AgGridFuncs} from '../../../utils/agGrid/ag-grid.funcs';
import {CategoriesService} from '../../../categories/categories.service';
import {BooleanCellRenderComponent} from '../../../utils/agGrid/boolean-cell-render/boolean-cell-render.component';
import {DialogService} from '../../../services/dialog.service';
import {filter, take, takeUntil} from 'rxjs/operators';
import {AgGridExtended} from '../../../utils/agGrid/agGridExtended';
import {FloatFilterResetComponent} from '../../../utils/agGrid/float-filter-reset/float-filter-reset.component';
import {AgGridService} from '../../../utils/agGrid/ag-grid.service';
import {Grid} from '../../../utils/agGrid/models/grid.model';


@Component({
  selector: 'app-lists-list',
  templateUrl: './lists-list.component.html',
  styleUrls: ['./lists-list.component.scss']
})
export class ListsListComponent extends AgGridExtended implements OnInit, OnDestroy {

  rowData$: Observable<IAssetsList[]>;
  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    checkboxSelection: AgGridFuncs.ifColumnIsFirst,
    headerCheckboxSelection: AgGridFuncs.ifColumnIsFirst,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    sortable: true,
    enableRowGroup: true,
    resizable: true,
  };
  gridOptions: GridOptions = {};
  gridContext = {};
  override gridService!: AgGridService;
  unsubscribe = new Subject();

  constructor(
    private listsService: ListsService,
    private categoriesService: CategoriesService,
    private dialogService: DialogService,
    protected override agGridInstanceService: AgGridInstanceService) {
    super();
    this.gridUid = 'listsList';
    this.rowData$ = this.listsService.getAssetsLists();
  }

  /**
   * get ColDef[]
   * @return ColdDef[] column definition for ag grid
   */
  private static getColDefs(): ColDef[] {
    return [
      {
        headerName: '#', valueGetter: (params): number | null => {
          const rowIndex = params?.node?.rowIndex;
          if (rowIndex) {
            return rowIndex + 1;
          }
          return null;
        }, suppressMovable: true, width: 70, minWidth: 70,
        pinned: 'left',
        lockPinned: true,
        floatingFilterComponentFramework: FloatFilterResetComponent,
        floatingFilterComponentParams: {suppressFilterButton: true}
      },
      {field: 'name', filter: 'agTextColumnFilter', headerName: 'Jméno'},
      {field: 'category', filter: 'agTextColumnFilter', headerName: 'Kategorie'},
      {field: 'connected', filter: 'agSetColumnFilter', headerName: 'Svázaná', cellRenderer: 'booleanCellRenderer',
        filterParams: { values: [true, false]},
      },
      {field: 'description', filter: 'agTextColumnFilter', headerName: 'Popis'},
      {
        valueGetter: (params) => {
          return params.node?.data?.assets?.length;
        }, filter: 'agTextColumnFilter', headerName: 'Počet položek'
      },
      {field: 'archived', filter: 'agSetColumnFilter', headerName: 'Archivovaná', cellRenderer: 'booleanCellRenderer',
        filterParams: { values: [true, false]} },
      {field: 'created', filter: 'agDateColumnFilter', headerName: 'Vytvořena', valueFormatter: this.dateTimeFormatter},
      {field: 'updated', filter: 'agDateColumnFilter', headerName: 'Upravena', valueFormatter: this.dateTimeFormatter},
    ];
  }


  ngOnInit(): void {


    this.agGridInstanceService.getGridInstance(this.gridUid)
      .pipe(filter(e => !!e), take(1)).subscribe(instance => {
        if (instance) {
          this.gridService = instance.gridService;
          this.gridService.getColumnFit$().pipe(takeUntil(this.unsubscribe)).subscribe(columnFit => this.fitColumns = columnFit);
        }
    });

    AgGridFuncs.preventScroll();
    const gridOptionsDefault = {
      ...AgGridFuncs.defaultGridOptions(this.gridUid, this.defaultColDef, this.gridState$,
        (params) => {
          return params.id;
        })
    };
    this.gridOptions = {
      ...gridOptionsDefault,
      frameworkComponents: {...gridOptionsDefault.frameworkComponents, booleanCellRenderer: BooleanCellRenderComponent}
    };

    this.gridReady$.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.gridService.setColDef(ListsListComponent.getColDefs());
    });
  }

  onGridReady(grid: GridReadyEvent): void {
    if (grid) {
      this.gridContext = {dialogService: this.dialogService};
      const gridInstance = new Grid(grid.api, grid.columnApi);
      this.agGridInstanceService.saveGridInstance(this.gridUid, gridInstance, (iAssetsList: any) => iAssetsList.id );
      this.gridReady$.next(true);
    }
  }

  getContextMenuItems(params: any): any {
    const {name, id} = params.node?.data || {};

    return [
      {
        name: 'Zobrazit',
        action: () => {
          params.context.dialogService.showList(id, name);
        },
        icon: '<i class="fas fa-list text-info-color"></i>'
      },
      {
        name: 'Smazat',
        action: () => {
          params.context.dialogService.showConfirmDeleteAssetsList(id, name);
        },
        icon: '<i class="fas fa-minus text-danger-color"></i>'
      }
    ];
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.agGridInstanceService.removeGridInstance(this.gridUid);
  }


  onRowDoubleClicked($event: any): void {
    const row: RowNode = $event.node;
    if (row.data?.id) {
      this.dialogService.showList(row.data.id, row.data.name);
    }
  }

  onMouseDown($event: MouseEvent): void {
    const listId = AgGridFuncs.rowClickIdExtractor($event);
    if (listId) {
      window.open('/lists/list/' + listId, '_blank');
      window.focus();
    }
  }
}
