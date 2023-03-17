import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {restIp} from '../../environments/environment';
import {map} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class StockTakingService {

  constructor(private httpClient: HttpClient) {
  }

  private static transformStockTakingsDTO(stockTakingDTO: Observable<StockTakingDTO[]>): Observable<StockTaking[]> {
    return stockTakingDTO.pipe(map(stockTakingDTOs => stockTakingDTOs.map(stockTakingDTO => this.transformStockTakingDTO(stockTakingDTO))))
  }

  private static transformStockTakingDTO(stockTakingDTO: StockTakingDTO): StockTaking {
    console.log(stockTakingDTO.createdAt);
    return {
      ...stockTakingDTO,
      closedAt: this.getDate(stockTakingDTO.createdAt),
      createdAt: new Date(stockTakingDTO.createdAt),
      items: this.transformItems(stockTakingDTO)
    }
  }

  private static getDate(dateString: string | null) {
    return dateString ? new Date(dateString) : null;
  }

  private static transformItems(stockTakingDTO: StockTakingDTO) {
    return stockTakingDTO.items.map(item => {
      return {
        ...item,
        foundAt: this.getDate(item.foundAt),
        note: item.note ?? ''
      }
    });
  }

  getStockTaking$(uuid: string): Observable<StockTaking> {
    return this.httpClient.get<StockTakingDTO>(restIp + '/assets/stock-taking/' + uuid).pipe(map(stockTaking => StockTakingService.transformStockTakingDTO(stockTaking)))
  }

  fetchStockTakings$(): Observable<StockTaking[]> {
    return StockTakingService.transformStockTakingsDTO(this.httpClient.get<StockTakingDTO[]>(restIp + '/assets/stock-taking'));
  }


}


export interface StockTaking {
  uuid: string;
  name: string;
  solverId: number;
  authorId: number;
  createdAt: Date;
  closedAt: Date | null;
  items: StockTakingItem[];
}

export interface StockTakingItem {
  uuid: string;
  assetId: number;
  foundInLocationUuid: string;
  foundAt: Date | null;
  note: string;
  stockTakingUuid: string;
}

export interface StockTakingDTO {
  uuid: string;
  name: string;
  solverId: number;
  authorId: number;
  createdAt: string;
  closedAt: string | null;
  items: StockTakingItemDTO[];
}

export interface StockTakingItemDTO {
  uuid: string;
  assetId: number;
  foundInLocationUuid: string;
  foundAt: string | null;
  note: string | null;
  stockTakingUuid: string;
}
