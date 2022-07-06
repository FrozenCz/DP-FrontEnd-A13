import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AssetsService, AssetsSourceEnum} from '../../assets.service';
import {BehaviorSubject, combineLatest, OperatorFunction, Subject, Subscription} from 'rxjs';
import {CellEditingStoppedEvent, CellValueChangedEvent, ColDef, GridOptions} from 'ag-grid-community';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {IUserExt} from '../../../users/model/user.model';
import {TokenService} from '../../../auth/token.service';
import {UsersService} from '../../../users/users.service';
import {NbDialogRef} from '@nebular/theme';
import {RightsTag} from '../../../shared/rights.list';
import {UnitsService} from '../../../units/units.service';
import {AgGridInstanceService} from '../../../utils/agGrid/ag-grid-instance.service';
import {AgGridService} from '../../../utils/agGrid/ag-grid.service';
import {AssetChangeEnum, AssetNoteSetTypeEnum, IAssetExtWithChanges} from '../../models/assets.model';
import {GridInstance} from '../../../utils/agGrid/models/grid.model';

@Component({
  selector: 'app-multi-edit-asset-dialog',
  templateUrl: './multi-edit-asset-dialog.component.html',
  styleUrls: ['./multi-edit-asset-dialog.component.scss']
})
export class MultiEditAssetDialogComponent implements OnInit, OnDestroy {
  @Input() source!: AssetsSourceEnum;
  @ViewChild('selectRef') selectRef!: ElementRef;
  unsubscribe: Subject<void> = new Subject<void>();

  assetsChangedList$: BehaviorSubject<IAssetExtWithChanges[]> = new BehaviorSubject<IAssetExtWithChanges[]>([]);
  assets: IAssetExtWithChanges[] = [];
  gridUid = 'multiEditAsset';
  customGridOptions: GridOptions = {};
  customColDefs: ColDef[] = [];
  users$: BehaviorSubject<IUserExt[]> = new BehaviorSubject<IUserExt[]>([]);
  users: IUserExt[] = [];
  selectedUser: IUserExt | undefined = undefined;
  flipped = false;
  note = '';
  ableToChangeUser: boolean = false;
  ableToEditInformation: boolean = false;
  private gridService!: AgGridService;


  constructor(private assetsService: AssetsService,
              private tokenService: TokenService,
              private usersService: UsersService,
              private unitsService: UnitsService,
              private nbDialogRef: NbDialogRef<MultiEditAssetDialogComponent>,
              private gridInstance: AgGridInstanceService
  ) {
    combineLatest([tokenService.getToken(), this.usersService.getUsers$()])
      .pipe(map(([token, users]) => {
        const usersFiltered = users.filter(user => user.reachable);
        this.selectedUser = usersFiltered.find(user => user.id === token?.userId);
        this.ableToChangeUser = this.tokenService.getPermission(RightsTag.changeAssetsUser);
        this.ableToEditInformation = this.tokenService.getPermission(RightsTag.changeAssetsInformation);
        return usersFiltered;
      }),
        takeUntil(this.unsubscribe)
      )
      .subscribe(users => {
        this.users$.next(users);
        this.users = users;
      })

    this.assetsChangedList$.pipe(takeUntil(this.unsubscribe))
      .subscribe(assets => this.assets = assets);
  }

  private static IsUserReachable(params: any): boolean {
    return !!params.data?.asset?.user?.reachable;
  }

  private static GetCellClassForEdit(params: any): string {
    return !!params.data?.asset?.user?.reachable ? 'agGridAbleToEdit' : '';
  }

  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete()
    this.gridInstance.removeGridInstance(this.gridUid);
  }

  async ngOnInit(): Promise<void> {

    this.fetchData();


    this.users$.pipe(filter(notUndefined => !!notUndefined && notUndefined.length > 0),
      take(1),
      takeUntil(this.unsubscribe)
    )
      .subscribe(users => {

        this.customColDefs = [];
        const editAndClass = {
          editable: MultiEditAssetDialogComponent.IsUserReachable,
          cellClass: MultiEditAssetDialogComponent.GetCellClassForEdit
        };

        if (this.ableToEditInformation) {
          this.customColDefs.push(
            {
              colId: AssetChangeEnum.assetSerialNumber,
              ...editAndClass
            },
            {
              colId: AssetChangeEnum.assetInventoryNumber,
              ...editAndClass
            },
            {
              colId: AssetChangeEnum.assetEvidenceNumber,
              ...editAndClass
            },
            {
              colId: AssetChangeEnum.assetIdentificationNumber,
              ...editAndClass
            },
            {
              colId: AssetChangeEnum.assetName,
              ...editAndClass
            },
            {
              colId: AssetChangeEnum.assetNote,
              ...editAndClass
            },
          );
        }

        if (this.ableToChangeUser) {
          this.customColDefs.push({
            colId: AssetChangeEnum.assetUser,
            editable: MultiEditAssetDialogComponent.IsUserReachable,
            cellClass: MultiEditAssetDialogComponent.GetCellClassForEdit, cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
              values: users.map(user => user.fullName),
            },
            valueSetter: (params): any => {
              const newSelectedFullname = params.newValue;
              const newUser = users.find(u => u.fullName === newSelectedFullname);
              return newUser;
            }
          });
        }

      })


    //todo: proc je tu na assets change poveseny listener?
    combineLatest([
      this.gridInstance.getGridInstance(this.gridUid).pipe(filter((grid) => !!grid) as OperatorFunction<GridInstance | undefined, GridInstance>),
      this.assetsChangedList$.pipe(filter(e => !!e) as OperatorFunction<IAssetExtWithChanges[], IAssetExtWithChanges[]>, take(1))])
      .pipe(
        takeUntil(this.unsubscribe))
      .subscribe(([grid, assets]) => {
        this.gridService = grid.gridService;
        setTimeout(() => {
          this.gridService.setSelectOnAllRows();
        });
      })
  }

  onRefreshClicked(): void {
    this.fetchData();
    this.gridService.refreshCells();
  }

  private fetchData(): void {
    this.assetsChangedList$.next(
      this.assetsService.getAssetFromSource(this.source)
        .map((asset) => {
          return {...asset, asset: {...asset.asset}, changes: []};
        }).filter((asset => asset.asset.user.reachable === true ))
    );
  }


  /**
   * change user for selected one foreach selected node
   * @param selectedUser new user
   */
  changeUser(selectedUser: IUserExt | undefined): void {
    if (!selectedUser) {
      throw new Error('user must be defined');
    }

    const changed = this.assetsChangedList$.getValue().map(asset => {
      if (!this.gridService.getSelectedIds().includes(asset.asset.id)) {
        return asset;
      }
      asset.asset.user = {
        id: selectedUser.id,
        name: selectedUser.name,
        surname: selectedUser.surname,
        reachable: selectedUser.reachable,
        unit: selectedUser.unit
      };
      asset.changes = [{type: AssetChangeEnum.assetUser, newValue: selectedUser}];
      return asset;
    });

    this.assetsChangedList$.next(changed);
    this.gridService.refreshCells();
  }

  /**
   * flipcard
   */
  flip(): void {
    this.flipped = !this.flipped;
  }

  /**
   * close dialog
   */
  close(): void {
    this.nbDialogRef.close();
  }

  /**
   * add note to previous note on end
   * @param note string for add to existing note
   * @param type switch type start | end | replace
   */
  setNoteToSelected(note: string, type: AssetNoteSetTypeEnum): void {
    const changed = this.assetsChangedList$.getValue().map(asset => {
      if (!this.gridService.getSelectedIds().includes(asset.asset.id)) {
        return asset;
      }
      let newValue = '';
      const previousValue = asset.asset.note ? asset.asset.note : '';
      switch (type) {
        case AssetNoteSetTypeEnum.start:
          newValue = note + previousValue;
          break;
        case AssetNoteSetTypeEnum.end:
          newValue = previousValue + note;
          break;
        case AssetNoteSetTypeEnum.replace:
          newValue = note;
          break;
      }
      asset.asset.note = newValue;
      asset.changes = [...asset.changes?.filter(ch => ch.type !== AssetChangeEnum.assetNote), {type: AssetChangeEnum.assetNote, newValue}];
      return asset;
    });

    this.assetsChangedList$.next(changed);
    this.gridService.refreshCells();
  }

  async onSaveClicked(): Promise<void> {
    const changes = this.assetsChangedList$.getValue().map(asset => {
      return {
        id: asset.asset.id,
        assetChanges: asset.changes
      };
    }).filter(ch => ch.assetChanges.length);


    this.assetsService.changesBulk(changes, this.source);

  }

  onCellValueChanged($event: CellValueChangedEvent): void {
    // const columnId = $event.column.getColId() as AssetChangeEnum;
    // const assetId = +$event.node.id;
    //
    // if (!Object.values(AssetChangeEnum).includes(columnId)) {
    //   return;
    // }
    //
    // const updatedAssets = this.assetsChangedList$.getValue().map(asset => {
    //   if (asset.asset.id !== assetId) {
    //     return asset;
    //   }
    //   asset.changes = [...asset.changes?.filter(ch => ch.type !== columnId), {type: columnId, newValue: $event.newValue}];
    //   return asset;
    // });
    //
    // this.assetsChangedList$.next(updatedAssets);
  }

  onCellEditingStopped($event: CellEditingStoppedEvent): void {
    const columnId = $event.column.getColId() as AssetChangeEnum;
    let assetId: number = 0;
    if ($event && $event.node && $event.node.id) {
      assetId = +$event.node.id;
    }

    if (assetId === 0) {
      throw new Error('havent got asset id');
    }


    if (!Object.values(AssetChangeEnum).includes(columnId)) {
      return;
    }

    const updatedAssets = this.assetsChangedList$.getValue().map(asset => {
      if (asset.asset?.id !== assetId) {
        return asset;
      }

      // user is an object and this needs to have special logic on it
      if (columnId === AssetChangeEnum.assetUser) {
        const newUserFullname = $event.newValue;
        const newUser = this.users$.getValue().find(user => user.fullName === newUserFullname);
        if (newUser) {
          asset.asset.user = newUser;
          $event.newValue = newUser;
        }
      }

      asset.changes = [...asset.changes?.filter(ch => ch.type !== columnId), {type: columnId, newValue: $event.newValue}];
      return asset;
    });

    this.assetsChangedList$.next(updatedAssets);
  }


  isAnyChangePresent(): boolean {
    return this.assetsChangedList$.getValue().some(asset => asset.changes.length > 0);
  }
}
