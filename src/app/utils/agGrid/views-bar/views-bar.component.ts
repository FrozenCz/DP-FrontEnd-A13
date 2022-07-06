import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AgGridInstanceService} from '../ag-grid-instance.service';
import {combineLatestWith, Observable, Subject} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';
import {AgGrid, GridInstance, GridView} from '../models/grid.model';

@Component({
  selector: 'app-views-bar',
  templateUrl: './views-bar.component.html',
  styleUrls: ['./views-bar.component.scss']
})
export class ViewsBarComponent implements OnInit, OnDestroy {
  @Input() gridUid: string = '';
  gridInstance!: GridInstance;
  agGridStates!: AgGrid;
  viewsAsButton: GridView[] = [];
  unsubscribe: Subject<void> = new Subject<void>();


  constructor(private agGridService: AgGridInstanceService) {
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnInit(): void {
    this.agGridService.getGridInstance(this.gridUid)
      .pipe(combineLatestWith(this.agGridService.getGrid(this.gridUid)))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(([grid, gridS]) => {
        if (grid) {
          this.gridInstance = grid;
        }
        if (gridS) {
          this.agGridStates = gridS;
          this.viewsAsButton = this.agGridStates.gridViews.filter(view => view.showAsButton);
        }
      });

  }

  async loadView(view: GridView): Promise<void> {
    this.gridInstance.gridService.loadView(view);
  }
}
