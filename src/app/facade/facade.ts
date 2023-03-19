import {Injectable} from '@angular/core';
import {combineLatest, Observable, switchMap, throwError} from 'rxjs';
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
import {
  StockTakingForList,
  StockTakingListProvider
} from '../assets/components/stock-taking-list/stockTakingListProvider';
import {StockTaking, StockTakingItem, StockTakingService} from '../assets/stock-taking.service';
import {
  StockTakingDetail, StockTakingDetailItem,
  StockTakingDetailProvider
} from '../assets/components/stock-taking-detail/stockTakingDetail.provider';
import {User} from '../users/model/user.model';
import {RightsTag} from '../shared/rights.list';
import {restIp} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Facade implements TransferDataProvider, StockTakingListProvider, StockTakingDetailProvider {

  constructor(
    private assetsService: AssetsService,
    private usersService: UsersService,
    private categoryService: CategoriesService,
    private locationService: LocationService,
    private unitService: UnitsService,
    private tokenService: TokenService,
    private httpClient: HttpClient,
    private stockTakingService: StockTakingService
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
    return this.httpClient.post<void>(restIp + '/assets/transfers', {fromUser, toUser, assetIds, message});
  }

  public getAssetTransfers$(): Observable<AssetTransfer[]> {
    return this.httpClient.get<AssetTransferDto[]>(restIp + '/assets/transfers').pipe(map(assetsTransferDto => assetsTransferDto.map(assetDto => Transforms.assetsTransferDto(assetDto))));
  }

  public getAssetTransfer$(uuid: string): Observable<AssetTransfer> {
    return this.httpClient.get<AssetTransferDto>(restIp + '/assets/transfers/' + uuid).pipe(map((assetTransferDto => Transforms.assetsTransferDto(assetTransferDto))))
  }

  getAssetsMap$(): Observable<Map<number, Asset>> {
    return this.assetsService.assetsStore$.getMap$()
  }

  approveTransfer(uuid: string): Observable<void> {
    return this.httpClient.post<void>(restIp + '/assets/transfers/' + uuid + '/actions/approve', {});
  }

  rejectTransfer(uuid: string): Observable<void> {
    return this.httpClient.post<void>(restIp + '/assets/transfers/' + uuid + '/actions/reject', {});
  }

  revertTransfer(uuid: string): Observable<void> {
    return this.httpClient.post<void>(restIp + '/assets/transfers/' + uuid + '/actions/revert', {});
  }

  getStockTakingList$(): Observable<StockTakingForList[]> {
    const assets$ = this.assetsService.getAssetsMap$();
    const stockTakings$ = this.stockTakingService.fetchStockTakings$();
    const users$ = this.usersService.getUsersMap$();
    return combineLatest([stockTakings$, assets$, users$])
      .pipe(
        map(([stockTakings, assetsMap, usersMap]) => Transforms.getStockTakingsForList({
          stockTakings,
          assetsMap,
          usersMap
        })))
  }

  getStockTakingDetail$(uuid: string): Observable<StockTakingDetail> {
    return combineLatest([this.usersService.getUsersMap$(), this.assetsService.getAssetsMap$(), this.stockTakingService.getStockTaking$(uuid)])
      .pipe(
        map(([usersMap, assetsMap, stockTaking]) => {
            return Facade.transformStockTakingDetail({
              usersMap,
              assetsMap,
              stockTaking
            })
          }
        ));
  }




  private static transformStockTakingDetail(param: { stockTaking: StockTaking; assetsMap: Map<number, Asset>; usersMap: Map<number, User> }): StockTakingDetail {
    const {assetsMap, usersMap, stockTaking} = param;
    const author = usersMap.get(stockTaking.authorId);
    const solver = usersMap.get(stockTaking.solverId);

    if (!author) {
      throw new Error(`author id ${stockTaking.authorId} not found!`);
    }
    if (!solver) {
      throw new Error(`solver id ${stockTaking.solverId} not found!`);
    }

    const items: StockTakingDetailItem[] = Facade.transformStockTakingDetailItems({
      stockTakingItems: stockTaking.items,
      assetsMap: assetsMap
    });

    return {
      author,
      solver,
      items,
      closedAt: stockTaking.closedAt,
      uuid: stockTaking.uuid,
      createdAt: stockTaking.createdAt,
      name: stockTaking.name
    };
  }

  private static transformStockTakingDetailItems(param: { assetsMap: Map<number, Asset>; stockTakingItems: StockTakingItem[] }): StockTakingDetailItem[] {
    const {stockTakingItems, assetsMap} = param;
    return stockTakingItems.map(item => Facade.transformStockTakingDetailItem({item, assetsMap}));
  }

  private static transformStockTakingDetailItem(param: { item: StockTakingItem; assetsMap: Map<number, Asset> }): StockTakingDetailItem {
    const {assetsMap, item} = param;
    const asset = assetsMap.get(item.assetId);

    if (!asset) {
      throw new Error(`Asset id ${item.assetId} not found in stockTakingUuid ${item.stockTakingUuid} `);
    }

    return {
      uuid: item.uuid,
      assetName: asset.name,
      serialNumber: asset.serialNumber,
      note: item.note,
      foundAt: item.foundAt
    };
  }

  isUserAbleToCloseStockTaking$(uuid: string): Observable<boolean> {
    const user$ = this.tokenService.getToken();
    const stockTaking$ = this.stockTakingService.getStockTaking$(uuid);
    return combineLatest([user$, stockTaking$]).pipe(map(([user, stockTaking]) => {
      return !!(user?.rights.includes(RightsTag.createAssets) && stockTaking.authorId === user.userId && !stockTaking.closedAt)
    }));
  }
}


export enum AssetSource {
  STORE,
  WORKING_LIST,
  SELECTED_IN_GRID
}
