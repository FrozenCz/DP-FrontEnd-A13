import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NavActionsEnum} from './components/navigation/navActions.enum';
import {UsersService} from './users/users.service';
import {UnitsService} from './units/units.service';
import {ActivatedRoute, Router, RoutesRecognized} from '@angular/router';
import {DialogService} from './services/dialog.service';
import {noop} from 'rxjs';
import {NavButClickedEmit} from './components/navigation/navigation.component';
import {AgGridInstanceService} from './utils/agGrid/ag-grid-instance.service';
import {WebsocketService} from './services/websocket.service';

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private dialogService: DialogService,
    private unitsService: UnitsService,
    private agGridService: AgGridInstanceService,
    private websocketService: WebsocketService
  ) {
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
}
