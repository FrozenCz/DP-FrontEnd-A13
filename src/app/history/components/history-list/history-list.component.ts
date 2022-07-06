import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ColDef, GridOptions, GridReadyEvent, RowNode} from 'ag-grid-community';
import {AgGridFuncs} from '../../../utils/agGrid/ag-grid.funcs';
import {combineLatest, Observable, OperatorFunction, Subject} from 'rxjs';
import {FloatFilterResetComponent} from '../../../utils/agGrid/float-filter-reset/float-filter-reset.component';
import {filter, take, takeUntil} from 'rxjs/operators';
import {DialogService} from '../../../services/dialog.service';
import {AgGridInstanceService} from '../../../utils/agGrid/ag-grid-instance.service';
import {AgGridExtended} from '../../../utils/agGrid/agGridExtended';
import {BooleanCellRenderComponent} from '../../../utils/agGrid/boolean-cell-render/boolean-cell-render.component';
import {HistoryService} from '../../history.service';
import {Grid, GridInstance} from '../../../utils/agGrid/models/grid.model';
import {HistoryModel, IHistoryInList} from '../../models/history.model';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss']
})
export class HistoryListComponent extends AgGridExtended implements OnInit, OnDestroy {
  @Input() assetId!: number;
  @Input() override gridUid = 'historyList';
  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    checkboxSelection: false,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    sortable: true,
    enableRowGroup: true,
    resizable: true,
  };
  gridOptions: GridOptions = {};
  gridContext = {};
  unsubscribe = new Subject();
  source!: Observable<HistoryModel[]>;

  constructor(private dialogService: DialogService,
              protected override agGridInstanceService: AgGridInstanceService,
              private historyService: HistoryService
  ) {
    super();
  }

  /**
   * get ColDef[]
   * @return ColdDef[] column definition for ag grid
   */
  private static getColDefs(): ColDef[] {
    return [
      {
        headerName: '#', valueGetter: (params) => {
          if (!params.node) return;
          const row = params.node.rowIndex ? +params.node.rowIndex : 0;
          return row + 1;
        }, suppressMovable: true, width: 70, minWidth: 70,
        pinned: 'left',
        lockPinned: true,
        checkboxSelection: AgGridFuncs.ifColumnIsFirst,
        headerCheckboxSelection: AgGridFuncs.ifColumnIsFirst,
        floatingFilterComponentFramework: FloatFilterResetComponent,
        floatingFilterComponentParams: {suppressFilterButton: true}
      },
      {
        field: 'relatedTo', filter: 'agSetColumnFilter', headerName: 'Typ změny',
        valueGetter: params => HistoryService.translateRelatedToEnum(params.data?.relatedTo)?.name,
        cellRenderer: (params: any) => {
          if (params.data?.relatedTo) {
            const hr = HistoryService.translateRelatedToEnum(params.data?.relatedTo);
            return hr?.icon + ' ' + hr?.name;
          } else {
            const hr = HistoryService.translateRelatedToEnum(params.node?.allLeafChildren[0]?.data?.relatedTo);
            return hr?.icon + ' ' + hr?.name;
          }
        },
        showRowGroup: false
      },
      {
        field: 'changedBy',
        filter: 'agSetColumnFilter',
        headerName: 'Provedl',
        valueGetter: params => {
          if (params.data?.changedBy) {
            return params.data?.changedBy?.surname + ' ' + params.data?.changedBy?.name;
          }
          return '';
        }
      },
      {
        field: 'unit',
        filter: 'agSetColumnFilter',
        headerName: 'Jednotka',
        valueGetter: params => params.data?.changedBy?.unit?.name
      },
      {
        field: 'changeFrom',
        filter: 'agTextColumnFilter',
        headerName: 'Změna z',
        valueGetter: params => HistoryService.humanReadableChanges(params.data?.changedFrom, params.data?.relatedTo)
      },
      {
        field: 'changeTo',
        filter: 'agTextColumnFilter',
        headerName: 'Změna na',
        valueGetter: params => HistoryService.humanReadableChanges(params.data?.changedTo, params.data?.relatedTo)
      },
      {field: 'created', filter: 'agDateColumnFilter', headerName: 'Provedena', valueFormatter: this.dateTimeFormatter},
    ];
  }

  ngOnInit(): void {
    if (this.assetId) {
      this.source = this.historyService.getHistoryListForAsset(this.assetId);
    } else {
      this.source = this.historyService.getHistoryList();
    }

    this.agGridInstanceService.getGridInstance(this.gridUid)
      .pipe(
        filter(e => !!e) as OperatorFunction<GridInstance | undefined, GridInstance>,
        take(1))
      .subscribe(instance => {
        this.gridService = instance.gridService;
        this.gridService.getColumnFit$().pipe(takeUntil(this.unsubscribe)).subscribe(columnFit => this.fitColumns = columnFit);
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
      this.gridService.setColDef(HistoryListComponent.getColDefs());
    });

    combineLatest([this.source, this.gridReady$])
      .pipe(takeUntil(this.unsubscribe))
      .pipe(
        filter(([historyList, gridReady]) => !!gridReady && !!historyList)
      )
      .subscribe(([historyList, g]) => {
        this.gridService.setRowData(historyList);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.agGridInstanceService.removeGridInstance(this.gridUid);
  }

  onGridReady(grid: GridReadyEvent): void {
    if (grid) {
      this.gridContext = {
        dialogService: this.dialogService,
        historyService: this.historyService
      };
      const newGrid = new Grid(grid.api, grid.columnApi)
      this.agGridInstanceService.saveGridInstance(this.gridUid, newGrid, (history: IHistoryInList) => history.id);
      this.gridReady$.next(true);
    }
  }


  getContextMenuItems(params: any): any {
    const {name, id} = params.node?.data || {};
    return [
      {
        name: 'Zobrazit',
        action: () => {
          const historyModel = params.context.historyService.getAssetHistoryById(params.node?.data.asset.id);
          params.context.dialogService.showHistoryDetail(historyModel);
        },
        icon: '<i class="far fa-clock text-info-color"></i>'
      },
      'separator',
      'copyWithHeaders',
      'copy',
      'separator',
      'csvExport',
      'excelExport',
      // 'separator',
      // 'chartRange'
    ];
  }

  onRowDoubleClicked($event: any): void {
    const row: RowNode = $event.node;
    if (row.data?.asset?.id) {
      const historyModel = this.historyService.getAssetHistoryById(row.data?.asset?.id);
      if (historyModel) {
        this.dialogService.showHistoryDetail(historyModel);
      }
    }
  }

  onMouseDown($event: MouseEvent): void {
    // const listId = AgGridFuncs.rowClickIdExtractor($event);
    // if (listId) {
    //   window.open('/lists/list/' + listId, '_blank');
    //   window.focus();
    // }
  }


}
