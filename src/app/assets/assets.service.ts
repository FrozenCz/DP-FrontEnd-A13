import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  AssetChangeEnum,
  AssetModelExt,
  AssetNote,
  AssetState,
  Change,
  IAssetUser,
  ICreateAsset,
  IRemoveAssetsInformation, AssetsModelDto
} from './models/assets.model';
import {BehaviorSubject, combineLatest, Observable, OperatorFunction, throwError} from 'rxjs';
import {debounceTime, filter, finalize, map, shareReplay, tap} from 'rxjs/operators';
import {TokenService} from '../auth/token.service';
import {CategoriesService} from '../categories/categories.service';
import {UnitsService} from '../units/units.service';
import {Unit} from '../units/models/unit.model';
import {NbToastrService} from '@nebular/theme';


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
  asset: AssetModelExt;
  categories: string[];
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
  private assets$: BehaviorSubject<AssetModelExt[]> = new BehaviorSubject<AssetModelExt[]>([]);
  private assetsList$: BehaviorSubject<IAssetsExt[]> = new BehaviorSubject<IAssetsExt[]>([]);
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
              private unitsService: UnitsService) {

    // // -- web sockets --/
    // this.websocketService.listen()
    //   .pipe(
    //     tap(console.log)
    //     // filter(ev => ev.event === AssetsWs.assetsUpdate),
    //     // filter((val, index) => index > 1),
    //     filter((res) => !!res.data && !!this.allUnits && !!this.reachableUnitsIds))
    //   .subscribe((response) => {
    //     console.log(response);
    //     // const updatedAssets: AssetModel[] = response.data;
    //     // if (updatedAssets.length > 0) {
    //     //   const assets = this.assets$.getValue();
    //     //   updatedAssets?.forEach(updatedAsset => {
    //     //     const assetIndex = assets.findIndex(ast => ast.id === updatedAsset.id);
    //     //     if (assetIndex > -1) { // if update
    //     //       assets[assetIndex] = AssetsService.extendAssetModel(updatedAsset, this.allUnits, this.reachableUnitsIds);
    //     //     } else { // if new
    //     //       assets.push(AssetsService.extendAssetModel(updatedAsset, this.allUnits, this.reachableUnitsIds));
    //     //     }
    //     //   });
    //     //   this.assets$.next(assets);
    //     // }
    //   });
    // -- end of web sockets --/

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

    this.assets$.subscribe((assets) => {
      this.assetsWorkingList$.next(this.assetsWorkingList$.getValue()
        .filter(awl => assets.filter(a => a.state === AssetState.actual)
          .map(a => a.id)
          .includes(awl)));
    });

  }

  /**
   * enhance assetModel with unit and reachable indicator
   * @param assetModel asset for enhance
   * @param allUnits all units, include unreachable
   * @param reachableUnitsIds units on same position in tree or below
   */
  private static extendAssetModel(assetModel: AssetsModelDto, allUnits: Unit[], reachableUnitsIds: number[]): AssetModelExt {
    if (allUnits.length < 1) {
      throw new Error('must be provided some units');
    }
    const unit = allUnits.find(u => u.id === assetModel.user?.unit?.id);
    if (!unit) {
      throw new Error('unit muss be specified')
    }
    return {
      ...assetModel,
      user: {
        ...assetModel.user,
        unit,
        reachable: !!reachableUnitsIds.includes(unit?.id)
      }
    };
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


  public getAssetsSelectedInGridList$(): Observable<IAssetsExt[]> {
    return combineLatest([this.assetsSelectedInGridList$, this.assetsList$]).pipe(debounceTime(20), map(([inGrid, assets]) =>
      assets.filter(a => inGrid.includes(a.asset.id))
        .filter(asset => asset.asset.state === AssetState.actual)));
  }

  async loadAssets(): Promise<void> {
    try {
      const assetsList = await this.fetchAssets().toPromise();
      if (assetsList) {
        this.assets$.next(assetsList);
      } else {
        this.assets$.next([]);
      }
      this.enhanceAssetsWithCategories();
    } catch (e: any) {
      console.log(e);
      if ([401, 403].includes(e.error.statusCode)) {
        this.assets$.next([]);
      }
    }
  }

  fetchAssets(): Observable<AssetModelExt[]> {
    return this.http.get<AssetsModelDto[]>('/rest/assets')
      .pipe(
        tap((asets) => console.log('před', asets)),
        map(assets => {
            return assets.map(asset => AssetsService.extendAssetModel(asset, this.allUnits, this.reachableUnitsIds));
          },
          tap((asets) => console.log(asets)),
        ),
        tap((asets) => console.log('po', asets)),
      );
  }

  changeAssetUser(assetId: number, user: IAssetUser): Observable<AssetModelExt> {
    return this.http.patch<AssetsModelDto>('/rest/assets/' + assetId + '/changeUser', {userId: user.id})
      .pipe(
        filter(asset => !!asset),
        map(asset => {
          if (asset) {
            const assets = this.assets$.getValue();
            const assetIndex = assets.findIndex(ast => ast.id === assetId);
            const updatedAsset = AssetsService.extendAssetModel(asset, this.allUnits, this.reachableUnitsIds);
            assets[assetIndex] = updatedAsset;
            this.assets$.next(assets);
            return updatedAsset;
          } else {
            throw new Error('assets not found')
          }
        }))
      .pipe(tap(updatedAsset => this.updateAssetsStore(updatedAsset)));
  }

  changeAssetInformation(assetId: number, changes: Partial<AssetsModelDto>): Observable<AssetModelExt> {
    return this.http.patch<AssetsModelDto>('/rest/assets/' + assetId + '/information', {...changes})
      .pipe(map(asset => AssetsService.extendAssetModel(asset, this.allUnits, this.reachableUnitsIds)))
      .pipe(tap(updatedAsset => this.updateAssetsStore(updatedAsset)));
  }

  getAssetsRawList(): Observable<AssetModelExt[]> {
    return this.assets$.asObservable();
  }

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
  private enhanceAssetsWithCategories(): void {
    combineLatest([this.getAssetsRawList(), this.categoriesService.getCategories()])
      .pipe(
        filter(([rawList, cats]) => !!rawList && !!cats),
        map(([assetList, categories]) => assetList.map((asset) => {
          const cc = categories.find(cat => cat.id === asset?.category.id)?.columnValues;
          const ccc = this.categoriesService.getColumnValuesInArray(cc);
          return {
            asset,
            categories: ccc
          };
        })))
      .subscribe((enhancedModelArray: any[]) => {
          this.assetsList$.next(enhancedModelArray);
        }
      );
  }

  isInWorkingList(assetId: number): boolean {
    return this.assetsWorkingList$.getValue().some(asset => asset === assetId);
  }

  getAssets(assetFilter?: IAssetsExtFilter): Observable<IAssetsExt[]> {
    if (assetFilter) {
      if (assetFilter.parentCategoryId) {
        return combineLatest([this.assetsList$, this.categoriesService.getDescendants(assetFilter.parentCategoryId)])
          .pipe(
            shareReplay(),
            filter(([, categories]) => !!categories))
          .pipe(
            map(([assets, onlyCategories]) => assets.filter(asset => onlyCategories.map(cat => cat.id).includes(asset.asset.category.id)))
          );
      }
      if (assetFilter.userId) {
        return this.assetsList$.pipe(map(assets => assets.filter(asset => asset.asset.user.id === assetFilter.userId)));
      }
    }
    return this.assetsList$;
  }

  getAssetsWorkingList$(): Observable<IAssetsExt[]> {
    return combineLatest([this.assetsWorkingList$, this.assetsList$]).pipe(
      shareReplay(),
      map(([workingList, assets]) =>
        assets.filter(a => workingList.includes(a.asset.id))
          .filter(asset => asset.asset.state === AssetState.actual)));
  }

  public addAssetIdToWorkingList(assetId: number): number[] {
    const found = this.assetsList$.getValue().find(extModel => extModel.asset.id === assetId)?.asset.id;

    if (!found) {
      throw new Error('item not found');
    }

    if (this.isInWorkingList(assetId)) {
      // return;
      throwError('This item is already in working list');
    }

    const updatedList = [...this.assetsWorkingList$.getValue(), found];

    this.assetsWorkingList$.next(updatedList);
    return updatedList;
  }

  public addToSelectedInGrid(assetId: number): number[] {
    const found = this.assetsList$.getValue().find(extModel => extModel.asset.id === assetId)?.asset.id;

    if (!found) {
      throw new Error('item not found');
    }
    const assetsSelectedInGridListUpdate = [...this.assetsSelectedInGridList$.getValue().filter(id => id !== assetId), found];
    this.assetsSelectedInGridList$.next(assetsSelectedInGridListUpdate);
    return assetsSelectedInGridListUpdate;
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

  // createAsset(asset: ICreateAsset): Observable<AssetModelExt> {
  //   return this.http.post<AssetModelExt>('/rest/assets', asset)
  //     .pipe(
  //       catchError(err => {
  //         return throwError(err);
  //       }),
  //       tap((newAsset) => {
  //         const newAssetList: AssetModelExt[] = [...this.assets$.getValue(), newAsset];
  //         this.assets$.next(newAssetList);
  //       })
  //     );
  // }
  createAsset(asset: ICreateAsset): Observable<AssetsModelDto> {
    return this.http.post<AssetsModelDto>('/rest/assets', asset);
  }

  getRawAsset(assetId: number): Observable<AssetModelExt> {
    return this.assets$.pipe(
      map(assets => assets.find(asset => asset.id === assetId)),
      filter(rel => !!rel) as OperatorFunction<AssetModelExt | undefined, AssetModelExt>
    );
  }

  updateAsset(changes: Partial<AssetModelExt>, assetId: number): Observable<AssetModelExt> {
    return this.http.patch<AssetModelExt>('/rest/assets/' + assetId, {changes})
      .pipe(tap(console.log));
  }

  addAssetsIdToWorkingList(ids: number[]): number[] {
    const found = this.assetsList$.getValue().filter(extModel => ids.includes(extModel.asset.id)).map(a => a.asset.id);

    const updatedList = [...this.assetsWorkingList$.getValue().filter(extModel => !ids.includes(extModel)), ...found];
    this.assetsWorkingList$.next(updatedList);
    return updatedList;
  }

  resetSelectedIds(): void {
    this.assetsSelectedInGridList$.next([]);
  }

  getAssetFromSource(sourceType: AssetsSourceEnum): IAssetsExt[] {
    let source = [];
    switch (sourceType) {
      case AssetsSourceEnum.GRID:
        source = this.getAssetsSelectedInGridList();
        break;
      case AssetsSourceEnum.WORKING_LIST:
        source = this.getAssetsWorkingList();
        break;
    }
    return [...source];
  }

  clearWorkingList(): void {
    this.assetsWorkingList$.next([]);
  }

  private getAssetsSelectedInGridList(): IAssetsExt[] {
    return this.assetsList$.getValue().filter(asset => this.assetsSelectedInGridList$.getValue().includes(asset.asset.id));
  }

  private getAssetsWorkingList(): IAssetsExt[] {
    return this.assetsList$.getValue().filter(asset => this.assetsWorkingList$.getValue().includes(asset.asset.id));
  }


  private updateAssetsStore(updatedAsset: AssetModelExt): void {
    const assets = this.assets$.getValue();
    const updatedAssetIndex = assets.findIndex(asset => asset.id === updatedAsset.id);
    assets[updatedAssetIndex] = updatedAsset;
    this.assets$.next(assets);
  }

  changesBulk(changes: ChangeBulk[], source: AssetsSourceEnum): void {
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


  private changeAssetUserBulk(switchUser: ChangeUserBulk[]): Observable<AssetModelExt[]> {
    return this.http.patch<AssetsModelDto[]>('/rest/assets/changeAssetUserBulk', switchUser)
      .pipe(
        map((assetModels) =>
          assetModels.map(assetModel => AssetsService.extendAssetModel(assetModel, this.allUnits, this.reachableUnitsIds))
        ))
      .pipe(tap((changedAssets) => {
        const assets = this.assets$.getValue();
        changedAssets?.forEach((changed) => {
          const indexAsset = assets.findIndex(a => a.id === changed.id);
          assets[indexAsset] = changed;
        });
        this.assets$.next(assets);
      }));
  }

  private changeAssetInformationBulk(updateInformation: BackendAcceptableAssetUpdateInformationBulk[]): Observable<AssetModelExt[]> {
    return this.http.patch<AssetsModelDto[]>('/rest/assets/changeAssetInformationBulk', updateInformation)
      .pipe(
        map((assetModels) =>
          assetModels.map(assetModel => AssetsService.extendAssetModel(assetModel, this.allUnits, this.reachableUnitsIds))
        ))
      .pipe(tap((changedAssets) => {
        const assets = this.assets$.getValue();
        changedAssets?.forEach((changed) => {
          const indexAsset = assets.findIndex(a => a.id === changed.id);
          assets[indexAsset] = changed;
        });
        this.assets$.next(assets);
      }));
  }

  removeAssets(removingInformation: IRemoveAssetsInformation, removedAssetsIds: IAssetsExt[]): Observable<AssetModelExt[]> {

    const removeAssetsDto: RemoveAssetsDto = {
      ...removingInformation,
      assetsIds: removedAssetsIds.map(asset => asset.asset.id)
    };
    return this.http.request<IRemovingDocument>('delete', '/rest/assets', {body: removeAssetsDto})
      .pipe(
        map(removingDocument => removingDocument.assets),
        map((assetModels) =>
          assetModels.map(assetModel => AssetsService.extendAssetModel(assetModel, this.allUnits, this.reachableUnitsIds))
        ))
      .pipe(tap((changedAssets) => {
        const assets = this.assets$.getValue();
        changedAssets?.forEach((changed) => {
          const indexAsset = assets.findIndex(a => a.id === changed.id);
          assets[indexAsset] = changed;
        });
        this.assets$.next(assets);
      }));
  }

  createAssetNote(assetId: number, note: string): Observable<AssetNote> {
    return this.http.post<AssetNote>('/rest/assets/' + assetId + '/note', {note});
  }

  wsAssetsUpdate(changes: AssetsModelDto[]): void {
    if (!this.allUnits || !this.reachableUnitsIds) {
      return;
    }
    const updatedAssets: AssetsModelDto[] = changes;
    if (updatedAssets.length > 0) {
      const assets = this.assets$.getValue();
      updatedAssets?.forEach(updatedAsset => {
        const assetIndex = assets.findIndex(ast => ast.id === updatedAsset.id);
        if (assetIndex > -1) { // if update
          assets[assetIndex] = AssetsService.extendAssetModel(updatedAsset, this.allUnits, this.reachableUnitsIds);
        } else { // if new
          assets.push(AssetsService.extendAssetModel(updatedAsset, this.allUnits, this.reachableUnitsIds));
        }
      });
      this.assets$.next(assets);
    }
  }
}
