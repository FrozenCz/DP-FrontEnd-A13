import {Component, OnDestroy, TemplateRef, ViewChild} from '@angular/core';
import {ColumnState, IToolPanel, IToolPanelParams} from 'ag-grid-community';
import {Observable, OperatorFunction, Subject} from 'rxjs';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {AgGridInstanceService} from '../ag-grid-instance.service';
import {NbDialogRef, NbDialogService, NbToastrService} from '@nebular/theme';
import {AgGridService} from '../ag-grid.service';
import {Grid, GridInstance, GridView} from '../models/grid.model';

export interface GridState {
  columnState: ColumnState[];
  filterModel: any;
}

@Component({
  selector: 'app-predefined-views',
  templateUrl: './predefined-views.component.html',
  styleUrls: ['./predefined-views.component.scss']
})
export class PredefinedViewsComponent implements IToolPanel, OnDestroy {
  @ViewChild('confirmDialog', {read: TemplateRef}) confirmDialogRef!: TemplateRef<any>;
  dialogRef!: NbDialogRef<TemplateRef<any>>;
  grid!: Grid;
  gridUid: string = '';
  // gridView$!: Observable<GridView>;
  gridViews!: GridView[];
  showAsButton = false;
  fitColumns = false;
  viewToSaveName: string = '';
  selectedView: GridView | undefined = undefined;
  agGridService!: AgGridService;
  private unsubscribe: Subject<void> = new Subject<void>();

  constructor(private agGridInstanceService: AgGridInstanceService,
              private nbDialogService: NbDialogService,
              private nbToastrService: NbToastrService
  ) {

  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  agInit(params: IToolPanelParams | any): void {
    this.grid = params;
    this.gridUid = params.context.gridUid;
    // this.gridView$ = params.context.gridState;

    this.agGridInstanceService.getGridInstance(this.gridUid)
      .pipe(
        filter(e => !!e) as OperatorFunction<GridInstance | undefined, GridInstance>,
        take(1))
      .subscribe(instance => this.agGridService = instance.gridService);

    this.agGridInstanceService.getGrid(this.gridUid)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(grid => {
        if (grid?.gridViews) {
          this.gridViews = grid.gridViews
        } else {
          this.gridViews = [];
        }

      })
  }

  refresh(): void {
  }

  /**
   * load selected view
   * @param gridView object with columnStates for agGrid
   */
  loadView(gridView: GridView | undefined): void {
    if (!gridView) return;
    this.viewToSaveName = gridView.viewName;
    this.showAsButton = gridView.showAsButton;
    this.fitColumns = gridView.fitColumns;
    this.agGridService.setColumnFit(this.fitColumns);
    this.grid.columnApi.setColumnState(gridView.columnState);
    this.grid.api.setFilterModel(gridView.filterModel);
  }

  /**
   * save current setup of agGrid with specific name
   * @param viewToSaveName if name exist it will prompt warning about update of existing
   */
  async saveView(viewToSaveName: string): Promise<void> {
    let shAsButton = false;
    if (await this.viewExist(viewToSaveName)) {
      this.dialogRef = this.nbDialogService.open(this.confirmDialogRef, {
        context: {
          status: 'warning',
          title: 'Chystáte se přepsat již uložené nastavení',
          message: 'Chcete přepsat nastavení "' + viewToSaveName + '"?',
          confirmButton: {
            icon: 'edit-2',
            text: 'Přepiš'
          }
        }
      });
      if (!await this.dialogRef.onClose.toPromise()) {
        return;
      }
      shAsButton = this.showAsButton; // get current state for update
    }

    const colState = this.grid.columnApi.getColumnState();
    const filterModel = this.grid.api.getFilterModel();
    const newView: GridView = {
      viewName: viewToSaveName,
      columnState: colState,
      showAsButton: shAsButton,
      filterModel,
      fitColumns: false
    };

    this.selectedView = await this.agGridInstanceService.saveView(this.gridUid, newView);
    if (this.selectedView) {
      this.showAsButton = false;
      this.nbToastrService.success('úspěšně uložen', 'Pohled', {icon: 'checkmark', duration: 2000});
    } else {
      this.nbToastrService.danger('nebyl uložen', 'Pohled', {icon: 'alert', duration: 2000});
    }
  }

  /**
   * delete selectedView
   * @param selectedView vybrany pohled
   */
  async deleteView(selectedView: GridView | undefined): Promise<void> {
    if (!selectedView) return;
    if (!await this.viewExist(selectedView.viewName)) {
      this.nbToastrService.danger('nebyl nalezen', 'Pohled', {icon: 'questionmark', duration: 2000});
      return;
    }

    this.dialogRef = this.nbDialogService.open(this.confirmDialogRef, {
      context: {
        status: 'danger',
        title: 'Smazání pohledu',
        message: 'Chcete smazat pohled "' + selectedView.viewName + '"?',
        confirmButton: {
          icon: 'trash-2-outline',
          text: 'Smaž'
        }
      }
    });
    if (!await this.dialogRef.onClose.toPromise()) {
      return;
    }

    if (await this.agGridInstanceService.deleteView(this.gridUid, selectedView.viewName)) {
      this.nbToastrService.info('smazání úspěšné', 'Pohled', {icon: 'checkmark', duration: 2000});
      this.selectedView = undefined;
    }
  }

  async saveShowAsButton(selectedView: GridView, showAsButton: boolean): Promise<void> {
    if (!await this.viewExist(selectedView.viewName)) {
      this.nbToastrService.danger('nebyl nalezen', 'Pohled', {icon: 'questionmark', duration: 2000});
      return;
    }
    await this.agGridInstanceService.setCustomProperties(this.gridUid, selectedView.viewName, showAsButton, this.fitColumns);
  }

  async saveFitColumns(selectedView: GridView, fitColumns: boolean): Promise<void> {
    if (!await this.viewExist(selectedView.viewName)) {
      this.nbToastrService.danger('nebyl nalezen', 'Pohled', {icon: 'questionmark', duration: 2000});
      return;
    }
    await this.agGridInstanceService.setCustomProperties(this.gridUid, selectedView.viewName, this.showAsButton, fitColumns);
  }

  private async viewExist(viewName: string): Promise<boolean> {
    return this.gridViews.some(view => view.viewName === viewName);
  }

  resetView(): void {
    this.grid.api.setFilterModel(null);
    this.grid.columnApi.resetColumnState();
    this.grid.api.sizeColumnsToFit();
  }
}
