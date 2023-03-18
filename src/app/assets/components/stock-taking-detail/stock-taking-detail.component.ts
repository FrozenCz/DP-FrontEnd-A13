import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {BehaviorSubject, combineLatest, first, firstValueFrom, Observable, switchMap} from 'rxjs';
import {StockTakingDetail, StockTakingDetailProvider} from './stockTakingDetail.provider';
import {GridOptions} from 'ag-grid-community';
import {ColDefs, DefaultColDef} from './col-def.grid';
import {StockTakingService} from '../../stock-taking.service';
import {NbToastrService} from '@nebular/theme';


@Component({
  selector: 'app-stock-taking-detail',
  templateUrl: './stock-taking-detail.component.html',
  styleUrls: ['./stock-taking-detail.component.scss']
})
export class StockTakingDetailComponent implements OnInit {
  private stateChanged$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  stockTaking$!: Observable<StockTakingDetail>;
  ableToClose$!: Observable<boolean>;
  gridOptions: GridOptions = {
    getRowClass: params => params.data?.foundAt !== null ? 'stock-item-found' : ''
  };
  colDefs = ColDefs;
  defaultColDef = DefaultColDef;
  actionPerformed = false;

  constructor(private route: ActivatedRoute,
              private toasterService: NbToastrService,
              private stockTakingProvider: StockTakingDetailProvider,
              private stockTakingService: StockTakingService
  ) {
  }

  ngOnInit(): void {
    this.stockTaking$ = this.route.paramMap.pipe(switchMap(paramMap => {
      const uuid = this.getUuid(paramMap);
      return this.stockTakingProvider.getStockTakingDetail$(uuid);
    }))

    this.ableToClose$ = combineLatest([this.route.paramMap, this.stateChanged$]).pipe(
      switchMap(([paramMap, _]) => {
        const uuid = this.getUuid(paramMap);
        return this.stockTakingProvider.isUserAbleToCloseStockTaking$(uuid);
      }))
  }

  private getUuid(paramMap: ParamMap) {
    const uuid = paramMap.get('uuid');
    if (!uuid) {
      throw new Error('uuid not found!');
    }
    return uuid;
  }

  goBack() {
    history.back()
  }

  close(stockTaking: StockTakingDetail) {
    this.actionPerformed = true;
    firstValueFrom(this.stockTakingService.closeStockTaking(stockTaking.uuid)).then(() => {
      this.toasterService.success('úspěšně uzavřena', 'Inventura')
      this.stateChanged$.next(true);
    }, reason => {
      this.actionPerformed = false;
      this.toasterService.danger('nebyla uzavřena', 'Inventura')
    })
  }
}
