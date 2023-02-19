import {Observable} from 'rxjs';
import {IAssetsExt} from '../../../assets/assets.service';
import {Barcode} from './qrCode.model';


export abstract class QrCodeAdapter {

  public abstract getBarcodes$(): Observable<Barcode[]>

  public static transform(asset: IAssetsExt): Barcode {
    return {
      name: asset.asset.name,
      found: false,
      location: asset.asset.location,
      id: asset.id
    }
  }
}
