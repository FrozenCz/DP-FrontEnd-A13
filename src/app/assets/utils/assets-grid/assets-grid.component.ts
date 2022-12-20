/**
 * @author Milan Knop
 * @year 2021
 * @university University of Hradec Kralové
 * @bachelor_thesis Assets management in Angular framework
 */
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
  CellEditingStoppedEvent,
  CellValueChangedEvent,
  ColDef,
  GridApi,
  GridOptions, GridReadyEvent,
  RowDoubleClickedEvent,
  RowNode
} from 'ag-grid-community';
import {BehaviorSubject, combineLatest, Observable, OperatorFunction, Subject, switchMap, tap} from 'rxjs';
import {AssetsService, IAssetsExt} from '../../assets.service';
import {AgGridInstanceService} from '../../../utils/agGrid/ag-grid-instance.service';
import {AgGridFuncs} from '../../../utils/agGrid/ag-grid.funcs';
import {CategoriesService} from '../../../categories/categories.service';
import {ActivatedRoute} from '@angular/router';
import {NbWindowService} from '@nebular/theme';
import {debounceTime, filter, map, shareReplay, take, takeUntil} from 'rxjs/operators';
import {IColumnName} from '../../../categories/models/category.model';
import {AgGridExtended} from '../../../utils/agGrid/agGridExtended';
import {DialogService} from '../../../services/dialog.service';
import {FloatFilterResetComponent} from '../../../utils/agGrid/float-filter-reset/float-filter-reset.component';
import {AgGridService, AssetsSearchModeEnum} from '../../../utils/agGrid/ag-grid.service';
import {AgGrid, Grid, GridInstance, GridView} from '../../../utils/agGrid/models/grid.model';
import {AssetState} from '../../models/assets.model';


@Component({
  selector: 'app-assets-grid',
  templateUrl: './assets-grid.component.html',
  styleUrls: ['./assets-grid.component.scss']
})
export class AssetsGridComponent extends AgGridExtended implements OnInit, OnDestroy {

  @Input() assets: IAssetsExt[] = [];
  @Input() override gridUid: string = '';
  @Input() innerSelectionMode = false;
  @Input() customGridOptions?: GridOptions;
  @Input() customColDefs?: ColDef[];
  @Input() removeDefaultColDefsByColId?: string[];
  @Input() disableOpenDetailOnDoubleClick = false;
  @Output() cellValueChanged: EventEmitter<CellValueChangedEvent> = new EventEmitter<CellValueChangedEvent>();
  @Output() cellEditingStopped: EventEmitter<CellEditingStoppedEvent> = new EventEmitter<CellEditingStoppedEvent>();
  unsubscribe: Subject<void> = new Subject<void>();
  data: IAssetsExt[] = [];
  columnDefs: ColDef[] = [];
  quickFilterSub: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  quickFilter$ = this.quickFilterSub.asObservable().pipe(shareReplay());
  switchSearchMode$!: Observable<AssetsSearchModeEnum>;

  defaultColDef: ColDef = {
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    sortable: true,
    enableRowGroup: true,
    resizable: true,
    checkboxSelection: AgGridFuncs.ifColumnIsFirst,
    headerCheckboxSelection: AgGridFuncs.ifColumnIsFirst,
    headerCheckboxSelectionFilteredOnly: true,
    cellRenderer: 'filterCellRendererComponent',

    cellRendererParams: {
      context: {
        filter: this.quickFilter$
      }
    },
  };
  gridOptions: GridOptions = {};
  agGridStates$!: Observable<AgGrid | undefined>;
  viewsAsButton!: Observable<GridView[] | undefined>;
  gridContext = {};

  private doubleClickDisabled = false;
  private gridInstance!: GridInstance;
  public override gridService!: AgGridService;
  private filterString!: string;
  selectedRows: number = 0;
  searchMode: AssetsSearchModeEnum = AssetsSearchModeEnum.inRow;


  constructor(private assetsService: AssetsService,
              private categoriesService: CategoriesService,
              private route: ActivatedRoute,
              private nbWindowService: NbWindowService,
              protected override agGridInstanceService: AgGridInstanceService,
              private dialogService: DialogService
  ) {
    super();
  }

  ngOnInit(): void {

    AgGridFuncs.preventScroll();
    if (!this.innerSelectionMode) {
      this.assetsService.resetSelectedIds();
    }

    this.agGridInstanceService.getGridInstance(this.gridUid)
      .pipe(
        filter(u => !!u) as OperatorFunction<GridInstance | undefined, GridInstance>,
        take(1),
        switchMap((gridInstance) => {
          this.gridInstance = gridInstance;
          return this.gridInstance.gridService.getColumnFit$()
        }),
        takeUntil(this.unsubscribe))
      .subscribe((columnFit) => {
        this.fitColumns = columnFit
      });

    this.gridOptions = {
      ...AgGridFuncs.defaultGridOptions(this.gridUid, this.defaultColDef, this.gridState$, (d): string => {
        return d?.asset?.id;
      }),
      context: this.gridContext, suppressMiddleClickScrolls: true,
      ...this.customGridOptions,
      isExternalFilterPresent: this.isExternalFilterPresent.bind(this),
      doesExternalFilterPass: this.doesExternalFilterPass.bind(this),
      rowGroupPanelShow: 'always'
    };
    this.agGridStates$ = this.agGridInstanceService.getGrid(this.gridUid);
    this.viewsAsButton = this.agGridStates$.pipe(map(grid => grid?.gridViews.filter(view => view.showAsButton)));

    this.assetsService.assetsWorkingListIds$().subscribe(workingList => {
      this.gridOptions.context.workingListAssetsIds = workingList;
    });

    /**
     * when gridStart
     */

    this.gridReady$
      .pipe(
        switchMap((gridReady) => {
          return combineLatest([this.getColDefs(), this.gridService.getAssetsSearchMode()])
            .pipe(
              tap(([colDef, searchMode]) => {
                this.searchMode = searchMode;
                if (searchMode !== AssetsSearchModeEnum.inRow) {
                  colDef.push(
                    {
                      colId: 'finds',
                      initialHide: true,
                      hide: true,
                      headerName: 'Počet výskytů',
                      valueGetter: params => params.data?.finds
                    }
                  );
                }
                this.gridService.setColDef(colDef);
              }))
        }),
        switchMap(() => this.assetsService.getQuickFilter()))
      .pipe(debounceTime(200))
      .subscribe((filterString) => {
        switch (this.searchMode) {
          case AssetsSearchModeEnum.inRow:
            this.gridService.setQuickFilter(filterString);
            break;
          case AssetsSearchModeEnum.oneIsFine:
            this.filterString = filterString;
            this.gridService.onFilterChanged();
            this.gridService.setSort();
            break;
        }
        this.setFilterSub(filterString);
      })
  }


  /**
   * vytvari specifikaci colDef pro ag grid z pojmenovani sloupcu v kategoriích
   * @param columnCategoryNames nastaveni sloupcu z kategorii
   * @return colDef[]
   */
  private createColumnDefsFromCategoryColumnNames(columnCategoryNames: IColumnName[]): ColDef[] {
    const colDefArray: ColDef[] = [];
    let i = 0;
    for (const columnCategory of columnCategoryNames) {
      const z = i;
      colDefArray.push({
        headerName: columnCategory?.name,
        valueGetter: (params) => {
          if (params?.node?.data?.categories?.length > 0) {
            return params.node?.data.categories[z];
          }
        }
      });
      if (columnCategory.useCodeAsColumn) {
        colDefArray.push({
          headerName: columnCategory?.codeName,
          valueGetter: (params) => {
            if (params?.node?.data?.categories?.length > 0) {
              return params.node?.data.categories[(z + 1)];
            }
          }
        });
        i++;
      }
      i++;
    }
    return colDefArray;
  }

  /**
   * get ColDef[] depending on column settings if provided customColDef, filter default and add custom
   * @return Observable<ColdDef[]>
   */
  private getColDefs(): Observable<ColDef[]> {
    return this.categoriesService.getCategoryColumnNames().pipe(
      filter(colDef => !!colDef),
      map(
        (categoryColumnNames: IColumnName[]) => {
          const columnDefs: ColDef[] = [
            {
              colId: 'ordNumber',
              headerName: '#', valueGetter: (params) => {
                return (params.node?.rowIndex ? +params.node.rowIndex : 0) + 1;
              }, suppressMovable: true, width: 70, minWidth: 70,
              pinned: 'left',
              lockPinned: true,
              floatingFilterComponentFramework: FloatFilterResetComponent,
              floatingFilterComponentParams: {suppressFilterButton: true}
            },
            {colId: 'assetId', field: 'asset.id', filter: 'agTextColumnFilter', hide: true, headerName: 'ID'},
            ...this.createColumnDefsFromCategoryColumnNames(categoryColumnNames),
            {colId: 'quantity', field: 'asset.quantity', filter: 'agNumberColumnFilter', headerName: 'Počet'},
            {colId: 'inquiryPrice', field: 'asset.inquiryPrice', filter: 'agNumberColumnFilter', headerName: 'Cena'},
            {colId: 'assetName', field: 'asset.name', filter: 'agTextColumnFilter', headerName: 'Jméno majetku'},
            {
              colId: 'assetSerialNumber',
              field: 'asset.serialNumber',
              filter: 'agTextColumnFilter',
              headerName: 'Seriové číslo'
            },
            {
              colId: 'assetInventoryNumber',
              field: 'asset.inventoryNumber',
              filter: 'agTextColumnFilter',
              headerName: 'Inventární číslo'
            },
            {
              colId: 'assetEvidenceNumber',
              field: 'asset.evidenceNumber',
              filter: 'agTextColumnFilter',
              headerName: 'Evidenční číslo'
            },
            {
              colId: 'assetIdentificationNumber',
              field: 'asset.identificationNumber',
              filter: 'agTextColumnFilter',
              headerName: 'Identifikační číslo'
            },
            {
              colId: 'assetUser',
              field: 'asset.user', headerName: 'Uživatel',
              valueGetter: (params: any) => {
                if (params?.data?.asset?.user) {
                  return params.data.asset.user.surname + ' ' + params.data.asset.user.name;
                }
                return;
              },
              filter: 'agSetColumnFilter'
            },
            {colId: 'userUnit', field: 'asset.user.unit.name', headerName: 'Jednotka', filter: 'agSetColumnFilter'},
            {
              colId: 'reachable',
              cellRenderer: 'booleanCellRenderer',
              // cellRenderer: params => {
              //   if (params.value)
              //   {
              //     return '<i class="fas fa-check-circle text-success-color"></i>';
              //   }
              //   return '<i class="fas circle"></i>';
              // },
              headerName: 'Práva k editaci',
              filter: 'agSetColumnFilter',
              filterParams: {values: [true, false]},
              field: 'asset.user.reachable'
            },
            {colId: 'assetNote', headerName: 'Poznámky', field: 'asset.note'},
            {
              colId: 'akce',
              headerName: 'akce', pinned: 'right', checkboxSelection: false,
              cellRenderer: 'actionButtonsForAgGrid', width: 100,
              valueGetter: '',
              floatingFilter: false,
              suppressMenu: true,
            },
            {
              colId: 'location',
              headerName: 'Umístění',
              valueGetter: params => {
                return params.data?.asset?.location?.name
              }
            }
          ];
          return columnDefs;
        }
      ))
      .pipe(
        map((defaultColDefs) => {
            let colDefs: ColDef[] = [];
            if (!this.customColDefs) {
              colDefs = defaultColDefs;
            } else {
              colDefs = [...defaultColDefs.map(colDef => {
                return {
                  ...colDef,
                  ...this.customColDefs?.find(cd => cd.colId === colDef.colId)
                };
              }), ...this.customColDefs?.filter(cd => !defaultColDefs.map(colDef => colDef.colId).includes(cd.colId))];
            }

            if (this.removeDefaultColDefsByColId?.length) {
              return colDefs.filter(coldef => coldef.colId && !this.removeDefaultColDefsByColId?.includes(coldef.colId));
            }
            return colDefs;
          }
        ),
      );
  }

  /**
   * set column definitions for ag Grid
   * @param gridApi actual grid Api
   */
  private setColDefs(gridApi: GridApi): void {
    this.getColDefs().subscribe(colDefs => {
      setTimeout(() => {
        gridApi.setColumnDefs(colDefs);
      });
    });
  }

  /**
   * addNext Value to quickFilterSubject
   * @param filterString searched string
   */
  private setFilterSub(filterString: string): void {
    const filterArray = filterString.split(' ').map(val => val.trim()).filter(val => val.length > 0);
    this.quickFilterSub.next(filterArray);
  }

  /**
   * when agGrid ready, set up gridSubject
   * @param grid gridApi & gridColumApi
   */
  onGridReady(grid: GridReadyEvent): void {
    if (grid) {
      this.gridContext = {
        dialogService: this.dialogService,
        self: this
      };
      const gridInstance = new Grid(grid.api, grid.columnApi);
      this.gridService = this.agGridInstanceService
        .saveGridInstance(this.gridUid, gridInstance, (data: IAssetsExt) => data?.asset?.id);
      this.gridReady$.next(true);
    }
  }

  /**
   * open asset detail in dialog
   * @param params gridParams
   */
  openAssetDetail(params: any): void {
    if (!params.data) {
      return;
    }
    this.dialogService.openAssetDetail(params.node?.data?.asset?.id);
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    if (this.disableOpenDetailOnDoubleClick || this.doubleClickDisabled) {
      return;
    }
    this.openAssetDetail(event);
  }

  getContextMenuItems(params: any): any {
    const {name, id} = params.node?.data || {};

    return [
      {
        name: 'Zobrazit',
        action: () => {
          params.context.dialogService.openAssetDetail(params.node.data?.asset?.id);
        },
        icon: '<i class="fas fa-desktop text-info-color"></i>'
      },
      {
        name: 'Vybrané',
        icon: '<i class="far fa-check-square text-primary-color"></i>',
        subMenu: [
          {
            name: 'Odvybrat',
            action: () => {
              params.context.self.removeSelected();
            },
            icon: '<i class="far fa-square text-primary-color"></i>'
          },
          {
            name: 'Přidat do dočasné',
            action: () => {
              params.context.self.addSelectedToWorkingList();
            },
            icon: '<i class="fas fa-share-alt-square text-success-color"></i>'
          },
          {
            name: 'Odebrat z dočasné',
            action: () => {
              params.context.self.removeFromWorkingList();
            },
            icon: '<i class="fas fa-share-alt text-success-color"></i>'
          },
        ],
      },
      {
        name: 'Označené',
        icon: '<i class="fas fa-square text-primary-color"></i>',
        subMenu: [{
          name: 'Vybrat',
          action: () => {
            params.context.self.performSelection(params.node, true);
          },
          icon: '<i class="far fa-check-square text-primary-color"></i>'
        },
          {
            name: 'Odvybrat',
            action: () => {
              params.context.self.performSelection(params.node, false);
            },
            icon: '<i class="far fa-square text-primary-color"></i>'
          },
          {
            name: 'Přidat do dočasné',
            action: () => {
              params.context.self.performSelectionOnWorkingList(params.node, true);
            },
            icon: '<i class="fas fa-share-alt-square text-success-color"></i>'
          },
          {
            name: 'Odebrat z dočasné',
            action: () => {
              params.context.self.performSelectionOnWorkingList(params.node, false);
            },
            icon: '<i class="fas fa-share-alt text-success-color"></i>'
          },
        ]
      },
      'separator',
      'expandAll',
      'contractAll',
      'separator',
      'export',
      'separator',
      'copy',
      'copyWithHeaders'
    ];
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();

    if (this.gridInstance) {
      this.agGridInstanceService.removeGridInstance(this.gridUid);
    }

  }

  onMouseDown($event: any): void {
    const assetId = AgGridFuncs.rowClickIdExtractor($event);
    if (assetId) {
      alert('NOT IMPLEMENTED YET, ID:' + assetId);
      // window.open('');
    }
  }

  onRowSelected($event: any): void {
    const node: RowNode = $event.node;

    if (node) {
      if (node.data?.asset?.id && !this.innerSelectionMode) {
        if (node.isSelected()) {
          this.assetsService.addToSelectedInGrid(node.data.asset.id);
        } else {
          this.assetsService.removeFromSelectedInGrid(node.data.asset.id);
        }
      }
      if (node.allChildrenCount) {
        const setbool = node.isSelected();
        // node.childrenAfterGroup?.forEach(row => row.setSelected(setbool));
        node.allLeafChildren?.forEach(row => row.setSelected(!!setbool));
      }
    }
  }

  addSelectedToWorkingList(): void {
    const selectedNodes = this.gridService.getSelectedNodes().map(node => {
      this.assetsService.addAssetIdToWorkingList(node.data.asset.id);
      return node;
    });
    this.gridService.redrawRows(selectedNodes);
  }

  removeFromWorkingList(): void {
    const selectedNodes = this.gridService.getSelectedNodes().map(node => {
      this.assetsService.removeFromAssetsWorkingList(node.data.asset.id);
      return node;
    });
    this.gridService.redrawRows(selectedNodes);
  }

  performSelectionOnWorkingList(rowPressed: RowNode, select: boolean): void {
    const nodes = this.gridService.getRowNodes();
    const rangeSelections = this.gridService.getCellRanges();
    rangeSelections?.forEach(rangeSelection => {
      const startNodeIndex = Math.min(rangeSelection.startRow!.rowIndex, rangeSelection.endRow!.rowIndex);
      const endNodeIndex = Math.max(rangeSelection.startRow!.rowIndex, rangeSelection.endRow!.rowIndex);
      const redraw: RowNode[] = nodes.filter(node => node.rowIndex! >= startNodeIndex && node.rowIndex! <= endNodeIndex)
        .map(node => {
          if (select) {
            this.assetsService.addAssetIdToWorkingList(node.data?.asset?.id);
          } else {
            this.assetsService.removeFromAssetsWorkingList(node.data?.asset?.id);
          }
          return node;
        });
      setTimeout(() => {
        this.gridOptions?.api?.redrawRows({rowNodes: redraw})
      })
    });
  }

  onRowDataChanged($event: any): void {
    // console.log('onRowDataChanged', $event);
  }

  onRowDataUpdated($event: any): void {
    this.gridService.refreshCells();
  }

  onCellValueChanged($event: CellValueChangedEvent): void {
    this.cellValueChanged.emit($event);
  }

  onCellEditingStopped($event: CellEditingStoppedEvent): void {
    this.doubleClickDisabled = false;
    this.cellEditingStopped.emit($event);
  }

  onCellEditingStarted($event: any): void {
    this.doubleClickDisabled = true;
  }

  showOnlySelectedRows(bool: boolean): void {
    throw new Error('Method not implemented.');
  }

  isExternalFilterPresent(): boolean {
    return !!this.filterString;
  }

  doesExternalFilterPass(node: RowNode): boolean {
    const colDefs = this.gridService.getColumnDef();
    const multiFilters = this.filterString.split(' ');

    const cotam = multiFilters?.map((fString) => {
      const regex = new RegExp(fString, 'ig');
      const whereSearch = [...node.data.categories,
        node.data.asset?.name,
        node.data.asset?.inventoryNumber,
        node.data.asset.evidenceNumber,
        node.data.asset.identificationNumber,
        node.data.asset.user.name,
        node.data.asset.user.surname,
        node.data.asset.note,
      ];

      return whereSearch.map((where) => {
        if (!where) {
          return false;
        }
        if (where.search(regex) > -1) {
          return true;
        } else {
          return false;
        }
      }).filter(t => t === true).length > 0;
    }).filter(t => t === true);
    node.data.finds = cotam.length;
    return cotam.length > 0;
  }


}
