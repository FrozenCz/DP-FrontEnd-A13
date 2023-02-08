import {Component, OnInit} from '@angular/core';
import {combineLatest, Observable, switchMap, tap} from 'rxjs';
import {AssetTransfer, Caretaker} from '../../models/asset-transfer.model';
import {TransferDataProvider} from '../abstract/transferDataProvider';
import {ActivatedRoute} from '@angular/router';
import {IAssetsExt} from '../../assets.service';
import {map} from 'rxjs/operators';
import {Asset} from '../../models/assets.model';

@Component({
  selector: 'app-asset-transfer-detail',
  templateUrl: './asset-transfer-detail.component.html',
  styleUrls: ['./asset-transfer-detail.component.scss']
})
export class AssetTransferDetailComponent implements OnInit {
  assetsTransfer$: Observable<AssetTransferDetail> | null = null
  fetchDone = false;

  constructor(private dataProvider: TransferDataProvider, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    // this.assetsTransfer$ = this.route.paramMap.pipe(
    //   switchMap(paramMap => combineLatest([
    //     this.dataProvider.getAssetTransfer$(paramMap.get('uuid') as string),
    //     this.dataProvider.getAssetsMap$()])
    //   ),
    //   map(([transfer, assetsMap]) => )
    //   tap(() => this.fetchDone = true)
    // )
  }

  // private transform(transfer: AssetTransfer, assetsMap: Map<number, Asset>): AssetTransferDetail {
  //   return {
  //     ...transfer,
  //     assets: transfer.assets.map(asset => assetsMap.get(asset.id))
  //   }
  // }

}

export interface AssetTransferDetail {
  uuid: string;
  caretakerFrom: Caretaker,
  caretakerTo: Caretaker,
  assets: IAssetsExt[],
  createdAt: Date;
  revertedAt: Date | null;
  rejectedAt: Date | null;
  acceptedAt: Date | null;
  message: string | null;
}
