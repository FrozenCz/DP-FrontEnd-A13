import {Observable} from 'rxjs';

export abstract class StockTakingDetailProvider {

  public abstract getStockTakingDetail$(uuid: string): Observable<StockTakingDetail>

  public abstract isUserAbleToCloseStockTaking$(uuid: string): Observable<boolean>;

}

export interface StockTakingDetail {
  uuid: string;
  name: string;
  solver: StockTakingDetailUser;
  author: StockTakingDetailUser;
  createdAt: Date;
  closedAt: Date | null;
  items: StockTakingDetailItem[];
}

export interface StockTakingDetailItem {
  uuid: string;
  assetName: string;
  serialNumber: string;
  foundAt: Date | null;
  note: string;
}

export interface StockTakingDetailUser {
  id: number,
  name: string;
  surname: string;
}
