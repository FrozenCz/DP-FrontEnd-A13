import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {AssetsService, IAssetsExt} from '../../assets.service';
import {ColDef, GridOptions} from 'ag-grid-community';
import {AgGridFuncs, DateTimeFormatterType} from '../../../utils/agGrid/ag-grid.funcs';
import {map, takeUntil} from 'rxjs/operators';
import {AssetState} from '../../models/assets.model';

@Component({
  selector: 'app-removed-assets-list',
  templateUrl: './removed-assets-list.component.html',
  styleUrls: ['./removed-assets-list.component.scss']
})
export class RemovedAssetsListComponent implements OnInit, OnDestroy {
  gridUid = 'removeAssetsList';
  removedAssets: IAssetsExt[] = [];
  customGridOptions: Partial<GridOptions> = {};
  customColDefs: ColDef[] = [];
  removedColDefs: string[] = ['akce', 'reachable'];
  unsubscribe: Subject<void> = new Subject<void>();

  constructor(private assetsService: AssetsService) {
    this.assetsService.getAssets()
      .pipe(
        map(assets => assets.filter(a => a.asset.state === AssetState.removed)),
        takeUntil(this.unsubscribe)
      )
      .subscribe(assets => {
        this.removedAssets = assets;
      })
  }

  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete();
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
