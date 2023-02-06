import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {IUserMultipleChanges, User} from '../../model/user.model';
import {UsersService} from '../../users.service';
import {ColDef, GridApi, GridOptions, GridReadyEvent} from 'ag-grid-community';
import {ActivatedRoute, Router} from '@angular/router';
import {NbDialogService, NbToastrService, NbWindowService} from '@nebular/theme';
import {UserDetailComponent} from '../user-detail/user-detail.component';
import {combineLatest, Observable, Subject} from 'rxjs';
import {Unit} from '../../../units/models/unit.model';
import {UnitsService} from '../../../units/units.service';
import {SelectUnitCellRendererComponent} from '../select-unit-cell-renderer/select-unit-cell-renderer.component';
import {takeUntil, tap} from 'rxjs/operators';
import {AgGridFuncs} from '../../../utils/agGrid/ag-grid.funcs';
import {TokenService} from '../../../auth/token.service';
import {RightsTag} from '../../../shared/rights.list';
import {
  DeleteSelectedUsersDialogComponent
} from '../delete-selected-users-dialog/delete-selected-users-dialog.component';
import {BooleanCellRenderComponent} from '../../../utils/agGrid/boolean-cell-render/boolean-cell-render.component';
import {ProtocolsService} from '../../../protocols/protocols.service';


@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styles: [':host{height: 100%;width: 100%;overflow: auto}']
})
export class UsersListComponent implements OnInit, OnDestroy {
  @Input() unitForSelect!: Unit;
  editedUsersOldValues: Partial<User>[] = [];
  usersList$!: Observable<User[]>;
  units$!: Observable<Unit[]>;
  editMode$!: Observable<boolean>;
  storedFilterModel: any;
  ableToRemoveUser = false;
  unsubscribe = new Subject();

  columnDefs: ColDef[] = [
    // {field: 'username', filter: 'agSetColumnFilter'},
    {field: 'name', headerName: 'Jméno'},
    {field: 'surname', headerName: 'Příjmení'},
    {field: 'username', headerName: 'Uživatelské jméno'},
    {
      field: 'unit', headerName: 'Jednotka',
      cellRenderer: 'selectUnitCellRendererComponent',
      editable: false,
      cellEditor: 'agRichSelectCellEditor',
    },
    {
      field: 'reachable', filter: 'agSetColumnFilter',
      filterParams: {values: [true, false]},
      headerName: 'Právo editovat',
      cellRenderer: 'booleanCellRendererComponent'
    }
  ];
  gridApi!: GridApi;
  gridOptions: GridOptions = {
    immutableData: true,
    getRowNodeId: d => {
      return d.id;
    },
    animateRows: true,
    suppressRowClickSelection: true,
    defaultColDef: {
      sortable: true,
      floatingFilter: true,
      filter: 'agTextColumnFilter',
      enableRowGroup: true,
      checkboxSelection: AgGridFuncs.ifColumnIsFirst,
    },
    rowSelection: 'multiple',
    sideBar: {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Sloupce',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
        },
        {
          id: 'filters',
          labelDefault: 'Filtry',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
        }
      ],
      hiddenByDefault: false
    },
    frameworkComponents: {
      booleanCellRendererComponent: BooleanCellRenderComponent,
      selectUnitCellRendererComponent: SelectUnitCellRendererComponent
    }
  };
  gridContext = {
    nbWindowService: this.nbWindowService,
    nbDialogService: this.nbDialogService,
    protocolService: this.protocolsService,
    permissions: {}
  };

  constructor(private usersService: UsersService,
              private router: Router,
              private route: ActivatedRoute,
              private nbWindowService: NbWindowService,
              private nbDialogService: NbDialogService,
              private unitsService: UnitsService,
              private nbToastrService: NbToastrService,
              private tokenService: TokenService,
              private protocolsService: ProtocolsService
  ) {
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
  }

  ngOnInit(): void {
    this.tokenService.getToken().pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.ableToRemoveUser = this.tokenService.getPermission(RightsTag.deleteUser);
      this.gridContext.permissions = {
        ableToRemoveUser: this.ableToRemoveUser,
        changeAssetsUser: this.tokenService.getPermission(RightsTag.changeAssetsUser)
      };
    });

    this.usersList$ = this.usersService.getUsers$();
    this.units$ = this.unitsService.getUnits().pipe(tap((units) => {
      if (units?.length) {
        this.unitForSelect = units[0];
      }
    }));
    this.editMode$ = this.usersService.editMode$;

    combineLatest([
      this.editMode$,
      this.units$,
      this.usersService.getSelectedUsers()]
    ).subscribe(([editMode, units, selectedUsers]) => {
      if (editMode) {
        this.editedUsersOldValues = selectedUsers;
        setTimeout(() => {
          this.gridOptions.singleClickEdit = true;
          this.gridApi.getColumnDef('unit')!.editable = true;
          this.gridApi.getColumnDef('unit')!.cellEditorParams = () => {
            return {
              values: units,
              cellRenderer: (params: any) => {
                return params.value?.name;
              },
              cellHeight: '40',
            };
          };
        });
      } else {
        setTimeout(() => {
          if (this.gridApi) {
            this.gridApi.getColumnDef('unit')!.editable = false;
          }
        });
      }
    });
  }

  onGridReady($event: GridReadyEvent): void {
    this.gridApi = $event.api;
    this.usersList$.subscribe(() => {
      if (this.storedFilterModel) {
        setTimeout(() => {
          this.gridApi.setFilterModel(this.storedFilterModel);
        });
      }
    });
  }


  onGridSizeChanged(): void {
    this.gridApi?.sizeColumnsToFit();
  }

  rowSelected(row: any): void {
    if (row?.node?.selected) {
      this.usersService.addUserToSelected(row.node.data?.id);
    } else {
      this.usersService.removeUserFromSelected(row?.node?.data?.id);
    }
  }

  getContextMenuItems(params: any): any {
    const {name, surname, username, id, reachable} = params.node?.data || {};
    const permissions = params.context.permissions;

    const contextByRights = [{
      name: 'Zobrazit náhled',
      action: () => {
        params.context.nbWindowService.open(UserDetailComponent, {
          title: surname + ' ' + name, hasBackdrop: true, windowClass: 'user', context: {
            userId: params.node?.data?.id
          }
        });
      },
      icon: '<i class="fas fa-user text-basic-color"></i>'
    }];

    if (permissions.ableToRemoveUser && reachable) {
      contextByRights.push({
        name: 'Smazat',
        action: () => {
          params.context.nbDialogService.open(DeleteSelectedUsersDialogComponent, {
            title: surname + ' ' + name, hasBackdrop: true, windowClass: 'user', context: {
              userToDelete: params.node?.data
            }
          });
        },
        icon: '<i class="fas fa-minus text-danger-color"></i>'
      });
    }

    if (permissions.changeAssetsUser && reachable) {
      contextByRights.push({
        name: 'Karta uživatele',
        action: () => {
          params.context.protocolService.showUserAssetsProtocol(id);
        },
        icon: '<i class="fas fa-user text-info-color"></i>'
      });
    }

    return contextByRights;


  }


  filterSet(): void {
    this.storedFilterModel = this.gridApi.getFilterModel();
  }

  openDetailDirect(params: any): void {
    const {name, surname, username, id} = params.node?.data || {};
    params.context.nbWindowService.open(UserDetailComponent, {
      title: surname + ' ' + name, hasBackdrop: true, windowClass: 'user', context: {
        userId: params.node?.data?.id
      }
    });
  }

  saveChanges(): void {
    const changes: IUserMultipleChanges[] = [];
    this.gridApi.forEachNode((node) => {
      if (node.data?.id) {
        const oldValues = this.editedUsersOldValues.find(ov => ov.id === node.data.id);
        if (oldValues?.unit_id !== node.data.unit.id) {
          changes.push({userId: node.data.id, unitId: node.data.unit.id});
        }
      }
    });

    this.usersService.updateUsers(changes).subscribe(() => {
      this.usersService.setEditModeTo(false);
      this.nbToastrService.success('Úprava jednotek proběhla v pořádku', 'Úspěch');
    });
  }

  resetValues(): void {
    const selected = this.editedUsersOldValues;
    this.gridApi.forEachNode((node) => {
      const defaultUnit = selected.find(user => user.id === node.data.id)?.unit_id;
      node.setDataValue('unit', defaultUnit);
    });
  }

  setUnitForAll(includeNotEmpty: boolean, unit: Unit): void {
    this.gridApi.forEachNode((node) => {
      if (includeNotEmpty || !node.data.unit) {
        node.setDataValue('unit', unit);
      }
    });
  }

  cancelChanges(): void {
    this.usersService.setEditModeTo(false);
  }
}
