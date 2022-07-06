import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AgGridInstanceService} from '../ag-grid-instance.service';
import {combineLatest, filter, switchMap, takeUntil, tap} from 'rxjs/operators';
import {AgGridService} from '../ag-grid.service';
import {combineLatestWith, of, OperatorFunction, Subject} from 'rxjs';
import {GridInstance} from '../models/grid.model';

@Component({
  selector: 'app-bar-under-ag-grid',
  templateUrl: './bar-under-ag-grid.component.html',
  styleUrls: ['./bar-under-ag-grid.component.scss']
})
export class BarUnderAgGridComponent implements OnInit, OnDestroy {
  @Input() rows: number = 0;
  @Input() selectedRow: number = 0;
  @Input() gridUid: string = '';
  columnFit: boolean = false;
  gridService!: AgGridService;
  unsubscribe: Subject<void> = new Subject<void>()

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private agGridInstanceService: AgGridInstanceService) {
  }

  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  ngOnInit(): void {
    this.agGridInstanceService.getGridInstance(this.gridUid)
      .pipe(
        filter(gInstance => !!gInstance) as OperatorFunction<GridInstance | undefined, GridInstance>,
        tap(instanceGrid => this.gridService = instanceGrid.gridService),
        switchMap((res) => res.gridService.getColumnFit$()),
        takeUntil(this.unsubscribe)
      )
      .subscribe((columnFit) => this.columnFit = columnFit);
  }

  async resetView(): Promise<void> {
    this.gridService.resetView();
  }

  async flexGrid(): Promise<void> {
    this.gridService.flexGrid();
  }

  setColumnWithAuto(): void {
    this.gridService.setColumnWithAuto();
  }

  setColumnFit(newValue: boolean): void {
    this.gridService.setColumnFit(newValue);
  }

  async deselectRows(): Promise<void> {
    this.gridService.deselectAll();
  }

  async changeSelectedRows(): Promise<void> {
    this.gridService.toggleShowOnlySelectedRows();
  }

}
