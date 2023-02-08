import {Component} from '@angular/core';
import {ColDef, GridOptions} from 'ag-grid-community';
import {combineLatest, Observable, retry} from 'rxjs';
import {TransferDataProvider} from '../abstract/transferDataProvider';
import {transferListColDef} from './transferList.col-def';
import {ActivatedRoute, Router} from '@angular/router';
import {AssetTransfer, Caretaker} from '../../models/asset-transfer.model';
import {Asset} from '../../models/assets.model';
import {map} from 'rxjs/operators';

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
  assetTransfers$: Observable<AssetTransferForList[]>;

  constructor(private dataProvider: TransferDataProvider, private router: Router, private route: ActivatedRoute) {
    this.assetTransfers$ = combineLatest([dataProvider.getAssetTransfers$(), dataProvider.getAssetsMap$()])
      .pipe(map(([transfers, assetsMap]) => transfers.map(transfer => AssetTransfersListComponent.transformAssetsForList(transfer, assetsMap))));
  }

  private static transformAssetsForList(transfer: AssetTransfer, assetsMap: Map<number, Asset>): AssetTransferForList {
    const assetsInTransfer = this.getAssets(transfer, assetsMap);
    this.validateAssets(assetsInTransfer);

    return {
      ...transfer,
      fromUnit: transfer.caretakerFrom.unit_name,
      toUnit: transfer.caretakerTo.unit_name,
      caretakerFrom: this.getCaretakerFullName(transfer.caretakerFrom),
      caretakerTo: this.getCaretakerFullName(transfer.caretakerTo),
      assets_names: this.getAssetsNames(assetsInTransfer),
      assets_ic: this.getAssetsIc(assetsInTransfer),
    }
  }

  private static getCaretakerFullName(caretaker: Caretaker) {
    return caretaker.surname + ' ' + caretaker.name;
  }

  private static getAssetsIc(assets: Asset[]) {
    return assets.map(a => a.inventoryNumber);
  }

  private static getAssetsNames(assets: Asset[]) {
    return assets.map(a => a?.name);
  }

  private static getAssets(transfer: AssetTransfer, assetsMap: Map<number, Asset>): Asset[] {
    return transfer.assets.map(asset => this.getAssetFromMap(assetsMap, asset));
  }

  private static getAssetFromMap(assetsMap: Map<number, Asset>, asset: { id: number }): Asset {
    const found = assetsMap.get(asset.id);
    if (!found) {
      this.throwError(`Asset with ID ${asset.id} not found in map`);
    }
    return found as Asset;
  }

  private static throwError(message: string): void {
    throw new Error(message);
  }

  private static validateAssets(assets: any) {
    if (!assets || assets.length === 0) {
      throw new Error('asset transfer must have assets!');
    }
  }
}

export interface AssetTransferForList {
  uuid: string;
  caretakerFrom: string;
  caretakerTo: string;
  fromUnit: string;
  toUnit: string;
  assets_names: string[];
  assets_ic: string[];
  createdAt: Date;
  revertedAt: Date | null;
  rejectedAt: Date | null;
  acceptedAt: Date | null;
}


