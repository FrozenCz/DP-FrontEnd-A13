import {AfterViewInit, Component, OnInit} from '@angular/core';
import {UsersService} from './users/users.service';
import {UnitsService} from './units/units.service';
import {ActivatedRoute, Router, RoutesRecognized} from '@angular/router';
import {DialogService} from './services/dialog.service';
import {noop} from 'rxjs';
import {AgGridInstanceService} from './utils/agGrid/ag-grid-instance.service';
import {WebsocketService} from './services/websocket.service';
import {TokenService} from './auth/token.service';
import {MainTab} from './utils/navigation/components/toolbar/toolbar.component';
import {NavigationInterface} from './utils/navigation/components/navigation/nav.model';
import {NavButClickedEmit} from './utils/navigation/components/navigation/ribbon.component';
import {NavActionsEnum} from './utils/navigation/components/navigation/navActions.enum';
import {Navigation} from './utils/navigation/models/navigation';
import {NavigationTab} from './utils/navigation/models/navigationTab';
import {NavigationSection} from './utils/navigation/models/navigationSection';
import {NavigationAcceptedIconsEnum} from './utils/navigation/models/navigation.types';
import {NavigationSubSectionButtons} from './utils/navigation/models/navigationSubSectionButtons';
import {NavigationButton} from './utils/navigation/models/navigationButton';
import {NavButtonsIdsEnum} from './utils/navigation/models/navButtonsIds.enum';
import {AssetsService, AssetsSourceEnum} from './assets/assets.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit {
  title = 'bpProjekt-Frontend';
  usersSelected = false;
  activeTab: string = '';
  protocolsTemplate = false;
  ribbon = true;
  sideNavCollapsed = false;
  navigationInterface: NavigationInterface = {
    activeLinkClass: 'text-primary-color',
    navTabs: []
  };

  navigation: Navigation = new Navigation('text-primary-color');
  usersTab: NavigationTab = new NavigationTab('users', 'Uživatelé', ['users'], 'person-outline');
  assetTab: NavigationTab = new NavigationTab('assets', 'Majetek', ['assets'], 'monitor-outline');
  listsTab: NavigationTab = new NavigationTab('lists', 'Sestavy', ['lists'], 'list-outline');
  unitsTab: NavigationTab = new NavigationTab('units', 'Jednotky', ['units'], 'layers-outline');
  categoryTab: NavigationTab = new NavigationTab('categories', 'Kategorie', ['categories'], 'grid-outline');
  locationTab: NavigationTab = new NavigationTab('locations', 'Lokace', ['locations'], 'paper-plane-outline');
  historyTab: NavigationTab = new NavigationTab('history', 'Historie', ['history'], 'clock-outline');
  hintTab: NavigationTab = new NavigationTab('hint', 'Nápověda', [''], 'question-mark-circle-outline');
  usersSection: NavigationSection = new NavigationSection('users', 'uživatel', {
    name: 'person',
    iconType: NavigationAcceptedIconsEnum.eva
  })
  usersSubSectionA: NavigationSubSectionButtons = new NavigationSubSectionButtons();
  newUserButton: NavigationButton = new NavigationButton(NavButtonsIdsEnum.add_new_user, 'nový', {
    name: 'plus-outline',
    iconType: NavigationAcceptedIconsEnum.eva
  });


  topNav: MainTab[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private tokenService: TokenService,
    private dialogService: DialogService,
    private unitsService: UnitsService,
    private assetsService: AssetsService,
    private agGridService: AgGridInstanceService,
    private websocketService: WebsocketService
  ) {
    this.ribbon = !!this.tokenService.getSetting('mat-ribbon');
    this.createNavigation();
  }

  navigationButtonClicked(navButClickedEmit: NavButClickedEmit): void {

    switch (navButClickedEmit.action) {
      case NavActionsEnum.showStartingPage:
        this.router.navigate(['']).then(noop);
        break;
      case NavActionsEnum.menuUsers || NavActionsEnum.usersList:
        this.router.navigate(['/users']).then(noop);
        break;
      case NavActionsEnum.menuAssets || NavActionsEnum.assetsList:
        this.router.navigate(['/assets']).then(noop);
        break;
      case NavActionsEnum.menuUnits || NavActionsEnum.unitsList:
        this.router.navigate(['/units']).then(noop);
        break;
      case NavActionsEnum.menuCategories || NavActionsEnum.categoriesList:
        this.router.navigate(['/categories']).then(noop);
        break;
      case NavActionsEnum.menuLocations:
        this.router.navigate(['/locations']).then(noop);
        break;
      case NavActionsEnum.menuHistory:
        this.router.navigate(['/history']).then(noop);
        break;

      case NavActionsEnum.createUser:
        this.dialogService.showCreateUserDialog();
        break;
      case NavActionsEnum.deleteSelectedUsers:
        this.dialogService.showDeleteSelectedUsersDialog();
        break;
      case NavActionsEnum.editSelectedUsers:
        this.usersService.setEditModeTo(true);
        break;
      case NavActionsEnum.createAsset:
        this.router.navigate(['/categories']).then(noop);
        this.dialogService.youMustSelectCategoryFirst();
        break;

      case NavActionsEnum.createUnit:
        this.dialogService.showCreateUnitDialog();
        break;
      case NavActionsEnum.collapseUnits:
        this.agGridService.setCollapseUnitsTo(true);
        break;
      case NavActionsEnum.expandUnits:
        this.agGridService.setCollapseUnitsTo(false);
        break;

      case NavActionsEnum.createCategory:
        this.dialogService.showCreateCategoryDialog();
        break;
      case NavActionsEnum.editCategoryColumns:
        this.dialogService.showEditCategoryColumnsDialog();
        break;

      case NavActionsEnum.menuLists:
        this.router.navigate(['lists']).then(noop);
        break;
      case NavActionsEnum.lists:
        this.router.navigate(['lists']).then(noop);
        break;
      case NavActionsEnum.showWorkingList:
        this.router.navigate(['lists/working-list']).then(noop);
        break;
      case NavActionsEnum.transferProtocol:
        this.router.navigate(['lists/working-list']).then(noop);
        break;

    }
  }

  ngOnInit(): void {

    this.router.events.subscribe((data) => {
      if (data instanceof RoutesRecognized) {
        if (!this.activeTab) {
          setTimeout(() => {
            this.routeLogic(data);
            this.protocolsTemplate = !!data.state?.root?.children[0]?.data['protocols'];
          });
        } else {

          this.routeLogic(data);
        }
      }

    });

    this.usersService.selectedUsers$.subscribe((selectedUsers) => {
      this.usersSelected = !!selectedUsers.length;
    });
  }

  private routeLogic(data: any): void {
    const splitUrl = data.url.split('/');
    if (splitUrl && splitUrl.length > 1) {
      if (splitUrl[1] === '') {
        this.activeTab = ' ';
      } else {
        this.activeTab = splitUrl[1];
      }
    } else {
      this.activeTab = data.url;
    }
  }

  ngAfterViewInit(): void {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
      }
    });
  }

  onProtocolEmit($event: any): void {

  }

  /**
   * reakce na akce pozadovane z navigace
   * @param $event
   */
  navActionEmitted($event: { id: NavButtonsIdsEnum; context?: any }) {
    const actionId = $event.id;
    const context = $event.context;

    switch (actionId) {
      case NavButtonsIdsEnum.switchNav:
        this.ribbon = !this.ribbon;
        this.tokenService.setSettings('mat-ribbon', this.ribbon);
        break;
      case NavButtonsIdsEnum.add_new_user:
        this.dialogService.showCreateUserDialog();
        break;
      case NavButtonsIdsEnum.add_new_asset:
        this.router.navigate(['/categories']).then(noop);
        this.dialogService.youMustSelectCategoryFirst();
        break;
      case NavButtonsIdsEnum.show_working_list:
        this.router.navigate(['/lists', 'working-list']).then(noop);
        break;
      case NavButtonsIdsEnum.drop_working_list:
        this.assetsService.clearWorkingList();
        this.agGridService.getGridInstance('assetList')
          .pipe(
            take(1)
          ).subscribe(gridInstance => {
          if (gridInstance) {
            gridInstance.gridService.redrawRows()
          }
        });
        break;
      case NavButtonsIdsEnum.protocols_from_working_list:
        this.dialogService.showProtocolListSelectionDialog(AssetsSourceEnum.WORKING_LIST);
        break;
      case NavButtonsIdsEnum.protocols_from_selected:
        this.dialogService.showProtocolListSelectionDialog(AssetsSourceEnum.GRID);
        break;
      case NavButtonsIdsEnum.mass_edit_from_working_list:
        this.dialogService.showMultiEditAssetDialog(AssetsSourceEnum.WORKING_LIST);
        break;
      case NavButtonsIdsEnum.mass_edit_from_selected:
        this.dialogService.showMultiEditAssetDialog(AssetsSourceEnum.GRID);
        break;
      case NavButtonsIdsEnum.asset_remove_from_working_list:
        this.dialogService.showRemoveAssetClicked(AssetsSourceEnum.WORKING_LIST);
        break;
      case NavButtonsIdsEnum.asset_remove_from_selected:
        this.dialogService.showRemoveAssetClicked(AssetsSourceEnum.GRID);
        break;
      case NavButtonsIdsEnum.removed_assets_list:
        this.dialogService.showRemovedAssetsList();
        break;
      case NavButtonsIdsEnum.removed_assets_protocols:
        this.dialogService.showRemovedProtocolsList();
        break;
      case NavButtonsIdsEnum.units_list:
        this.router.navigate(['/units']).then(noop);
        break;
      case NavButtonsIdsEnum.unist_list_new:
        this.dialogService.showCreateUnitDialog();
        break;
      default:
        alert(`action ${actionId} is not defined in navButtonsID`);
    }
  }


  private prepareToolbar(): void {
    this.topNav = this.navigation.navTabs.map(tab => {
      return {
        url: tab.url,
        name: tab.name,
        exact: tab.url[0]?.length < 2,
        nbIcon: tab.nbIcon
      }
    })
  }

  /**
   * vytvori navigaci pro stranky
   * @private
   */
  private createNavigation(): void {
    this.navigation.navTabs.push(this.usersTab, this.assetTab, this.listsTab, this.unitsTab, this.categoryTab, this.locationTab, this.historyTab, this.hintTab);

    /** users **/
    this.usersTab.sections.push(this.usersSection);
    this.usersSection.subSections.push(this.usersSubSectionA);
    this.usersSubSectionA.buttons.push(this.newUserButton);

    /** assets **/
    const assetSection: NavigationSection = new NavigationSection('assets', 'majetek', {
      name: 'monitor-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const assetSubSection: NavigationSubSectionButtons = new NavigationSubSectionButtons();
    assetSubSection.buttons.push(new NavigationButton(NavButtonsIdsEnum.add_new_asset, 'nový', {
      name: 'plus-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    }));
    assetSection.subSections.push(assetSubSection)
    const workingAssetListSection = new NavigationSection('workingList', 'pracovní sestava', {
      name: 'share-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const workingListSubsection = new NavigationSubSectionButtons();
    workingAssetListSection.subSections.push(workingListSubsection);
    const showWorkingListButton = new NavigationButton(NavButtonsIdsEnum.show_working_list,
      'zobrazit',
      {name: 'share-outline', iconType: NavigationAcceptedIconsEnum.eva})
    workingListSubsection.buttons.push(showWorkingListButton);
    const dropWorkingListButton = new NavigationButton(NavButtonsIdsEnum.drop_working_list, 'vyprázdnit', {
      name: 'trash-2-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    })
    workingListSubsection.buttons.push(dropWorkingListButton)
    showWorkingListButton.badge = {status: 'success', text: '0'};

    const protocolsSection = new NavigationSection('protocols', 'protokoly', {
      name: 'file-text-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const protocolsSubSectionA = new NavigationSubSectionButtons();
    protocolsSection.subSections.push(protocolsSubSectionA);
    const showProtocolsFromWorkingList = new NavigationButton(NavButtonsIdsEnum.protocols_from_working_list,
      'z pracovní sestavy',
      {name: 'share-outline', iconType: NavigationAcceptedIconsEnum.eva})
    protocolsSubSectionA.buttons.push(showProtocolsFromWorkingList);
    const showProtocolsFromSelected = new NavigationButton(NavButtonsIdsEnum.protocols_from_selected, 'z vybraných', {
      name: 'checkmark-square-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    })
    protocolsSubSectionA.buttons.push(showProtocolsFromSelected)
    showProtocolsFromWorkingList.badge = {status: 'success', text: '0'};
    showProtocolsFromSelected.badge = {status: 'primary', text: '0'};

    const massEditSection = new NavigationSection('mass_edit', 'hromadné úpravy', {
      name: 'edit-2-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const massEditSubSectionA = new NavigationSubSectionButtons();
    massEditSection.subSections.push(massEditSubSectionA);
    const massEditFromWorkingList = new NavigationButton(NavButtonsIdsEnum.mass_edit_from_working_list,
      'z pracovní sestavy',
      {name: 'share-outline', iconType: NavigationAcceptedIconsEnum.eva})
    massEditSubSectionA.buttons.push(massEditFromWorkingList);
    const massEditFromSelected = new NavigationButton(NavButtonsIdsEnum.mass_edit_from_selected, 'z vybraných', {
      name: 'checkmark-square-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    })
    massEditSubSectionA.buttons.push(massEditFromSelected)
    massEditFromWorkingList.badge = {status: 'success', text: '0'};
    massEditFromSelected.badge = {status: 'primary', text: '0'};

    const assetRemoveSection = new NavigationSection('asset_removing', 'vyřazení majetku', {
      name: 'trash-2-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const assetRemovingSubSectionA = new NavigationSubSectionButtons();
    assetRemoveSection.subSections.push(assetRemovingSubSectionA);
    const assetRemoveFromWorkingList = new NavigationButton(NavButtonsIdsEnum.asset_remove_from_working_list,
      'z pracovní sestavy',
      {name: 'share-outline', iconType: NavigationAcceptedIconsEnum.eva})
    assetRemovingSubSectionA.buttons.push(assetRemoveFromWorkingList);
    const assetRemoveFromSelected = new NavigationButton(NavButtonsIdsEnum.asset_remove_from_selected, 'z vybraných', {
      name: 'checkmark-square-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    })
    assetRemovingSubSectionA.buttons.push(assetRemoveFromSelected)
    assetRemoveFromWorkingList.badge = {status: 'warning', text: '0'};
    assetRemoveFromSelected.badge = {status: 'danger', text: '0'};

    const removedAssetsSection = new NavigationSection('removed_assets', 'vyřazený majetek', {
      name: 'flash-off-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const removedAssetsSubSectionA = new NavigationSubSectionButtons();
    removedAssetsSection.subSections.push(removedAssetsSubSectionA);
    const removedAssetsList = new NavigationButton(NavButtonsIdsEnum.removed_assets_list,
      'seznam majetku',
      {name: 'list-outline', iconType: NavigationAcceptedIconsEnum.eva})
    removedAssetsSubSectionA.buttons.push(removedAssetsList);
    const removedAssetsProtocols = new NavigationButton(NavButtonsIdsEnum.removed_assets_protocols, 'protokoly', {
      name: 'file-text-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    })
    removedAssetsSubSectionA.buttons.push(removedAssetsProtocols)

    this.assetTab.sections.push(assetSection, workingAssetListSection, protocolsSection, massEditSection, assetRemoveSection, removedAssetsSection)

    /** lists **/
    this.listsTab.sections.push(workingAssetListSection)
    // todo: seznamy ulozenych sestav?

    /** units **/
    const unitsMainSection = new NavigationSection('units_list', 'jednotky', {
      name: 'layers-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const unitsMainSectionSubSectionA = new NavigationSubSectionButtons();
    unitsMainSection.subSections.push(unitsMainSectionSubSectionA);
    const unitsListButton = new NavigationButton(NavButtonsIdsEnum.units_list,
      'seznam jednotek',
      {name: 'list-outline', iconType: NavigationAcceptedIconsEnum.eva})
    unitsMainSectionSubSectionA.buttons.push(unitsListButton);
    const newUnitButton = new NavigationButton(NavButtonsIdsEnum.unist_list_new, 'nová jednotka', {
      name: 'plus-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    })
    unitsMainSectionSubSectionA.buttons.push(newUnitButton)

    this.unitsTab.sections.push(unitsMainSection)

    /* handling changes */
    this.prepareToolbar();
    this.assetsService.getAssetsWorkingList$().subscribe(workingList => {
      showWorkingListButton.setBadgeText(workingList.length);
      dropWorkingListButton.disabled = !workingList.length;
      showProtocolsFromWorkingList.setBadgeText(workingList.length);
      massEditFromWorkingList.setBadgeText(workingList.length);
      assetRemoveFromWorkingList.setBadgeText(workingList.length);
    });
    this.assetsService.getAssetsSelectedInGridList$().subscribe(selectedAssets => {
      showProtocolsFromSelected.setBadgeText(selectedAssets.length);
      massEditFromSelected.setBadgeText(selectedAssets.length)
      assetRemoveFromSelected.setBadgeText(selectedAssets.length)
    })
  }
}
