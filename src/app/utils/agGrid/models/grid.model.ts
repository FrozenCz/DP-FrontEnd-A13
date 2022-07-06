import {AgGridService} from '../ag-grid.service';
import {ColumnApi, ColumnState, GridApi} from 'ag-grid-community';

export interface GridView {
  columnState: ColumnState[];
  filterModel: any;
  viewName: string;
  showAsButton: boolean;
  fitColumns: boolean;
}

export class Grid {
  constructor(private _api: GridApi, private _columnApi: ColumnApi) {
  }
  get api(): GridApi {
    return this._api;
  }
  get columnApi(): ColumnApi {
    return this._columnApi;
  }
}

export interface AgGrid {
  gridUid: string;
  gridViews: GridView[];
  activeSelection: GridView | undefined;
}

export interface GridInstance {
  gridUid: string;
  gridService: AgGridService;
}
