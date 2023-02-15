import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest, firstValueFrom, Observable, startWith, Subject, switchMap, tap} from 'rxjs';
import {AssetTransfer, Caretaker} from '../../models/asset-transfer.model';
import {TransferDataProvider} from '../abstract/transferDataProvider';
import {ActivatedRoute} from '@angular/router';
import {IAssetsExt} from '../../assets.service';
import {map} from 'rxjs/operators';
import {AssetSource} from '../../../facade/facade';
import {NbToastrService} from '@nebular/theme';

@Component({
  selector: 'app-asset-transfer-detail',
  templateUrl: './asset-transfer-detail.component.html',
  styleUrls: ['./asset-transfer-detail.component.scss']
})
export class AssetTransferDetailComponent implements OnInit {
  assetsTransfer$: Observable<AssetTransferDetail> | null = null
  reload$: Subject<void> = new Subject<void>();
  fetchDone = false;

  constructor(private dataProvider: TransferDataProvider, private route: ActivatedRoute, private nbToasterService: NbToastrService) {

  }

  ngOnInit(): void {
    this.assetsTransfer$ = this.route.paramMap.pipe(
      switchMap(paramMap => combineLatest([
        this.reload$.pipe(
          startWith(''),
          switchMap(() => this.dataProvider.getAssetTransfer$(paramMap.get('uuid') as string))),
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


  revert(uuid: string): void {
    firstValueFrom(this.dataProvider.revertTransfer(uuid)).then(() => {
      this.nbToasterService.success('hotovo');
      this.reload$.next();
    }, reason => {
      this.nbToasterService.danger('nepovedlo se');
    })
  }

  reject(uuid: string): void {
    firstValueFrom(this.dataProvider.rejectTransfer(uuid)).then(() => {
      this.nbToasterService.success('hotovo');
      this.reload$.next();
    }, reason => {
      this.nbToasterService.danger('nepovedlo se');
    })
  }

  approve(uuid: string): void {
    firstValueFrom(this.dataProvider.approveTransfer(uuid)).then(() => {
      this.nbToasterService.success('hotovo');
      this.reload$.next();
    }, reason => {
      this.nbToasterService.danger('error');
    })
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
