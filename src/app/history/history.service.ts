import {Injectable} from '@angular/core';
import {HistoryDto, HistoryModel} from './models/history.model';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {HistoryRelatedTo} from './models/history.enum';
import {HumanReadableAssetsChange} from './models/history.humanReadable';
import {tap} from 'rxjs/operators';
import {AssetsModelDto} from '../assets/models/assets.dto';

export interface ChangeType {
  name: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history$: BehaviorSubject<HistoryModel[]> = new BehaviorSubject<HistoryModel[]>([]);

  constructor(private httpClient: HttpClient) {
  }

  static translateRelatedToEnum(relatedTo: HistoryRelatedTo): ChangeType {
    switch (relatedTo) {
      case HistoryRelatedTo.assetsCreate:
        return {name: 'Vytvoření majetku', icon: '<i class="fas fa-desktop text-success-color"></i>'};
        break;
      case HistoryRelatedTo.assetsChangeInformation:
        return {
          name: 'Změna informací majetku',
          icon: '<i class="fas fa-desktop text-info-color"></i>'
        };
        break;
      case HistoryRelatedTo.assetsUserChange:
        return {
          name: 'Změna uživatele majetku',
          icon: '<i class="fas fa-desktop text-warning-color"></i>'
        };
        break;
      case HistoryRelatedTo.assetsRemoved:
        return {name: 'Vyřazení majetku', icon: '<i class="fas fa-desktop text-danger-color"></i>'};
        break;
    }
  }

  static humanReadableChanges(changedFrom: Partial<AssetsModelDto>, relatedTo: HistoryRelatedTo): string {
    if (!(changedFrom instanceof Object)) {
      return '';
    }
    delete changedFrom.version;
    switch (relatedTo) {
      case HistoryRelatedTo.assetsCreate:
      case HistoryRelatedTo.assetsChangeInformation:
      case HistoryRelatedTo.assetsRemoved:
        const result = Object.keys(changedFrom).map(change => {
          return HumanReadableAssetsChange[change as keyof typeof HumanReadableAssetsChange] + ': ' + changedFrom[change as keyof typeof changedFrom];
        }).join(', ');
        return result;

      case HistoryRelatedTo.assetsUserChange:
        // return changedFrom['surname'] + ' ' + changedFrom['name'];
        return changedFrom['name']?changedFrom['name']:'';
    }

  }

  getHistoryList(): Observable<HistoryModel[]> {
    return this.httpClient.get<HistoryDto[]>('/rest/history').pipe(tap(history => {
      this.history$.next(history);
    }));
  }

  getHistoryById(id: number): HistoryModel | undefined {
    return this.history$.getValue().find(h => h.id === id);
  }

  getAssetHistoryById(id: number): HistoryModel | undefined {
    return this.history$.getValue().find(h => h.asset?.id === id);
  }

  getHistoryListForAsset(id: number): Observable<HistoryModel[]> {
    return this.httpClient.get<HistoryDto[]>('/rest/history/assets/' + id);
  }
}
