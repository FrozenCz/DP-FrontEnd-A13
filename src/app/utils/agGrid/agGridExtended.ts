import {AgGridInstanceService} from './ag-grid-instance.service';
import {ReplaySubject, Subject} from 'rxjs';
import {GridState} from './predefined-views/predefined-views.component';
import {AgGridFuncs, DateTimeFormatterType} from './ag-grid.funcs';
import {
  CellPosition,
  RangeSelectionChangedEvent,
  RowNode,
  ToolPanelVisibleChangedEvent
} from 'ag-grid-community';
import {AgGridService} from './ag-grid.service';

export abstract class AgGridExtended {
  protected fitColumns = false;
  protected updateStateTimeout: any = null;
  public gridReady$: Subject<boolean> = new Subject<boolean>();
  protected gridState$: ReplaySubject<GridState> = new ReplaySubject<GridState>(1);
  protected firstLoad = true;
  public gridUid: string = '';
  protected agGridInstanceService!: AgGridInstanceService;
  public gridService!: AgGridService;
  public filterActive = false;
  protected startCell: CellPosition | null = null;

  protected static dateTimeFormatter(params: any): string {
    return AgGridFuncs.dateTimeFormatter(params.value, DateTimeFormatterType.JUST_DAYS);
  }

  /**
   * when something on gridState was changed
   */
  async onGridStatePropertyChanged(): Promise<void> {
    clearTimeout(this.updateStateTimeout);

    if (!this.gridService) {
      return;
    }

    if (this.firstLoad) {
      this.firstLoad = false;

      const gridView = this.agGridInstanceService.getActiveSelection(this.gridUid);
      if (gridView) {
        this.gridService.setColumnState(gridView.columnState);
        this.gridService.setFilterModel(gridView.filterModel);
        this.gridService.setColumnFit(gridView.fitColumns);
      }

    } else {
      this.updateStateTimeout = setTimeout(() => {
        this.agGridInstanceService.saveActiveSelection(this.gridUid, this.gridService.getColumnState(),
          this.gridService.getFilterModel(), this.fitColumns);
        this.updateGridState();
      }, 500);
    }
  }

  protected updateGridState(): void {
    const gridState: GridState = {
      columnState: this.gridService.getColumnState(),
      filterModel: this.gridService.getFilterModel()
    };
    this.gridState$.next(gridState);
  }

  onDisplayedColumnsChanged(): void {
    this.onGridStatePropertyChanged().catch(err => {
      alert('Nepovedlo se uložit stav ag Gridu');
      console.warn(err);
    });
  }

  onColumnResized(): void {
    this.onGridStatePropertyChanged().catch(err => {
      alert('Nepovedlo se uložit stav ag Gridu');
      console.warn(err);
    });
  }

  onGridSizeChanged(): void {
    this.onGridStatePropertyChanged().catch(err => {
      alert('Nepovedlo se uložit stav ag Gridu');
      console.warn(err);
    });
    if (this.fitColumns) {
      this.gridService.sizeColumnsToFit();
    }
  }

  onGridColumnsChanged(): void {
    this.onGridStatePropertyChanged().catch(err => {
      alert('Nepovedlo se uložit stav ag Gridu');
      console.warn(err);
    });
  }

  onPanelVisibilityChanged($event: ToolPanelVisibleChangedEvent): void {
    if (this.fitColumns) {
      this.gridService.sizeColumnsToFit();
    }
  }

  onFilterModified($event: any): void {
    this.filterActive = this.gridService.isColumnFilterPresent();
    this.onGridStatePropertyChanged().catch(err => {
      alert('Nepovedlo se uložit stav ag Gridu');
      console.warn(err);
    });
  }


  onCellKeyPress($event: any): void {
    if ($event.event?.code === 'Space') {
      this.performSelection($event.node);
    }
  }

  removeSelected(): void {
    this.gridService.getSelectedNodes().forEach(node => node.setSelected(false));
    this.switchSelectionMode();
  }

  performSelection(rowPressed: RowNode, select?: boolean): void {
    const nodes: RowNode[] = [...this.gridService.getRowNodes()];
    let boolFromPressed = false;
    if (select === undefined) {
      boolFromPressed = !!rowPressed.isSelected();
    } else {
      boolFromPressed = select;
    }

    const rangeSelections = this.gridService.getCellRanges();
    rangeSelections?.forEach(rangeSelection => {
      const from = rangeSelection.startRow?.rowIndex ? rangeSelection.startRow.rowIndex : 0;
      const to = rangeSelection.endRow?.rowIndex ? rangeSelection.endRow.rowIndex : 0;
      const startNodeIndex = Math.min(from, to);
      const endNodeIndex = Math.max(from, to);

      nodes?.filter(({rowIndex}) => rowIndex && rowIndex >= startNodeIndex && rowIndex <= endNodeIndex)
        ?.forEach(node => {
        node.setSelected(boolFromPressed);
      });
    });
    this.switchSelectionMode();
  }



  /**
   * add or remove .removingSelectionMode to ag-grid-angular
   * depends on selected cell
   * - for changing color of selected cells
   */
  switchSelectionMode(): void {
    const nodes = this.gridService.getRowNodes();
    const startedNode = nodes.find(node => node.rowIndex === this.startCell?.rowIndex);
    const grids = document.getElementsByTagName('ag-grid-angular');
    const activeGrid = grids.item(grids.length - 1);

    if (!startedNode || !activeGrid) {
      return;
    }

    if ((startedNode.isSelected() && activeGrid.classList.contains('removingSelectionMode')) ||
      (!startedNode.isSelected() && !activeGrid.classList.contains('removingSelectionMode'))
    ) {
      return;
    }

    if (startedNode.isSelected()) {
      activeGrid.classList.add('removingSelectionMode');
    } else {
      activeGrid.classList.remove('removingSelectionMode');
    }
  }

  onRangeSelectionChanged($event: RangeSelectionChangedEvent): void {
    let startedCell;
    if (!startedCell && $event.started) {
      startedCell = $event.api.getFocusedCell();
      this.startCell = startedCell;
      this.switchSelectionMode();
    }
  }
}
