import {Observable} from 'rxjs';

export abstract class StockTakingListProvider {

  abstract getStockTakingList$(): Observable<StockTakingList[]>

}

export interface StockTakingList {

  uuid: string;
  authorName: string;
  solverName: string;
  createdAt: Date;
  closedAt: Date;
  items: StockTakingItem[];
  lastUpdateAt: Date;

}

export interface StockTakingItem {

  uuid: string;
  name: string;
  ec: string;
  ic: string;

}
