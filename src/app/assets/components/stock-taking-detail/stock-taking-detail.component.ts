import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Observable, switchMap} from 'rxjs';
import {StockTaking, StockTakingService} from '../../stock-taking.service';

@Component({
  selector: 'app-stock-taking-detail',
  templateUrl: './stock-taking-detail.component.html',
  styleUrls: ['./stock-taking-detail.component.scss']
})
export class StockTakingDetailComponent implements OnInit {
  stockTaking$!: Observable<StockTaking>;

  constructor(private route: ActivatedRoute, private stockTakingService: StockTakingService) {
  }

  ngOnInit(): void {
    this.stockTaking$ = this.route.paramMap.pipe(switchMap(paramMap => {
      const uuid = this.getUuid(paramMap);

      return this.stockTakingService.getStockTaking$(uuid);

    }))
  }

  private getUuid(paramMap: ParamMap) {
    const uuid = paramMap.get('uuid');
    if (!uuid) {
      throw new Error('uuid not found!');
    }
    return uuid;
  }
}
