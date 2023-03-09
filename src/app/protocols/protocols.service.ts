import {Injectable} from '@angular/core';
import {AssetSource, Facade} from '../facade/facade';
import {firstValueFrom, Observable} from 'rxjs';
import {Barcode} from '../qrCodes/components/qr-codes/qrCode.model';
import {map} from 'rxjs/operators';
import {Utils} from '../utils/Utils';
import {QrCodeAdapter} from '../qrCodes/components/qr-codes/qrCode.adapter';
import {Asset} from '../assets/models/assets.model';
import {IAssetsExt} from '../assets/assets.service';

export enum ProtocolEmitEnum {
  TRANSFER_PROTOCOL = 1,
  DELETE_LIST,
  USERS_ASSETS_PROTOCOL,
  QR_CODES,
}

export interface ProtocolEnumWithAssetsSource {
  protocol: ProtocolEmitEnum;
  source: AssetSource;
}

@Injectable({
  providedIn: 'root'
})


export class ProtocolsService implements QrCodeAdapter {

  constructor(private facade: Facade) {
  }

  showUserAssetsProtocol(userId: number): void {
    window.open('/protocols/' + ProtocolEmitEnum.USERS_ASSETS_PROTOCOL + '/' + userId, '_blank');
  }

  prepareProtocol(prepareProtocol: ProtocolEnumWithAssetsSource): void {
    const protocolEmited: ProtocolEmitEnum = prepareProtocol.protocol;
    const sourceType: AssetSource = prepareProtocol.source;

    switch (prepareProtocol.protocol) {
      case ProtocolEmitEnum.TRANSFER_PROTOCOL:
        break;
      case ProtocolEmitEnum.DELETE_LIST:
        break;
      case ProtocolEmitEnum.USERS_ASSETS_PROTOCOL:
        break;
      case ProtocolEmitEnum.QR_CODES:
        firstValueFrom(this.facade.getAssetExt(sourceType)).then(source => {
          localStorage.setItem('qr_codes', JSON.stringify(source.map(s => s.id)));
          window.open('/protocols/' + protocolEmited, '_blank');
        })
        break;
      default:
        firstValueFrom(this.facade.getAssetExt(sourceType)).then(source => {
          localStorage.setItem('protocolList', JSON.stringify(source));
          window.open('/protocols/' + protocolEmited, '_blank');
        })
    }


  }
 
  getBarcodes$(): Observable<Barcode[]> {
    return this.facade.getAssetExt(AssetSource.STORE).pipe(
      map(assets => this.filter(assets)),
      map(assets => assets.map(asset => QrCodeAdapter.transform(asset))));
  }


  private filter(assets: IAssetsExt[]): IAssetsExt[] {
    const assetsIdsInLocalStorage = localStorage.getItem('qr_codes');
    if (assetsIdsInLocalStorage) {
      const numberArray: number[] = JSON.parse(assetsIdsInLocalStorage);
      return assets.filter(asset => numberArray.includes(asset.id))
    } else {
      return [];
    }
  }
}
