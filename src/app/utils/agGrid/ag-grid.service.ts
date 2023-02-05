import {Inject, Injectable, Optional} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {ICellEditor} from 'ag-grid-community/dist/lib/interfaces/iCellEditor';
import {CellRange, ColDef, ColGroupDef, ColumnState, GridReadyEvent, RowNode} from 'ag-grid-community';
import {filter} from 'rxjs/operators';
import {Grid, GridView} from './models/grid.model';


export type GetIdFromDataFunction = (params: any) => number;

export type GetReachableFunction = (n: RowNode) => boolean;

export enum AssetsSearchModeEnum {
  inRow,
  oneIsFine,
}

@Injectable({
  providedIn: 'any'
})
export class AgGridService {
  private showOnlySelectedRows$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private fitColumns$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private data$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private assetsSearchMode$: BehaviorSubject<AssetsSearchModeEnum> = new BehaviorSubject<AssetsSearchModeEnum>(AssetsSearchModeEnum.inRow);

  // todo: look for inject
  constructor(private grid: Grid, @Inject(Number) getIdFromDataForRows: GetIdFromDataFunction) {
    combineLatest([this.showOnlySelectedRows$, this.data$])
      .pipe(filter(([showOnly, data]) => !!data))
      .subscribe(([showOnlySelectedRows, data]) => {
        if (showOnlySelectedRows) {
          // this.grid.api.setRowData(data.filter(d => this.getSelectedIds().includes(getIdFromDataForRows(d))));
        } else {
          // this.grid.api.setRowData(data);
        }
      });
  }

  private static getRowNodes(grid: Grid): RowNode[] {
    const nodes: RowNode[] = [];
    grid.api.forEachNodeAfterFilterAndSort((node) => {
      nodes.push(node);
    });
    return nodes;
  }

  showOnlySelectedRows(): Observable<boolean> {
    return this.showOnlySelectedRows$.asObservable();
  }

  toggleShowOnlySelectedRows(): void {
    this.showOnlySelectedRows$.next(!this.showOnlySelectedRows$.getValue());
  }


  resetView(): void {
    this.grid.api.setFilterModel(null);
    this.grid.columnApi.resetColumnState();
    this.grid.api.sizeColumnsToFit();
  }

  flexGrid(): void {
    this.grid.api.sizeColumnsToFit();
  }

  setColumnFit(newValue: boolean): void {
    this.fitColumns$.next(newValue);
    if (newValue) {
      this.flexGrid();
    }
  }

  getColumnFit$(): Observable<boolean> {
    return this.fitColumns$.asObservable();
  }

  loadView(view: GridView): void {
    const fitTo = !!view?.fitColumns;
    this.setColumnFit(fitTo);
    this.grid.columnApi.setColumnState(view.columnState);
    this.grid.api.setFilterModel(view.filterModel);
    if (fitTo) {
      this.grid.api.sizeColumnsToFit();
    }
  }

  // --- ROWS --- ///
  deselectAll(): void {
    this.grid.api.deselectAll();
    this.grid.api.clearRangeSelection();
  }

  redrawRows(rowNodes?: RowNode[]): void {
    this.grid.api.redrawRows({rowNodes});
  }

  // --- CELLS --- //
  getCellEditorInstances(): ICellEditor[] {
    return this.grid.api.getCellEditorInstances();
  }


  // setSelectableForReachableRows(getReachableFrom: GetReachableFunction): void {
  //   let justFromStart = true;
  //   combineLatest(([this.showOnlySelectedRows$])).subscribe(() => {
  //     setTimeout(() => {
  //       this.grid.api.forEachNodeAfterFilterAndSort((node) => {
  //         const reachable = getReachableFrom(node);
  //         if (justFromStart) {
  //           node.setSelected(reachable);
  //         }
  //         node.selectable = reachable;
  //       });
  //       this.grid.api.redrawRows();
  //       justFromStart = false;
  //     });
  //   });
  // }

  refreshCells(): void {
    this.grid.api.refreshCells();
  }


  public getSelectedIds(): (number)[] {
    return this.grid.api.getSelectedNodes().map((node) => node.data.id);
  }

  setRowData(data: any[]): void {
    this.data$.next(data);
  }

  setColDef(colDefs: ColDef[]): void {
    this.grid.api.setColumnDefs(colDefs);
  }

  setFilterModel(filterModel: any): void {
    this.grid.api.setFilterModel(filterModel);
  }

  setColumnState(columnState: ColumnState[]): void {
    // this.grid.columnApi.setColumnState(columnState);
  }

  setInitialFilterModel(filterModel: any): void {
    this.grid.api.setFilterModel(filterModel);
  }

  isColumnFilterPresent(): boolean {
    return this.grid.api.isColumnFilterPresent();
  }

  getColumnState(): ColumnState[] {
    return this.grid.columnApi.getColumnState();
  }

  getFilterModel(): any {
    return this.grid.api.getFilterModel();
  }

  sizeColumnsToFit(): void {
    this.grid.api.sizeColumnsToFit();
  }

  setQuickFilter(filterString: string): void {
    this.grid.api.clearRangeSelection();
    this.grid.api.setQuickFilter(filterString);
  }

  getRowNodes(): RowNode[] {
    return AgGridService.getRowNodes(this.grid);
  }


  getDisplayedRowCount(): number {
    return this.grid.api.getDisplayedRowCount();
  }

  getSelectedNodes(): RowNode[] {
    return this.grid.api.getSelectedNodes();
  }

  getCellRanges(): CellRange[] | null {
    return this.grid.api.getCellRanges();
  }

  onFilterChanged(): void {
    this.grid.api.onFilterChanged();
  }

  setSort(): void {
    const state = this.grid.columnApi.getColumnState();
    const colFinds = state.find(col => col.colId === 'finds');
    // todo: test
    if (colFinds) {
      colFinds.sort = 'desc';
    }
    this.grid.columnApi.setColumnState(state);
    this.grid.api.refreshCells();


  }

  getColumnDef(): ColDef[] | ColGroupDef[] | undefined {
    return this.grid.api.getColumnDefs();
  }

  getAssetsSearchMode(): Observable<AssetsSearchModeEnum> {
    return this.assetsSearchMode$.asObservable();
  }

  setAssetsSearchMode(): void {
    if (this.assetsSearchMode$.getValue() === AssetsSearchModeEnum.inRow) {
      this.assetsSearchMode$.next(AssetsSearchModeEnum.oneIsFine);
    } else {
      this.assetsSearchMode$.next(AssetsSearchModeEnum.inRow);
    }
  }

  setSelectOnAllRows(): void {
    this.grid.api.forEachNodeAfterFilterAndSort(node => {
      node.setSelected(true);
    })
  }

  setColumnWithAuto(): void {
    this.grid.columnApi.autoSizeAllColumns();
  }
}
