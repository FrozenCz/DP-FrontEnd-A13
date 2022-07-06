import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {NavActionsEnum} from './navActions.enum';
import {TokenService} from '../../auth/token.service';
import {RightsTag} from '../../shared/rights.list';
import {AssetsService, AssetsSourceEnum, IAssetsExt} from '../../assets/assets.service';
import {Observable, of, Subscription} from 'rxjs';
import {DialogService} from '../../services/dialog.service';
import {AgGridInstanceService} from '../../utils/agGrid/ag-grid-instance.service';
import {take} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';


export interface NavButClickedEmit {
  action: NavActionsEnum;
  context?: {};
}


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class NavigationComponent implements OnInit, OnDestroy {
  @Output() navigationButtonClicked = new EventEmitter<NavButClickedEmit>();
  @Input() usersSelected: boolean = false;
  @Input() activeTab: string = '';

  navActionsEnum = NavActionsEnum;
  createUserAllowed = false;
  deleteUserAllowed = false;
  updateUsersInformation = false;

  assetsCreateAllowed = false;
  assetsInformationUpdateAllowed = false;
  assetsUserChangeAllowed = false;
  assetsRemoveAllowed = false;

  createUnitsAllowed = false;

  categoriesCreateAllowed = false;

  userLogged = false;
  reachableItems = 0;
  subs: Subscription[] = [];
  subMenuHidden = false;


  itemsInWorkingList = 0;
  itemsInWorkingListReachable = 0;
  selectedItemInGrid: IAssetsExt[] = [];
  workingList$!: Observable<IAssetsExt[]>;

  constructor(private tokenService: TokenService,
              public assetsService: AssetsService,
              private dialogService: DialogService,
              private agGridService: AgGridInstanceService,
              private changeDetector: ChangeDetectorRef,
              private route: ActivatedRoute) {
  }

  ngOnDestroy(): void {
    this.subs?.forEach(sub => sub.unsubscribe());
  }

  ngOnInit(): void {

    this.tokenService.getToken().subscribe(
      (token) => {
        this.userLogged = !!token;
        this.createUserAllowed = this.tokenService.getPermission(RightsTag.createUser);
        this.deleteUserAllowed = this.tokenService.getPermission(RightsTag.deleteUser);
        this.updateUsersInformation = this.tokenService.getPermission(RightsTag.updateUsersInformation);

        this.assetsCreateAllowed = this.tokenService.getPermission(RightsTag.createAssets);
        this.assetsInformationUpdateAllowed = this.tokenService.getPermission(RightsTag.changeAssetsInformation);
        this.assetsUserChangeAllowed = this.tokenService.getPermission(RightsTag.changeAssetsUser);
        this.assetsRemoveAllowed = this.tokenService.getPermission(RightsTag.removeAssets);

        this.createUnitsAllowed = this.tokenService.getPermission(RightsTag.createUnits);

        this.categoriesCreateAllowed = this.tokenService.getPermission(RightsTag.createCategory);

      }
    );

    this.workingList$ = this.assetsService.getAssetsWorkingList$();
    this.subs.push(this.workingList$.subscribe((workingList) => {
      this.itemsInWorkingList = workingList.length;
      this.itemsInWorkingListReachable = workingList.filter(asset => asset.asset?.user?.reachable).length;
    }));

    this.subs.push(this.assetsService.getAssetsSelectedInGridList$().subscribe(
      items => {
        this.selectedItemInGrid = items;
        this.reachableItems = items.filter(asset => asset.asset?.user?.reachable).length;
        this.changeDetector.detectChanges();
      }));
  }

  isTabActive = (url: string): boolean => {
    if (this.activeTab?.length === 1 && url === '') {
      return true;
    }
    if (this.activeTab) {
      return url === this.activeTab;
    }
    return false;
  }



  menuChange($event: any): void {
    if (this.activeTab) {
      switch ($event.tabTitle.toLowerCase()) {
        case 'uživatelé':
          this.navigationButtonClicked.emit({action: NavActionsEnum.menuUsers});
          break;
        case 'majetek':
          this.navigationButtonClicked.emit({action: NavActionsEnum.menuAssets});
          break;
        case 'jednotky':
          this.navigationButtonClicked.emit({action: NavActionsEnum.menuUnits});
          break;
        case 'kategorie':
          this.navigationButtonClicked.emit({action: NavActionsEnum.menuCategories});
          break;
        case 'sestavy':
          this.navigationButtonClicked.emit({action: NavActionsEnum.menuLists});
          break;
        case 'lokace':
          this.navigationButtonClicked.emit({action: NavActionsEnum.menuLocations});
          break;
        case 'historie':
          this.navigationButtonClicked.emit({action: NavActionsEnum.menuHistory});
          break;
        default:
          this.navigationButtonClicked.emit({action: NavActionsEnum.showStartingPage});
          break;
      }
    }
  }

  onCreateProtocolClicked(source: AssetsSourceEnum): void {
    this.dialogService.showProtocolListSelectionDialog(source);
  }

  async onClearWorkingList(gridUid?: string): Promise<void> {
    this.assetsService.clearWorkingList();

    if (gridUid) {

      const gridInstance = await this.agGridService.getGridInstance(gridUid).pipe(take(1)).toPromise();
      if (this.route.snapshot.children[0]?.url[0]?.path === 'lists' && !!this.route.snapshot.children[0].children[0]) {
        return;
      }
      if (gridInstance) gridInstance.gridService.redrawRows();

    }
  }

  onShowMultiEditClicked(source: AssetsSourceEnum): void {
    this.dialogService.showMultiEditAssetDialog(source);
  }

  onShowRemoveAssetClicked(source: AssetsSourceEnum): void {
    this.dialogService.showRemoveAssetClicked(source);
  }

  onShowRemovedAssetsListClicked(): void {
    this.dialogService.showRemovedAssetsList();
  }

  onShowRemovedProtocolsClicked(): void {
    this.dialogService.showRemovedProtocolsList();
  }
}

