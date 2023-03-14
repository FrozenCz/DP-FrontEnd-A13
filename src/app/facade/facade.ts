import {Injectable} from '@angular/core';
import {combineLatest, Observable, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {AssetsService, IAssetsExt} from '../assets/assets.service';
import {UsersService} from '../users/users.service';
import {CategoriesService} from '../categories/categories.service';
import {Transforms} from '../utils/Transforms';
import {Asset} from '../assets/models/assets.model';
import {LocationService} from '../locations/location.service';
import {UnitsService} from '../units/units.service';

import {Caretaker} from '../users/model/caretaker.model';
import {TokenService} from '../auth/token.service';
import {HttpClient} from '@angular/common/http';
import {TransferDataProvider} from '../assets/components/abstract/transferDataProvider';
import {AssetTransfer, AssetTransferDto} from '../assets/models/asset-transfer.model';
import {StockTakingList, StockTakingListProvider} from '../assets/components/stock-taking-list/stockTakingListProvider';

@Injectable({
  providedIn: 'root'
})
export class Facade implements TransferDataProvider, StockTakingListProvider {

  constructor(
    private assetsService: AssetsService,
    private usersService: UsersService,
    private categoryService: CategoriesService,
    private locationService: LocationService,
    private unitService: UnitsService,
    private tokenService: TokenService,
    private httpClient: HttpClient,
  ) {
  }

  public getAssetExtMap$(source: AssetSource): Observable<Map<number, IAssetsExt>> {
    return this.getAssetExt(source).pipe(map(assets => {
      const map: Map<number, IAssetsExt> = new Map();
      assets.forEach(a => map.set(a.id, a))
      return map;
    }))
  }


  getAssetExt(source: AssetSource): Observable<IAssetsExt[]> {
    let obs: Observable<Asset[]> = this.assetsService.assetsStore$.getAll$();
    if (source === AssetSource.WORKING_LIST) {
      obs = this.assetsService.getAssetsWorkingList$().pipe(map(assetsMap => Array.from(assetsMap.values())));
    } else if (source === AssetSource.SELECTED_IN_GRID) {
      obs = this.assetsService.getAssetsSelectedInGridList$().pipe(map(assetsMap => Array.from(assetsMap.values())));
    }
    return combineLatest([
      obs,
      this.usersService.getUsersMap$(),
      this.categoryService.categoriesStore$.getMap$(),
      this.locationService.locationStore.getMap$()
    ]).pipe(
      map(([assets, users, categories, locations]) => {
        return assets.map(asset => {
          return Transforms.getAssetModelExt(asset, users, categories, locations);
        })
      })
    )
  }


  getCaretakers$(): Observable<Caretaker[]> {
    return this.usersService.getCaretakers$()
  }

  getCaretaker$(): Observable<Caretaker> {
    return this.tokenService.getToken()
      .pipe(
        switchMap(jwtToken => {
          return this.usersService.getCaretakers$().pipe(
            map(caretakers => {
              const userFound = caretakers.find(user => user.id === jwtToken?.userId);
              if (!userFound) {
                throw new Error('Caretaker not found!');
              }
              return userFound;
            })
          )
        })
      )
  }

  sendRequestForAssetTransfer(fromUser: number, toUser: number, assetIds: number[], message: string): Observable<void> {
    return this.httpClient.post<void>('/rest/assets/transfers', {fromUser, toUser, assetIds, message});
  }

  public getAssetTransfers$(): Observable<AssetTransfer[]> {
    return this.httpClient.get<AssetTransferDto[]>('/rest/assets/transfers').pipe(map(assetsTransferDto => assetsTransferDto.map(assetDto => Transforms.assetsTransferDto(assetDto))));
  }

  public getAssetTransfer$(uuid: string): Observable<AssetTransfer> {
    return this.httpClient.get<AssetTransferDto>('/rest/assets/transfers/' + uuid).pipe(map((assetTransferDto => Transforms.assetsTransferDto(assetTransferDto))))
  }

  getAssetsMap$(): Observable<Map<number, Asset>> {
    return this.assetsService.assetsStore$.getMap$()
  }

  approveTransfer(uuid: string): Observable<void> {
    return this.httpClient.post<void>('/rest/assets/transfers/' + uuid + '/actions/approve', {});
  }

  rejectTransfer(uuid: string): Observable<void> {
    return this.httpClient.post<void>('/rest/assets/transfers/' + uuid + '/actions/reject', {});
  }

  revertTransfer(uuid: string): Observable<void> {
    return this.httpClient.post<void>('/rest/assets/transfers/' + uuid + '/actions/revert', {});
  }

  getStockTakingList$(): Observable<StockTakingList[]> {
    const assets = this.assetsService.getAssets();
    const stockTakings = this.
    return undefined;
  }


}


export enum AssetSource {
  STORE,
  WORKING_LIST,
  SELECTED_IN_GRID
}
