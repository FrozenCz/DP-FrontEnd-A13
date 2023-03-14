import {AfterViewInit, Component, OnInit} from '@angular/core';
import {UsersService} from './users/users.service';
import {UnitsService} from './units/units.service';
import {ActivatedRoute, Router, RoutesRecognized} from '@angular/router';
import {DialogService} from './services/dialog.service';
import {firstValueFrom, noop} from 'rxjs';
import {AgGridInstanceService} from './utils/agGrid/ag-grid-instance.service';
import {WebsocketService} from './services/websocket.service';
import {TokenService} from './auth/token.service';
import {MainTab} from './utils/navigation/components/toolbar/toolbar.component';
import {Navigation} from './utils/navigation/models/navigation';
import {NavigationTab} from './utils/navigation/models/navigationTab';
import {NavigationSection} from './utils/navigation/models/navigationSection';
import {NavigationAcceptedIconsEnum} from './utils/navigation/models/navigation.types';
import {NavigationSubSectionButtons} from './utils/navigation/models/navigationSubSectionButtons';
import {NavigationButton} from './utils/navigation/models/navigationButton';
import {NavButtonsIdsEnum} from './utils/navigation/models/navButtonsIds.enum';
import {AssetsService} from './assets/assets.service';
import {take} from 'rxjs/operators';
import {LocationListButton, LocationNav} from './locations/model/locations.navigation';
import {AssetSource} from './facade/facade';
import {TransferService} from './assets/transfer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit {
  title = 'bpProjekt-Frontend';
  activeTab: string = '';
  protocolsTemplate = false;
  ribbon = true;
  sideNavCollapsed = false;

  navigation: Navigation = new Navigation('text-primary-color');
  topNav: MainTab[] = [];
  usersTab: NavigationTab = new NavigationTab('users', 'Uživatelé', ['users'], 'person-outline');
  assetTab: NavigationTab = new NavigationTab('assets', 'Majetek', ['assets'], 'monitor-outline');
  listsTab: NavigationTab = new NavigationTab('lists', 'Sestavy', ['lists'], 'list-outline');
  unitsTab: NavigationTab = new NavigationTab('units', 'Jednotky', ['units'], 'layers-outline');
  categoryTab: NavigationTab = new NavigationTab('categories', 'Kategorie', ['categories'], 'grid-outline');
  historyTab: NavigationTab = new NavigationTab('history', 'Historie', ['history'], 'clock-outline');
  hintTab: NavigationTab = new NavigationTab('hint', 'Nápověda', [''], 'question-mark-circle-outline');
  usersSection: NavigationSection = new NavigationSection('users', 'uživatel', {
    name: 'person',
    iconType: NavigationAcceptedIconsEnum.eva
  })
  // stockTakingTab: NavigationTab = new
  usersSubSectionA: NavigationSubSectionButtons = new NavigationSubSectionButtons();
  newUserButton: NavigationButton = new NavigationButton(NavButtonsIdsEnum.add_new_user, 'nový', {
    name: 'plus-outline',
    iconType: NavigationAcceptedIconsEnum.eva
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private tokenService: TokenService,
    private dialogService: DialogService,
    private unitsService: UnitsService,
    private assetsService: AssetsService,
    private agGridService: AgGridInstanceService,
    private websocketService: WebsocketService,
    private transferService: TransferService
  ) {
    this.ribbon = !!this.tokenService.getSetting('mat-ribbon');
    this.createNavigation();
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
  }

  /**
   * make active tab from url
   * @param data
   * @private
   */
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
        this.dialogService.showProtocolListSelectionDialog(AssetSource.WORKING_LIST);
        break;
      case NavButtonsIdsEnum.protocols_from_selected:
        this.dialogService.showProtocolListSelectionDialog(AssetSource.SELECTED_IN_GRID);
        break;
      case NavButtonsIdsEnum.mass_edit_from_working_list:
        this.dialogService.showMultiEditAssetDialog(AssetSource.WORKING_LIST);
        break;
      case NavButtonsIdsEnum.mass_edit_from_selected:
        this.dialogService.showMultiEditAssetDialog(AssetSource.SELECTED_IN_GRID);
        break;
      case NavButtonsIdsEnum.asset_remove_from_working_list:
        this.dialogService.showRemoveAssetClicked(AssetSource.WORKING_LIST);
        break;
      case NavButtonsIdsEnum.asset_remove_from_selected:
        this.dialogService.showRemoveAssetClicked(AssetSource.SELECTED_IN_GRID);
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
      case NavButtonsIdsEnum.category_new:
        this.dialogService.showCreateCategoryDialog();
        break;
      case NavButtonsIdsEnum.category_list:
        this.router.navigate(['/categories']).then(noop);
        break;
      case NavButtonsIdsEnum.category_column_edit:
        this.dialogService.showEditCategoryColumnsDialog();
        break;
      case NavButtonsIdsEnum.asset_transfer_from_working_list:
        firstValueFrom(this.assetsService.getAssetsWorkingList$()).then((assets) => {
          this.transferService.clearList();
          this.transferService.addToTransferList(Array.from(assets.keys()));
          this.router.navigate(['/assets', 'transfers', 'request'], {});
        })
        break;
      case NavButtonsIdsEnum.asset_transfer_from_selected:
        firstValueFrom(this.assetsService.getAssetsSelectedInGridList$()).then((assets) => {
          this.transferService.clearList();
          this.transferService.addToTransferList(Array.from(assets.keys()));
          this.router.navigate(['/assets', 'transfers', 'request'], {});
        })
        break;
      case NavButtonsIdsEnum.asset_transfer_list:
        this.router.navigate(['/assets', 'transfers'])
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
    this.navigation.navTabs.push(this.usersTab, this.assetTab, this.listsTab, this.unitsTab, this.categoryTab, LocationNav, this.historyTab, this.hintTab);

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


    const assetScanSection = new NavigationSection('asset_scan', 'Skenování majetku', {
      name: 'trash-2-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const assetScanSectionSubSectionA = new NavigationSubSectionButtons();
    assetScanSection.subSections.push(assetScanSectionSubSectionA);
    const assetScanList = new NavigationButton(NavButtonsIdsEnum.asset_scan_list,
      'výsledky skenování',
      {name: 'list-outline', iconType: NavigationAcceptedIconsEnum.eva})
    assetScanSectionSubSectionA.buttons.push(assetScanList);

    const assetTransferSection = new NavigationSection('asset_transfer', 'Převod majetku', {
      name: 'flip-2-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const assetTransferSectionSubSectionA = new NavigationSubSectionButtons();
    assetTransferSection.subSections.push(assetTransferSectionSubSectionA);
    const assetTransferList = new NavigationButton(NavButtonsIdsEnum.asset_transfer_list,
      'přehled převodů',
      {name: 'list-outline', iconType: NavigationAcceptedIconsEnum.eva})
    assetTransferSectionSubSectionA.buttons.push(assetTransferList);


    const showTransferFromWorkingList = new NavigationButton(NavButtonsIdsEnum.asset_transfer_from_working_list,
      'z pracovní sestavy',
      {name: 'share-outline', iconType: NavigationAcceptedIconsEnum.eva})
    assetTransferSectionSubSectionA.buttons.push(showTransferFromWorkingList);
    const showTransfersFromSelected = new NavigationButton(NavButtonsIdsEnum.asset_transfer_from_selected, 'z vybraných', {
      name: 'checkmark-square-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    })
    assetTransferSectionSubSectionA.buttons.push(showTransfersFromSelected)
    showTransferFromWorkingList.badge = {status: 'success', text: '0'};
    showTransfersFromSelected.badge = {status: 'primary', text: '0'};

    const stockTakingSection = new NavigationSection('stock-taking', 'Inventury', {
      name: 'archive-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });

    const stockTakingSubSection = new NavigationSubSectionButtons();
    stockTakingSubSection.buttons.push(
      new NavigationButton(NavButtonsIdsEnum.stock_taking_new, 'Nová inventura', {
        name: 'plus-outline',
        iconType: NavigationAcceptedIconsEnum.eva
      }, ['assets', 'stock-taking', 'new']
    ),
      new NavigationButton(NavButtonsIdsEnum.stock_taking_new, 'Inventury', {
          name: 'list-outline',
          iconType: NavigationAcceptedIconsEnum.eva
        }, ['assets', 'stock-taking', 'list']
      )
      )
    stockTakingSection.subSections.push(stockTakingSubSection)

    this.assetTab.sections.push(
      assetSection,
      workingAssetListSection,
      protocolsSection,
      massEditSection,
      assetRemoveSection,
      removedAssetsSection,
      assetScanSection,
      assetTransferSection,
      stockTakingSection
    )


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

    /** categories **/
    const categoriesMainSection = new NavigationSection('categories', 'kategories', {
      name: 'windows-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const categoriesMainSectionSubSectionA = new NavigationSubSectionButtons();
    categoriesMainSection.subSections.push(categoriesMainSectionSubSectionA);
    const categoriesList = new NavigationButton(NavButtonsIdsEnum.category_list,
      'seznam kategorií',
      {name: 'list-outline', iconType: NavigationAcceptedIconsEnum.eva})
    categoriesMainSectionSubSectionA.buttons.push(categoriesList);
    const newCategoryButton = new NavigationButton(NavButtonsIdsEnum.category_new, 'nová kategorie', {
      name: 'plus-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    })
    categoriesMainSectionSubSectionA.buttons.push(newCategoryButton)
    this.categoryTab.sections.push(categoriesMainSection)

    const categoryColumnSection = new NavigationSection('categories', 'kategories', {
      name: 'windows-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const categoryColumnSubSectionA = new NavigationSubSectionButtons();
    categoryColumnSection.subSections.push(categoryColumnSubSectionA);
    const columnsEditButton = new NavigationButton(NavButtonsIdsEnum.category_column_edit,
      'sloupce',
      {name: 'edit-outline', iconType: NavigationAcceptedIconsEnum.eva})
    categoryColumnSubSectionA.buttons.push(columnsEditButton);
    this.categoryTab.sections.push(categoryColumnSection)

    /** lokace */
    const lokSecA = new NavigationSection('lok_sec_a', 'lokace', {
      name: 'paper-plane-outline',
      iconType: NavigationAcceptedIconsEnum.eva
    });
    const subSecA = new NavigationSubSectionButtons();
    LocationNav.sections.push(lokSecA);
    lokSecA.subSections.push(subSecA);
    subSecA.buttons.push(LocationListButton);


    /* handling changes */
    this.prepareToolbar();
    this.assetsService.getAssetsWorkingList$().subscribe(workingList => {
      const size = workingList.size;
      showWorkingListButton.setBadgeText(size);
      dropWorkingListButton.disabled = !size;
      showProtocolsFromWorkingList.setBadgeText(size);
      massEditFromWorkingList.setBadgeText(size);
      assetRemoveFromWorkingList.setBadgeText(size);
      showTransferFromWorkingList.setBadgeText(size);
    });
    this.assetsService.getAssetsSelectedInGridList$().subscribe(selectedAssets => {
      const size = selectedAssets.size;
      showProtocolsFromSelected.setBadgeText(size);
      massEditFromSelected.setBadgeText(size);
      assetRemoveFromSelected.setBadgeText(size);
      showTransfersFromSelected.setBadgeText(size);
    })
  }
}
