import {IAssetsExt} from '../../assets/assets.service';
import {ActionButtonsForAgGridComponent} from './action-buttons-for-ag-grid/action-buttons-for-ag-grid.component';
import {FilterCellRendererComponent} from './filter-cell-renderer/filter-cell-renderer.component';
import {GridState, PredefinedViewsComponent} from './predefined-views/predefined-views.component';
import {ColDef, GridOptions} from 'ag-grid-community';
import {Observable} from 'rxjs';
import {BooleanCellRenderComponent} from './boolean-cell-render/boolean-cell-render.component';
import {AG_GRID_LOCALE_CS} from './locale.cs';



export enum DateTimeFormatterType {
  JUST_DAYS,
  WITH_HOURS,
  WITH_HOURS_AND_LEADING_ZEROS,
  JUST_YEAR
}
export class AgGridFuncs {
  static ifFilterActive(params: any): string {
    return 'aG-filterActive';
  }

  /**
   * check if column is first
   * @param params grid params
   * @return boolean true if is column first
   */
  public static ifColumnIsFirst(params: any): boolean {
    return (params.column.left === 0 && params.column.pinned);
  }

  /**
   *  if in workingListAsseetsIds getClass for rowNode
   * @param params rownode, gridApi, context
   * @return class 'inArray' or empty string
   */
  public static getClassIfInWorkingList(params: any): string {
    const assetModelExt: IAssetsExt = params.data;
    return params?.context?.workingListAssetsIds?.includes(assetModelExt?.asset?.id) ? 'inArray' : '';
  }

  /**
   * create default grid options with state
   * @param gridUid identification of grid
   * @param defaultColDef default column settings
   * @param gridState$ state of current grid
   * @param getRowNodeIdFunc function for getting id for each row node
   */
  public static defaultGridOptions(gridUid: string, defaultColDef: ColDef, gridState$: Observable<GridState>,
                                   getRowNodeIdFunc: (params: any) => string): GridOptions {
    return {
      valueCache: true,
      localeText: AG_GRID_LOCALE_CS,
      pivotMode: false,
      enableCellChangeFlash: true,
      immutableData: true,
      getRowNodeId: getRowNodeIdFunc,
      rowSelection: 'multiple',
      suppressRowClickSelection: true,
      enableRangeSelection: true,
      animateRows: true,
      enableCharts: true,
      debounceVerticalScrollbar: true,
      suppressColumnVirtualisation: false,
      ensureDomOrder: false,

      defaultColDef,
      rowBuffer: 100,
      suppressMaxRenderedRowRestriction: true,
      sideBar: {
        toolPanels: [
          {
            id: 'columns',
            labelDefault: 'Sloupce',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
            toolPanelParams: {
              suppressValues: true,
            }
          },
          {
            id: 'filters',
            labelDefault: 'Filtry',
            labelKey: 'filters',
            iconKey: 'filter',
            toolPanel: 'agFiltersToolPanel',
          },
          {
            id: 'views',
            labelDefault: 'Pohledy',
            labelKey: 'views',
            iconKey: 'menu',
            toolPanel: 'predefinedViewsComponent',
            toolPanelParams: {
              context: {
                gridUid,
                gridState: gridState$,
              }
            }
          },
        ],
        hiddenByDefault: false,
      },
      context: {workingListAssetsIds: null},
      getRowClass: AgGridFuncs.getClassIfInWorkingList,
      frameworkComponents: {
        actionButtonsForAgGrid: ActionButtonsForAgGridComponent,
        filterCellRendererComponent: FilterCellRendererComponent,
        predefinedViewsComponent: PredefinedViewsComponent,
        booleanCellRenderer: BooleanCellRenderComponent
      }
    };
  }

  public static dateTimeFormatter(value: string, type: DateTimeFormatterType = 0): string {
    let humanReadableDate = '';
    switch (type) {
      case DateTimeFormatterType.JUST_YEAR:
        humanReadableDate = new Date(value).getFullYear().toString();
        break;
      case DateTimeFormatterType.JUST_DAYS:
        humanReadableDate = new Date(value).toLocaleDateString();
        break;
      case DateTimeFormatterType.WITH_HOURS:
        humanReadableDate = new Date(value).toLocaleString();
        break;
      case DateTimeFormatterType.WITH_HOURS_AND_LEADING_ZEROS:
        humanReadableDate = new Date(value).toLocaleString('cs-CZ',{
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          minute: '2-digit',
          hour12: false,
          hour: '2-digit'
        });
        break;

    }
    return humanReadableDate;
  }

  // TODO: just for chrome
  public static rowClickIdExtractor($event: any): string {
    if ($event.which === 2) {
      const paths: HTMLElement[] = $event.path;
      if (paths) {
        for (const path of paths) {
          if (path instanceof HTMLElement) {
            if (path.getAttribute('role') === 'row') {
              if (!path.classList.contains('ag-row-group')) {
                const rowId = path.getAttribute('row-id');
                if (rowId) {
                  return rowId;
                }
              }
            }
          }
        }
      }
    }
    return '';
  }

  // public static filterValueGetter(params): string {
  //   const columnIds = params.colDef?.field?.split('.');
  //   if (params.data && columnIds && columnIds.length > 0) {
  //     let val = '';
  //
  //     if (columnIds.length === 1) {
  //       val = params.data[columnIds[0]]?.toString();
  //     } else if (columnIds.length === 2) {
  //       val = params.data[columnIds[0]][columnIds[1]]?.toString();
  //     }
  //
  //     const filteredParts = params.api?.filterManager?.quickFilterParts;
  //     if (val != null && filteredParts && filteredParts.length > 0) {
  //       for (let i = 0; i < filteredParts.length; i++) {
  //         const mask = filteredParts[i];
  //         const regex = new RegExp(mask, 'ig');
  //         const oldValPos = val.search(regex);
  //         val = val.replace(regex, '<mark>' + val.substr(oldValPos, mask.length) + '</mark>');
  //       }
  //     }
  //
  //     return val;
  //   }
  //   return null;
  // }
  public static preventScroll(): void | boolean {
    document.body.onmousedown = (e): void | boolean => {
      if (e.button === 1) {
        return false;
      }
    };
  }
}
