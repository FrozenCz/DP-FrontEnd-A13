import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  Asset,
  AssetChangeEnum,
  AssetModelExt,
  AssetNote,
  AssetState,
  Change,
  ICreateAsset,
  IRemoveAssetsInformation
} from './models/assets.model';
import {BehaviorSubject, combineLatest, firstValueFrom, noop, Observable} from 'rxjs';
import {debounceTime, filter, finalize, map, shareReplay} from 'rxjs/operators';
import {TokenService} from '../auth/token.service';
import {CategoriesService} from '../categories/categories.service';
import {UnitsService} from '../units/units.service';
import {Unit} from '../units/models/unit.model';
import {NbToastrService} from '@nebular/theme';
import {UsersService} from '../users/users.service';
import {Store} from '../store/store';
import {AssetSource} from '../facade/facade';
import {AssetsModelDto, SaveImageToAssetDto} from './models/assets.dto';

interface ChangeUserBulk {
  assetId: number;
  newUserId: number;
}

interface IRemovingDocument {
  id: number;
  created: Date;
  removingDocumentIdentification: string;
  documentDate: Date;
  possibleRemovingDate: Date;
  assets: AssetsModelDto[];
}

export interface BackendAcceptableAssetUpdateInformationBulk {
  assetId: number;
  name?: string;
  serialNumber?: string;
  inventoryNumber?: string;
  evidenceNumber?: string;
  identificationNumber?: string;
  note?: string;
}

export interface IAssetsExtFilter {
  parentCategoryId?: number;
  userId?: number;
}

export interface IAssetsExt {
  id: number;
  asset: AssetModelExt;
  categories: string[];
}

export interface IAssetsExtPure {
  id: number;
  categoryName: string;
  name: string;
  quantity: number;
  userName: string;
  serialNumber: string;
  inventoryNumber: string;
  evidenceNumber: string;
  identificationNumber: string;
  inquiryDate: Date;
  document: string;
  inquiryPrice: number;
  locationName: string;
  locationEtc: string;
  note: string;
  state: AssetState;
  categories: string[];
  reachable: boolean;
}


export enum AssetsSourceEnum {
  GRID = 1,
  WORKING_LIST,
}

interface ChangeBulk {
  id: number;
  assetChanges: Change[];
}

interface RemoveAssetsDto {
  removingDocumentIdentification: string;
  documentDate: Date;
  possibleRemovingDate: Date;
  assetsIds: number[];
}

@Injectable({providedIn: 'root'})
export class AssetsService {
  assetsStore$: Store<Asset> = new Store<Asset>({identifierName: 'id'});

  private assetsSelectedInGridList$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  private assetsWorkingList$: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

  private reachableUnitsIds: number[] = [];

  private allUnits: Unit[] = [];

  quickFilterStore: BehaviorSubject<string> = new BehaviorSubject<string>('');
  quickFilter$ = this.quickFilterStore.asObservable();
  quickFilterTimeout = 200;
  quickFilterIntervalSet: any;


  constructor(private http: HttpClient,
              private tokenService: TokenService,
              private categoriesService: CategoriesService,
              private toastrService: NbToastrService,
              private usersService: UsersService,
              private unitsService: UnitsService) {

    combineLatest([
      this.tokenService.getToken(),
      this.unitsService.getUnits(),
      this.unitsService.getAllUnits()
    ]).pipe(
      filter(([token, units]) => token && units?.length > 0 || !token)
    ).subscribe(([token, units, allUnits]) => {
      this.reachableUnitsIds = units.map(unit => unit.id);
      this.allUnits = allUnits;
      this.loadAssets().catch((err) => console.log(err));
    });

    //todo: je treba udelat aby pri zmene se projevila i zmena na working list.... ale proc tam nejsou jen id?
    // this.assets$.subscribe((assets) => {
    //   this.assetsWorkingList$.next(this.assetsWorkingList$.getValue()
    //     .filter(awl => assets.filter(a => a.state === AssetState.actual)
    //       .map(a => a.id)
    //       .includes(awl)));
    // });

  }

  private static transformAssetDTOtoAsset(assetModelDTO: AssetsModelDto): Asset {
    return new Asset(
      assetModelDTO.category_id,
      assetModelDTO.id,
      assetModelDTO.name,
      assetModelDTO.quantity,
      assetModelDTO.user_id,
      assetModelDTO.serialNumber,
      assetModelDTO.inventoryNumber,
      assetModelDTO.evidenceNumber,
      assetModelDTO.identificationNumber,
      new Date(assetModelDTO.inquiryDate),
      assetModelDTO.document,
      assetModelDTO.inquiryPrice,
      assetModelDTO.location_uuid,
      assetModelDTO.locationEtc,
      assetModelDTO.note,
      assetModelDTO.state,
      assetModelDTO.attachments
    )
  }

  private static transformInformationUpdateBulk(updateInformation: ChangeBulk[]): BackendAcceptableAssetUpdateInformationBulk[] {
    return updateInformation.map(update => {
      const updForBck: BackendAcceptableAssetUpdateInformationBulk = {
        assetId: update.id,
      };
      update.assetChanges.forEach((change: any) => {
        switch (change.type) {
          case AssetChangeEnum.assetSerialNumber:
            updForBck.serialNumber = change.newValue;
            break;
          case AssetChangeEnum.assetInventoryNumber:
            updForBck.inventoryNumber = change.newValue;
            break;
          case AssetChangeEnum.assetEvidenceNumber:
            updForBck.evidenceNumber = change.newValue;
            break;
          case AssetChangeEnum.assetIdentificationNumber:
            updForBck.identificationNumber = change.newValue;
            break;
          case AssetChangeEnum.assetName:
            updForBck.name = change.newValue;
            break;
          case AssetChangeEnum.assetNote:
            updForBck.note = change.newValue;
            break;
        }
      });
      return updForBck;
    });
  }

  async loadAssets(): Promise<void> {
    try {
      const assetsList = await firstValueFrom(this.fetchAssets());
      if (assetsList) {
        this.assetsStore$.putData(assetsList);
      } else {
        this.assetsStore$.putData([]);
      }
    } catch (e: any) {
      console.error(e);
      if ([401, 403].includes(e.error.statusCode)) {
        this.assetsStore$.putData([]);
      }
    }
  }

  private fetchAssets(): Observable<Asset[]> {
    return this.http.get<AssetsModelDto[]>('/rest/assets')
      .pipe(
        map((assets) => {
            return assets.map(asset => AssetsService.transformAssetDTOtoAsset(asset));
          },
        ),
      )
  }

  public assetsWorkingListIds$(): Observable<number[]> {
    return this.assetsWorkingList$.asObservable();
  }

  public getAssetsSelectedInGridList$(): Observable<Map<number, Asset>> {
    return combineLatest([this.assetsSelectedInGridList$, this.assetsStore$.getMap$()]).pipe(debounceTime(20), map(([inGrid, assets]) => {
      const selectedInGrid: Map<number, Asset> = new Map<number, Asset>();
      for (const assetId of inGrid) {
        const found = assets.get(assetId);
        if (found && found.state === AssetState.actual) {
          selectedInGrid.set(assetId, found);
        }
      }
      return selectedInGrid;
    }))
  }


  changeAssetUser(assetId: number, user_id: number): Observable<void> {
    return this.http.patch<void>('/rest/assets/' + assetId + '/changeUser', {userId: user_id})
  }

  //todo:  change subsrcibers
  changeAssetInformation(assetId: number, changes: Partial<AssetsModelDto>): Observable<void> {
    return this.http.patch<void>('/rest/assets/' + assetId + '/information', {...changes})
    // .pipe(map(asset => AssetsService.extendAssetModel(asset, this.allUnits, this.reachableUnitsIds)))
    // .pipe(tap(updatedAsset => this.updateAssetsStore(updatedAsset)));
  }

  // getAssetsRawList(): Observable<AssetModelExt[]> {
  //   return this.assets$.asObservable();
  // }

  getQuickFilter(): Observable<string> {
    return this.quickFilter$;
  }

  setQuickFilter(text: string): void {
    clearTimeout(this.quickFilterIntervalSet);
    this.quickFilterIntervalSet = setTimeout(() => this.quickFilterStore.next(text), this.quickFilterTimeout);
  }

  /**
   * function that watch on assets$ change and if it, it recalculate categories
   */
  // private enhanceAssetsWithCategories(): void {
  //   combineLatest([this.getAssetsRawList(), this.categoriesService.getCategories()])
  //     .pipe(
  //       filter(([rawList, cats]) => !!rawList && !!cats),
  //       map(([assetList, categories]) => assetList.map((asset) => {
  //         const cc = categories.find(cat => cat.id === asset?.category.id)?.columnValues;
  //         const ccc = this.categoriesService.getColumnValuesInArray(cc);
  //         return {
  //           asset,
  //           categories: ccc
  //         };
  //       })))
  //     .subscribe((enhancedModelArray: any[]) => {
  //         this.assetsList$.next(enhancedModelArray);
  //       }
  //     );
  // }

  isInWorkingList(assetId: number): boolean {
    return this.assetsWorkingList$.getValue().some(asset => asset === assetId);
  }

  getAssets(assetFilter?: IAssetsExtFilter): Observable<Asset[]> {
    if (assetFilter) {
      if (assetFilter.parentCategoryId) {
        return combineLatest([this.assetsStore$.getAll$(), this.categoriesService.getDescendants(assetFilter.parentCategoryId)])
          .pipe(
            shareReplay(),
            filter(([_, categories]) => !!categories))
          .pipe(
            map(([assets, _]) => assets)
          )
      }
      if (assetFilter.userId) {
        return this.assetsStore$.getAll$().pipe(map(assets => assets.filter(asset => asset.user_id === assetFilter.userId)));
      }
    }
    return this.assetsStore$.getAll$();
  }

  getAssetsWorkingList$(): Observable<Map<number, Asset>> {
    return combineLatest([this.assetsWorkingList$, this.assetsStore$.getMap$()]).pipe(
     map(([inGrid, assets]) => {
        const selectedInGrid: Map<number, Asset> = new Map<number, Asset>();
        for (const assetId of inGrid) {
          const found = assets.get(assetId);
          if (found && found.state === AssetState.actual) {
            selectedInGrid.set(assetId, found);
          }
        }
        return selectedInGrid;
      }))
  }

  public addAssetIdToWorkingList(assetId: number): void {
    const updatedList = [...this.assetsWorkingList$.getValue(), assetId];
    this.assetsWorkingList$.next(updatedList);
  }

  public async addToSelectedInGrid(assetId: number): Promise<void> {
    const found = (await firstValueFrom(this.assetsStore$.getMap$())).get(assetId);

    if (!found) {
      throw new Error('item not found');
    }
    const assetsSelectedInGridListUpdate = [...this.assetsSelectedInGridList$.getValue().filter(id => id !== assetId), assetId];
    this.assetsSelectedInGridList$.next(assetsSelectedInGridListUpdate);
  }

  public removeFromSelectedInGrid(assetId: number): number[] {
    const assetsSelectedInGridListUpdate = [...this.assetsSelectedInGridList$.getValue().filter(id => id !== assetId)];
    this.assetsSelectedInGridList$.next(assetsSelectedInGridListUpdate);
    return assetsSelectedInGridListUpdate;
  }


  removeFromAssetsWorkingList(assetsId: number): number[] {
    const workingList = this.assetsWorkingList$.getValue();

    const workingListUpdated = [...workingList.filter(asset => asset !== assetsId)];
    this.assetsWorkingList$.next(workingListUpdated);

    return workingListUpdated;
  }


  createAsset(asset: ICreateAsset): Observable<AssetsModelDto> {
    return this.http.post<AssetsModelDto>('/rest/assets', asset);
  }

  getRawAsset(assetId: number): Observable<Asset> {
    return this.assetsStore$.getOne$(assetId)
  }

  updateAsset(changes: Partial<AssetModelExt>, assetId: number): Observable<AssetModelExt> {
    return this.http.patch<AssetModelExt>('/rest/assets/' + assetId, {changes})
  }

  addAssetsIdToWorkingList(ids: number[]): void {
    const updatedList = [...this.assetsWorkingList$.getValue().filter(extModel => !ids.includes(extModel)), ...ids];
    this.assetsWorkingList$.next(updatedList);
  }

  resetSelectedIds(): void {
    this.assetsSelectedInGridList$.next([]);
  }


  clearWorkingList(): void {
    this.assetsWorkingList$.next([]);
  }

  changesBulk(changes: ChangeBulk[], source: AssetSource): void {
    const switchUser: ChangeUserBulk[] = [];
    const updateInformation: { id: number, assetChanges: Change[] }[] = [];
    const lock$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    changes.forEach(change => {
      change.assetChanges.forEach((assetChange: any) => {
        if (assetChange.type === AssetChangeEnum.assetUser) {
          switchUser.push({assetId: change.id, newUserId: assetChange.newValue.id});
        } else {
          const found = updateInformation.find(upd => upd.id === change.id);
          if (found) {
            found.assetChanges.push(assetChange);
          } else {
            updateInformation.push({id: change.id, assetChanges: [assetChange]});
          }
        }
      });
    });

    if (switchUser.length > 0) {
      const switchUser$ = lock$.subscribe((locked) => {
        if (!locked) {
          lock$.next(true);
          this.changeAssetUserBulk(switchUser)
            .pipe(finalize(() => {
              switchUser$.unsubscribe();
              lock$.next(false);
            }))
            .subscribe(() => {
              this.toastrService.success('byly úspěšně aktualizovány', 'Uživatelé');

            }, error => {
              this.toastrService.danger('se nepovedlo změnit', 'Uživatele');
            });
        }
      });
    }

    if (updateInformation.length > 0) {
      const updateInfo$ = lock$.subscribe((locked) => {
        if (!locked) {
          lock$.next(true);
          this.changeAssetInformationBulk(AssetsService.transformInformationUpdateBulk(updateInformation))
            .pipe(finalize(() => {
              updateInfo$.unsubscribe();
              lock$.next(false);
            }))
            .subscribe(() => {
              this.toastrService.success('byly úspěšně aktualizovány', 'Informace');
            }, error => {
              this.toastrService.danger('se nepovedlo upravit', 'Informace');
            });
        }
      });
    }
  }


  private changeAssetUserBulk(switchUser: ChangeUserBulk[]): Observable<void> {
    return this.http.patch<void>('/rest/assets/changeAssetUserBulk', switchUser)
  }

  private changeAssetInformationBulk(updateInformation: BackendAcceptableAssetUpdateInformationBulk[]): Observable<void> {
    return this.http.patch<void>('/rest/assets/changeAssetInformationBulk', updateInformation)
  }

  removeAssets(removingInformation: IRemoveAssetsInformation, removedAssetsIds: IAssetsExt[]): Observable<void> {
    const removeAssetsDto: RemoveAssetsDto = {
      ...removingInformation,
      assetsIds: removedAssetsIds.map(asset => asset.asset.id)
    };
    return this.http.request<void>('delete', '/rest/assets', {body: removeAssetsDto})
  }

  createAssetNote(assetId: number, note: string): Observable<AssetNote> {
    return this.http.post<AssetNote>('/rest/assets/' + assetId + '/note', {note});
  }

  wsAssetsUpdate(changes: AssetsModelDto[]): void {
    this.assetsStore$.update(changes.map(a => AssetsService.transformAssetDTOtoAsset(a))).then(noop);
  }

  saveImageToAsset(croppedImage: SaveImageToAssetDto, id: number): Observable<void> {
    return this.http.post<void>('/rest/assets/'+id+'/images', croppedImage);
  }
}
