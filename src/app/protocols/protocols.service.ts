import {Injectable} from '@angular/core';
import {AssetSource, Facade} from '../facade/facade';
import {firstValueFrom, Observable} from 'rxjs';
import {Barcode} from '../qrCodes/components/qr-codes/qrCode.model';
import {map} from 'rxjs/operators';
import {IAssetsExt} from '../assets/assets.service';
import {Utils} from '../utils/Utils';
import {QrCodeBridge} from '../qrCodes/components/qr-codes/qrCode.bridge';

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


export class ProtocolsService implements QrCodeBridge {

  constructor(private facade: Facade) {
  }

  showUserAssetsProtocol(userId: number): void {
    window.open('/protocols/' + ProtocolEmitEnum.USERS_ASSETS_PROTOCOL + '/' + userId, '_blank');
  }

  prepareProtocol(prepareProtocol: ProtocolEnumWithAssetsSource): void {
    const protocolEmited: ProtocolEmitEnum = prepareProtocol.protocol;
    const sourceType: AssetSource = prepareProtocol.source;

    firstValueFrom(this.facade.getAssetExt(sourceType)).then(source => {
      localStorage.setItem('protocolList', JSON.stringify(source));
      window.open('/protocols/' + protocolEmited, '_blank');
    })
  }

  getBarcodes$(): Observable<Map<number, Barcode>> {
    return this.facade.getAssetExt(AssetSource.STORE).pipe(
      map(assets => assets.map(asset => QrCodeBridge.transform(asset))),
      map(barcodes =>
        Utils.createMap<number, Barcode>({
          array: barcodes,
          propertyName: 'id'
        })));
  }


}
