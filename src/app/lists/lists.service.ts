import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {AssetsService, IAssetsExt} from '../assets/assets.service';
import {HttpClient} from '@angular/common/http';
import {filter, map, tap, withLatestFrom} from 'rxjs/operators';

interface AssetsListGeneral {
  id: number;
  name: string;
  category: string;
  connected: boolean;
  description: string;
  archived: boolean;
}

export interface IAssetsList extends AssetsListGeneral {
  assets: IAssetsExt[];
  created: Date;
  updated: Date;
}

export interface IAssetsListForCreateUpdate extends AssetsListGeneral{
  assets: IAssetsExt[];
}

interface IAssetsListFromNest extends AssetsListGeneral {
  assets: AssetFromNest[];
  created: Date;
  updated: Date;
}

export interface IAssetsListForNest extends AssetsListGeneral {
  assetsIds: number[];
}

interface AssetFromNest {
  id: number;
  categoryId: number;
  document: string;
  evidenceNumber: string;
  identificationNumber: string;
  inquiryDate: Date;
  inquiryPrice: number;
  inventoryNumber: string;
  location: string;
  locationEtc: string;
  name: string;
  note: string;
  quantity: number;
  serialNumber: string;
  userId: number;
}


@Injectable({
  providedIn: 'root'
})
export class ListsService {
  private assetsListStore: BehaviorSubject<IAssetsList[]> = new BehaviorSubject<IAssetsList[]>([]);
  private assetsLists$: Observable<IAssetsList[]> = this.assetsListStore.asObservable();


  constructor(private http: HttpClient, private assetsService: AssetsService) {
    this.transformAssetsLists().subscribe(
      (assetsLists) => {
        this.assetsListStore.next(assetsLists);
      },
      error => {
        if ([401, 403].includes(error.error.statusCode)) {
          this.assetsListStore.next([]);
        }
      }
    );
  }

  private transformAssetsLists(): Observable<IAssetsList[]> {
    return combineLatest([this.fetchAssetsLists(), this.assetsService.getAssets()]).pipe(
      filter(([lists, assets]) => !!assets),
      map(([lists, assets]) => {
        return lists.map(list => this.transformAssetsList(list, assets));
      }));
  }

  private transformAssetsList(assetsListFromNest: IAssetsListFromNest, assets: IAssetsExt[]): IAssetsList {
    const updatedAssets = assetsListFromNest.assets.map(assetNest => {
      return assets.find(asset => asset.asset.id === assetNest.id);
    });
    // todo:.... nejde undefined
    return {
      ...assetsListFromNest,
      assets: []
    };
  }

  private fetchAssetsLists(): Observable<IAssetsListFromNest[]> {
    return this.http.get<IAssetsListFromNest[]>('rest/lists');
  }

  getAssetsLists(): Observable<IAssetsList[]> {
    return this.assetsLists$;
  }

  /**
   * create assetsList and update subject
   * @param assetsList newList
   * @return obs of new List
   */
  createAssetsList(assetsList: IAssetsListForCreateUpdate): Observable<IAssetsList> {
    const assetsListForNest: IAssetsListForNest = {...assetsList, assetsIds: assetsList.assets.map(asset => asset.asset.id)};
    return this.http.post<IAssetsListFromNest>('rest/lists', assetsListForNest)
      .pipe(
        withLatestFrom(this.assetsService.getAssets()),
        map(([assetList, assets]) => this.transformAssetsList(assetList, assets)),
        tap((newList) => {
            const assetsLists = this.assetsListStore.getValue();
            const updatedLists = [...assetsLists, newList];
            this.assetsListStore.next(updatedLists);
          }
        )
      );
  }

  updateAssetsList(assetsList: IAssetsListForCreateUpdate): Observable<IAssetsList> {
    const assetsListForNest: IAssetsListForNest = {...assetsList, assetsIds: assetsList.assets.map(asset => asset.asset.id)};
    return this.http.put<IAssetsListFromNest>('rest/lists/' + assetsList.id, assetsListForNest)
      .pipe(
        withLatestFrom(this.assetsService.getAssets()),
        map(([assetList, assets]) => this.transformAssetsList(assetList, assets)),
        tap((assetsListTransformed) => {
          const assetsLists = this.assetsListStore.getValue().filter(al => al.name !== assetsListTransformed.name);
          const updatedLists = [...assetsLists, assetsListTransformed];
          this.assetsListStore.next(updatedLists);
        })
      );
  }

  deleteAssetsList(assetsListId: number): Observable<any> {
    return this.http.delete('rest/lists/' + assetsListId)
      .pipe(
        tap(() => {
          const assetsListsFiltered = this.assetsListStore.getValue().filter(al => al.id !== assetsListId);
          this.assetsListStore.next(assetsListsFiltered);
        }));
  }

  getAssetList(listId: number): Observable<IAssetsList | undefined> {
    return this.getAssetsLists().pipe(map(lists => lists.find(list => list.id === listId)));
  }

}
