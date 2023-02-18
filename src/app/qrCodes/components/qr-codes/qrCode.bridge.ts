import {Barcode} from './qrCode.model';
import {Observable} from 'rxjs';
import {IAssetsExt} from '../../../assets/assets.service';

export abstract class QrCodeBridge {

  public abstract getBarcodes$(): Observable<Map<number, Barcode>>

  public static transform(asset: IAssetsExt): Barcode {
    return {
      name: asset.asset.name,
      found: false,
      location: asset.asset.location,
      id: asset.id
    }
  }
}
