import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Barcode} from './components/qr-codes/qrCode.model';
import {QrCodeBridge} from './components/qr-codes/qrCode.bridge';

@Injectable({
  providedIn: 'root'
})
export class QrService {
  private assetsIdForQrCodes$: BehaviorSubject<Set<number>> = new BehaviorSubject<Set<number>>(new Set<number>());

  constructor(private qrBridge: QrCodeBridge) {

  }

  addToList(ids: number | number[]): void {
    const assetIds = this.assetsIdForQrCodes$.getValue();
    if (Array.isArray(ids)) {
      ids.forEach(id => assetIds.add(id))
    } else {
      assetIds.add(ids)
    }
    this.assetsIdForQrCodes$.next(assetIds);
  }

  getBarcodes$(): Observable<Map<number, Barcode>> {
    // return combineLatest([this.qrBridge.getBarcodes$(), this.assetsIdForQrCodes$])
    //   .pipe(
    //     map(([barcodes, assetIdsForTransfer]) => Array.from(assetIdsForTransfer).map(asset => barcodes.get(asset)) as Barcode[])
    //   )

    return this.qrBridge.getBarcodes$();
  }

  clearList(): void {
    this.assetsIdForQrCodes$.next(new Set());
  }

}
