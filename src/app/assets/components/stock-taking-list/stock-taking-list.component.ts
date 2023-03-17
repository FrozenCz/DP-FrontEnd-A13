import {Component, OnInit} from '@angular/core';
import {StockTakingForList, StockTakingListProvider} from './stockTakingListProvider';
import {ColDef, GridOptions, RowDoubleClickedEvent} from 'ag-grid-community';
import {stockTakingListColDefs} from './stock-taking-list-col.defs';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-stock-taking-list',
  templateUrl: './stock-taking-list.component.html',
  styleUrls: ['./stock-taking-list.component.scss']
})
export class StockTakingListComponent {
  gridOptions: GridOptions = {
    onRowDoubleClicked: (event: RowDoubleClickedEvent) => {
      if (event.data && event.data.uuid) {
        this.router.navigate(['../', event.data.uuid], {relativeTo: this.route});
      }
    }
  };
  colDef: ColDef[] = stockTakingListColDefs;
  defaultColDef: ColDef = {
    floatingFilter: true,
    filter: 'agTextColumnFilter',
  }
  stockTakingList$: Observable<StockTakingForList[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockTakingService: StockTakingListProvider
  ) {
    this.stockTakingList$ = this.stockTakingService.getStockTakingList$();
  }

}
