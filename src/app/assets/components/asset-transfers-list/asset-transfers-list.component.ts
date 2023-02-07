import {Component} from '@angular/core';
import {ColDef, GridOptions} from 'ag-grid-community';
import {Observable, tap} from 'rxjs';
import {AssetTransfer} from '../../models/asset-transfer.model';
import {TransferDataProvider} from '../abstract/transferDataProvider';
import {transferListColDef} from './transferList.col-def';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-asset-transfers-list',
  templateUrl: './asset-transfers-list.component.html',
  styleUrls: ['./asset-transfers-list.component.scss']
})
export class AssetTransfersListComponent {
  colDef: ColDef[] = transferListColDef;
  defaultColDef: ColDef = {
    floatingFilter: true,
    filter: 'agTextColumnFilter',
  }
  gridOptions: GridOptions = {
    onRowDoubleClicked: (params) => {
      if (params.data.uuid) {
        this.router.navigate([params.data.uuid], {relativeTo: this.route})
      }
    }
  };
  assetTransfers$: Observable<AssetTransfer[]>;

  constructor(private dataProvider: TransferDataProvider, private router: Router, private route: ActivatedRoute) {
    this.assetTransfers$ = dataProvider.getAssetTransfers$().pipe(tap(console.log));
  }


}
