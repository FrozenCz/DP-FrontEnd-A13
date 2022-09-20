import {Component, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {IAssetsExt} from '../../assets.service';
import {ColDef, GridOptions} from 'ag-grid-community';
import {AgGridFuncs, DateTimeFormatterType} from '../../../utils/agGrid/ag-grid.funcs';
import {map} from 'rxjs/operators';
import {AssetState} from '../../models/assets.model';
import {AssetSource, Facade} from '../../../facade/facade';

@Component({
  selector: 'app-removed-assets-list',
  templateUrl: './removed-assets-list.component.html',
  styleUrls: ['./removed-assets-list.component.scss']
})
export class RemovedAssetsListComponent implements OnInit {
  gridUid = 'removeAssetsList';
  removedAssets$: Observable<IAssetsExt[]>;
  customGridOptions: Partial<GridOptions> = {};
  customColDefs: ColDef[] = [];
  removedColDefs: string[] = ['akce', 'reachable'];
  unsubscribe: Subject<void> = new Subject<void>();

  constructor(private facade: Facade) {
    this.removedAssets$ = this.facade.getAssetExt(AssetSource.STORE)
      .pipe(
        map(assets => assets.filter(a => a.asset.state === AssetState.removed)),
      )
  }



  ngOnInit(): void {

    this.customColDefs.push(
      {
        colId: 'removingProtocolName', headerName: 'Vyřazovací protocol', field: 'asset.removingProtocol.document',
      },
      {
        colId: 'removingProtocolDate', headerName: 'Protocol ze dne', field: 'asset.removingProtocol.documentDate',
        valueGetter: params => {
          const time = params?.node?.data?.asset?.removingProtocol?.documentDate;
          if (time) {
            return AgGridFuncs.dateTimeFormatter(time, DateTimeFormatterType.JUST_DAYS);
          }
          return;
        }
      },
      {
        colId: 'removingProtocolCreated', headerName: 'Vytvořen', field: 'asset.removingProtocol.created',
        valueGetter: params => {
          const time = params?.node?.data?.asset?.removingProtocol?.created;
          if (time) {
            return AgGridFuncs.dateTimeFormatter(time, DateTimeFormatterType.JUST_DAYS);
          }
          return;
        }
      }
    );

  }

  dateFormatter(params: any): string {
    const covracim = new Date(params.value).toLocaleString();
    return covracim;
  }

}
