import {Observable} from 'rxjs';

export abstract class StockTakingListProvider {

  abstract getStockTakingList$(): Observable<StockTakingForList[]>

}

export interface StockTakingForList {

  uuid: string;
  name: string;
  authorName: string;
  solverName: string;
  createdAt: Date;
  closedAt: Date | null;
  items: number;
  foundPercentage: number;
  lastUpdateAt: Date | null;

}


