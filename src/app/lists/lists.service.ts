import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {AssetsService, IAssetsExt} from '../assets/assets.service';
import {HttpClient} from '@angular/common/http';
import {filter, map, tap, withLatestFrom} from 'rxjs/operators';
import {Asset} from '../assets/models/assets.model';
import {AssetSource, Facade} from '../facade/facade';
import {restIp} from '../../environments/environment';

interface AssetsListGeneral {
  id: number | undefined;
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

export interface IAssetsListForCreateUpdate extends AssetsListGeneral {
  assets: Asset[];
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


  constructor(private http: HttpClient, private facade: Facade) {
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
    return combineLatest([this.fetchAssetsLists(), this.facade.getAssetExt(AssetSource.STORE)]).pipe(
      filter(([_, assets]) => !!assets),
      map(([lists, assets]) => {
        return lists.map(list => this.transformAssetsList(list, assets));
      }));
  }

  private transformAssetsList(assetsListFromNest: IAssetsListFromNest, assets: IAssetsExt[]): IAssetsList {
    const updatedAssets = this.getUpdatedAssets(assetsListFromNest, assets);
    return {
      ...assetsListFromNest,
      assets: updatedAssets
    };
  }

  private getUpdatedAssets(assetsListFromNest: IAssetsListFromNest, assets: IAssetsExt[]): IAssetsExt[] {
    return assetsListFromNest.assets.map(assetNest => {
      const found = assets.find(asset => asset.asset.id === assetNest.id);
      if (!found) {
        throw new Error(`Asset with ID ${assetNest.id} not found`)
      }
      return found;
    });
  };

  private fetchAssetsLists(): Observable<IAssetsListFromNest[]> {
    return this.http.get<IAssetsListFromNest[]>(restIp+'/lists');
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
    const assetsListForNest: IAssetsListForNest = {...assetsList, assetsIds: assetsList.assets.map(asset => asset.id)};
    return this.http.post<IAssetsListFromNest>(restIp+'/lists', assetsListForNest)
      .pipe(
        withLatestFrom(this.facade.getAssetExt(AssetSource.STORE)),
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
    const assetsListForNest: IAssetsListForNest = {...assetsList, assetsIds: assetsList.assets.map(asset => asset.id)};
    return this.http.put<IAssetsListFromNest>(restIp+'/lists/' + assetsList.id, assetsListForNest)
      .pipe(
        withLatestFrom(this.facade.getAssetExt(AssetSource.STORE)),
        map(([assetList, assets]) => this.transformAssetsList(assetList, assets)),
        tap((assetsListTransformed) => {
          const assetsLists = this.assetsListStore.getValue().filter(al => al.name !== assetsListTransformed.name);
          const updatedLists = [...assetsLists, assetsListTransformed];
          this.assetsListStore.next(updatedLists);
        })
      );
  }

  deleteAssetsList(assetsListId: number): Observable<any> {
    return this.http.delete(restIp+'/lists/' + assetsListId)
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
