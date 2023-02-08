import {Component, OnInit} from '@angular/core';
import {combineLatest, Observable, switchMap, tap} from 'rxjs';
import {AssetTransfer, Caretaker} from '../../models/asset-transfer.model';
import {TransferDataProvider} from '../abstract/transferDataProvider';
import {ActivatedRoute} from '@angular/router';
import {IAssetsExt} from '../../assets.service';
import {map} from 'rxjs/operators';
import {AssetSource} from '../../../facade/facade';

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
    this.assetsTransfer$ = this.route.paramMap.pipe(
      switchMap(paramMap => combineLatest([
        this.dataProvider.getAssetTransfer$(paramMap.get('uuid') as string),
        this.dataProvider.getAssetExtMap$(AssetSource.STORE).pipe(tap(console.log))])
      ),
      map(([transfer, assetsMap]) => this.transform(transfer, assetsMap)),
      tap(() => this.fetchDone = true)
    )
  }

  private transform(transfer: AssetTransfer, assetsMap: Map<number, IAssetsExt>): AssetTransferDetail {
    return {
      ...transfer,
      assets: this.getIAssetsExts(transfer, assetsMap)
    }
  }

  private getIAssetsExts(transfer: AssetTransfer, assetsMap: Map<number, IAssetsExt>) {
    return transfer.assets.map(asset => assetsMap.get(asset.id)) as IAssetsExt[];
  }
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
