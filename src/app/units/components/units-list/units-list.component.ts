import {Component, OnDestroy, OnInit} from '@angular/core';
import {UnitsService} from '../../units.service';
import {Subject} from 'rxjs';
import {Unit} from '../../models/unit.model';
import {TokenService} from '../../../auth/token.service';
import {ColDef, GridApi, GridOptions, GridReadyEvent} from 'ag-grid-community';
import {SelectUnitCellRendererComponent} from '../../../users/components/select-unit-cell-renderer/select-unit-cell-renderer.component';
import {NbDialogService, NbWindowService} from '@nebular/theme';
import {EditUnitDialogComponent} from '../edit-unit-dialog/edit-unit-dialog.component';
import {ContextMenuItem} from '../../../utils/agGrid/contextMenuItem.interface';
import {RightsTag} from '../../../shared/rights.list';
import {CreateUnitDialogComponent} from '../create-unit-dialog/create-unit-dialog.component';
import {DeleteUnitDialogComponent} from '../delete-unit-dialog/delete-unit-dialog.component';
import {AgGridInstanceService} from '../../../utils/agGrid/ag-grid-instance.service';
import {AG_GRID_LOCALE_CS} from '../../../utils/agGrid/locale.cs';
import {map, takeUntil, tap} from 'rxjs/operators';
import {animate, query, style, transition, trigger} from '@angular/animations';


@Component({
    selector: 'app-units-list',
    templateUrl: './units-list.component.html',
    styleUrls: ['./units-list.component.scss'],
    animations: [
        trigger('ngRowAnim', [
            transition('*<=>*', [
                query('div.ag-new-create', [
                        style({opacity: 0, marginLeft: '-100px'}),
                        animate(1000)
                ], {optional: true}),
              query('div.ag-row-delete', [
                animate(1000, style({opacity: 0, marginLeft: '-100px'}))
              ], {optional: true})
            ])

        ])
    ]
})
export class UnitsListComponent implements OnInit, OnDestroy {
    knownIds: number[] = [];
    animStart = false;
    createUnitsAllowed = false;
    editUnitsAllowed = false;
    deleteUnitsAllowed = false;
    unsubscribe = new Subject();

    units: Unit[] = [];
    storedFilterModel: any;
    columnDefs: ColDef[] = [];
    autoGroupColumnDef = {
        headerName: 'Jednotky',
        cellRendererParams: {suppressCount: true}
    };

    gridApi!: GridApi;
    gridOptions: GridOptions = {
        rowClassRules: {
            'ag-new-create': (params) =>  {
                // console.log(params.data);
                return params.data.newOne;
            },
          'ag-row-delete': (params) =>  {
            // console.log(params.data);
            return params.data.delete;
          },
        },
        localeText: AG_GRID_LOCALE_CS,
        treeData: true,
        animateRows: true,
        suppressRowClickSelection: true,
        defaultColDef: {
            sortable: true,
            floatingFilter: true,
            filter: 'agTextColumnFilter',
            enableRowGroup: true,
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
            selectUnitCellRendererComponent: SelectUnitCellRendererComponent
        }
    };
    gridContext = {
        nbWindowService: this.nbWindowService,
        nbDialogService: this.nbDialogService,
        permissions: {}
    };

    constructor(
        private unitsService: UnitsService,
        private tokenService: TokenService,
        private nbWindowService: NbWindowService,
        private nbDialogService: NbDialogService,
        private agGridService: AgGridInstanceService) {

    }

    ngOnInit(): void {
        this.tokenService.getToken().pipe(takeUntil(this.unsubscribe)).subscribe((token) => {
            this.unitsService.getUnits().pipe(tap(() => {
                this.animStart = true;
            }), map(us => us?.map(u => {
                return {
                    ...u,
                    newOne: !this.knownIds.includes(u.id)
                }
            })))
              .pipe(takeUntil(this.unsubscribe))
              .subscribe(units => {
                this.units = units;
                setTimeout(() => {
                  this.knownIds = units.map(u => u.id);
                  this.animStart = false;
                  this.units = units.map(u => { return {...u, newOne: false, delete: true}});
                }, 2000);
              });
            this.createUnitsAllowed = this.tokenService.getPermission(RightsTag.createUnits);
            this.editUnitsAllowed = this.tokenService.getPermission(RightsTag.editUnits);
            this.deleteUnitsAllowed = this.tokenService.getPermission(RightsTag.deleteUnits);
            this.gridContext.permissions = {
                createUnitsAllowed: this.createUnitsAllowed,
                editUnitsAllowed: this.editUnitsAllowed,
                deleteUnitsAllowed: this.deleteUnitsAllowed
            };
        });

        this.agGridService.isUnitsCollapsed().pipe(takeUntil(this.unsubscribe)).subscribe((collapse) => {
            if (collapse) {
                this.gridApi?.collapseAll();
            } else {
                this.gridApi?.expandAll();
            }
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe.next(true);
    }

    onGridSizeChanged(): void {
        this.gridApi?.sizeColumnsToFit();
    }

    filterSet(): void {
        this.storedFilterModel = this.gridApi.getFilterModel();
    }

    onGridReady($event: GridReadyEvent): void {
        this.gridApi = $event.api;
        // this.units$.pipe(takeUntil(this.unsubscribe)).subscribe(() => {
        //     setTimeout(() => {
        //         this.removingRow = null;
        //     }, 1000);
        //     if (this.storedFilterModel) {
        //         setTimeout(() => {
        //             this.gridApi.setFilterModel(this.storedFilterModel);
        //         });
        //     }
        // });

    }

    getDataPath = (data: any) => {
        return data.tree;
    };


    getContextMenuItems(params: any): any {
        const contextMenuItems: ContextMenuItem[] = [];
        const permissions = params.context.permissions;


        if (permissions.editUnitsAllowed) {
            contextMenuItems.push({
                name: 'Editace jednotky',
                action: () => {
                    params.context.nbDialogService.open(EditUnitDialogComponent, {
                        context: {
                            unitId: params.node?.data?.id,
                        }
                    });
                },
                icon: '&#9998;'
            });
        }

        if (permissions.createUnitsAllowed) {
            contextMenuItems.push({
                name: 'Tvorba podjednotky',
                action: () => {
                    params.context.nbDialogService.open(CreateUnitDialogComponent, {
                        hasBackdrop: true, context: {
                            parentId: params.node?.data?.id,
                        }
                    });
                },
                icon: '&#43;'
            });
        }

        if (permissions.deleteUnitsAllowed) {
            contextMenuItems.push({
                name: 'Smazání jednotky',
                action: () => {
                    params.context.nbDialogService.open(DeleteUnitDialogComponent, {
                        hasBackdrop: true, context: {
                            unitId: params.node?.data?.id,
                        }
                    });
                },
                icon: '&#9866;'
            });
        }


        return [
            ...contextMenuItems,

            'copy',
            'separator',
            'csvExport',
            'excelExport',
            'separator',
            'expandAll',
            'contractAll',
        ];
    }

}
