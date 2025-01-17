import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {TransferDataProvider} from './components/abstract/transferDataProvider';
import {IAssetsExt} from './assets.service';
import {AssetSource} from '../facade/facade';
import {Caretaker} from '../users/model/caretaker.model';
import {map} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private assetsIdForTransfer$: BehaviorSubject<Set<number>> = new BehaviorSubject<Set<number>>(new Set<number>());

  constructor(private dataProvider: TransferDataProvider) {
  }

  clearList(): void {
    this.assetsIdForTransfer$.next(new Set());
  }

  addToTransferList(ids: number | number[]): void {
    const assetIds = this.assetsIdForTransfer$.getValue();
    if (Array.isArray(ids)) {
      ids.forEach(id => assetIds.add(id))
    } else {
      assetIds.add(ids)
    }
    this.assetsIdForTransfer$.next(assetIds);
  }

  getAssetsForTransfer$(): Observable<IAssetsExt[]> {
    return combineLatest([this.dataProvider.getAssetExtMap$(AssetSource.STORE), this.assetsIdForTransfer$]).pipe(
      map(([assets, assetIdsForTransfer]) => Array.from(assetIdsForTransfer).map(asset => assets.get(asset)) as IAssetsExt[])
    )
  }

  getCaretakers$(): Observable<Caretaker[]> {
    return this.dataProvider.getCaretakers$();
  }

  getCaretaker$(): Observable<Caretaker> {
    return this.dataProvider.getCaretaker$();
  }

  sendRequestForAssetTransfer(fromUser: number, toUser: number, assetIds: number[], message: string) {
    return this.dataProvider.sendRequestForAssetTransfer(fromUser, toUser, assetIds, message);
  }
}


