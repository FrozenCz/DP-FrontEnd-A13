import {Component, OnInit} from '@angular/core';
import {ColDef, GridOptions} from 'ag-grid-community';
import {Observable, tap} from 'rxjs';
import {AssetTransfer} from '../../models/asset-transfer.model';
import {TransferDataProvider} from '../abstract/transferDataProvider';
import {transferListColDef} from './transferList.col-def';

@Component({
  selector: 'app-asset-transfers-list',
  templateUrl: './asset-transfers-list.component.html',
  styleUrls: ['./asset-transfers-list.component.scss']
})
export class AssetTransfersListComponent implements OnInit {
  colDef: ColDef[] = transferListColDef;
  gridOptions: GridOptions = {};
  assetTransfers$: Observable<AssetTransfer[]>;

  constructor(private dataProvider: TransferDataProvider) {
    this.assetTransfers$ = dataProvider.getAssetTransfers$().pipe(tap(console.log));
  }

  ngOnInit(): void {
  }

}
