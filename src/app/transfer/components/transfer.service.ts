import {Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {AssetService} from './abstract/asset.service';
import {map} from 'rxjs/operators';
import {AssetSource} from '../../facade/facade';
import {IAssetsExt} from '../../assets/assets.service';

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private assetsIdForTransfer$: BehaviorSubject<Set<number>> = new BehaviorSubject<Set<number>>(new Set<number>());

  constructor(private assetService: AssetService) {
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
    return combineLatest([this.assetService.getAssetExt(AssetSource.STORE), this.assetsIdForTransfer$]).pipe(
      map(([assets, assetIdsForTransfer]) => assets.filter(asset => assetIdsForTransfer.has(asset.id)))
    )
  }

}


