import {Injectable} from '@angular/core';
import {ColumnState, GridReadyEvent} from 'ag-grid-community';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {filter, map, shareReplay, take} from 'rxjs/operators';
import {AgGridService, GetIdFromDataFunction} from './ag-grid.service';
import {AgGrid, Grid, GridInstance, GridView} from './models/grid.model';

@Injectable({
  providedIn: 'root'
})

export class AgGridInstanceService {
  private gridInstances: BehaviorSubject<GridInstance[]> = new BehaviorSubject<GridInstance[]>([]);
  gridInstances$ = this.gridInstances.asObservable();
  private grids$: BehaviorSubject<AgGrid[]> = new BehaviorSubject<AgGrid[]>([]);

  private isUnitCollapsed$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.initGrids();
  }

  saveGridInstance(gridUid: string, grid: Grid, getIdFromDataFunction: GetIdFromDataFunction): AgGridService {
    const serviceForGrid = new AgGridService(grid, getIdFromDataFunction);
    const gridInstances = this.gridInstances.getValue().filter(gr => gr.gridUid !== gridUid);
    const updatedInstances: GridInstance[] = [...gridInstances, {gridUid, gridService: serviceForGrid}];
    this.gridInstances.next(updatedInstances);
    return serviceForGrid;
  }

  getGridInstance(gridUid: string): Observable<GridInstance | undefined> {
    return this.gridInstances$
      .pipe(
        filter(u => !!u),
        map(grids => grids.find(grid => grid.gridUid === gridUid)),
      );
  }

  public getGrid(gridUid: string): Observable<AgGrid | undefined> {
    return this.grids$
      .pipe(
        map(grids => grids.find(grid => grid.gridUid === gridUid)),
      );
  }

  /**
   * init grids from localstorage -> what about database?
   */
  private initGrids(): void {
    const agGridViews = localStorage.getItem('agGrids');
    if (agGridViews && agGridViews.length > 0) {
      this.grids$.next(JSON.parse(agGridViews));
    } else {
      this.grids$.next([]);
    }
  }

  public getGrids(): Observable<AgGrid[]> {
    return this.grids$;
  }

  public getActiveSelection(gridUuid: string): GridView | undefined {
    return this.grids$.getValue()?.find(grids => grids.gridUid === gridUuid)?.activeSelection;
  }

  public saveGrid(agGrid: AgGrid): AgGrid[] {
    const otherGrids = this.grids$.getValue().filter(grids => grids.gridUid !== agGrid.gridUid);
    const newGrids = [...otherGrids, agGrid];
    this.grids$.next(newGrids);
    return newGrids;
  }

  public getFitColumns(gridUid: string, viewName?: string): boolean {
    if (!viewName) {
      return !!this.grids$?.getValue()?.find(grid => grid.gridUid === gridUid)?.activeSelection?.fitColumns;
    } else {
      return !!this.grids$?.getValue()?.find(grid => grid.gridUid === gridUid)?.gridViews?.find(view => view.viewName === viewName)?.fitColumns;
    }
  }

  async saveActiveSelection(gridUuid: string, columnStates: ColumnState[], filterModel: any, fitColumns: boolean): Promise<void> {
    const activeSelection: GridView = {
      viewName: 'activeSelection',
      columnState: columnStates,
      filterModel,
      showAsButton: false,
      fitColumns
    };
    await this.saveView(gridUuid, activeSelection, true);
  }

  async saveView(gridUid: string, view: GridView, onlyActiveSelection = false): Promise<GridView | undefined> {
    const grids: AgGrid[] = [...this.grids$.getValue()];
    let grid: AgGrid | undefined = grids.find(gr => gr.gridUid === gridUid);

    if (!grid) {
      grid = {gridUid, gridViews: [], activeSelection: undefined};
      grids.push(grid);
    }

    if (!grid.gridViews) {
      grid.gridViews = [];
    }

    grid.activeSelection = view;

    if (!onlyActiveSelection) {
      grid.gridViews = grid.gridViews.filter(gr => gr.viewName !== view.viewName);
      grid.gridViews = [...grid.gridViews, view];
    }


    return this.saveGrids(grids).pipe(
      map((agGrids) => {
          const gView = agGrids.find(agGrid => agGrid.gridUid === gridUid)?.gridViews
            .find(vi => vi.viewName === view.viewName);
          if (!gView) {
            return;
          } else {
            return gView;
          }
        }
      )).toPromise();
  }

  private saveGrids(grids: AgGrid[]): Observable<AgGrid[]> {
    localStorage.setItem('agGrids', JSON.stringify(grids));
    this.grids$.next(grids);
    return of(grids);
  }

  async deleteView(gridUid: string, viewName: string): Promise<boolean> {
    const grids = this.grids$.getValue().map((grid) => {
      if (grid.gridUid === gridUid) {
        grid.gridViews = grid.gridViews.filter(view => view.viewName !== viewName);
      }
      return grid;
    });
    return !!await this.saveGrids(grids);
  }

  async setCustomProperties(gridUid: string, viewName: string, showAsButton: boolean, fitColumns: boolean): Promise<GridView | undefined> {
    const gridInstance = await this.getGridInstance(gridUid).pipe(take(1)).toPromise();
    const grid = await this.getGrid(gridUid).pipe(take(1)).toPromise();
    if (!grid || !gridInstance) {
      return;
    }
    const view = grid.gridViews.find(v => v.viewName === viewName);

    if (!view) {
      return;
    }
    view.showAsButton = showAsButton;
    view.fitColumns = fitColumns;

    gridInstance.gridService.setColumnFit(fitColumns);

    if (!view) {
      return;
    }
    grid.gridViews = [...grid.gridViews.filter(vi => vi.viewName !== viewName), view];
    return this.saveGrid(grid).find(gridf => gridf.gridUid === gridUid)?.gridViews.find(vi => vi.viewName === viewName);
  }


  isUnitsCollapsed(): Observable<boolean> {
    return this.isUnitCollapsed$;
  }

  setCollapseUnitsTo(bool: boolean): void {
    this.isUnitCollapsed$.next(bool);
  }

  removeGridInstance(gridUid: string): void {
    this.gridInstances.next(this.gridInstances.getValue().filter(grid => grid.gridUid !== gridUid));
  }
}
