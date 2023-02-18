import {Injectable} from '@angular/core';
import {AssetSource, Facade} from '../facade/facade';
import {firstValueFrom} from 'rxjs';

export enum ProtocolEmitEnum {
  TRANSFER_PROTOCOL = 1,
  DELETE_LIST,
  USERS_ASSETS_PROTOCOL,
  QR_CODES
}

export interface ProtocolEnumWithAssetsSource {
  protocol: ProtocolEmitEnum;
  source: AssetSource;
}

@Injectable({
  providedIn: 'root'
})


export class ProtocolsService {

  constructor(private facade: Facade) {
  }

  showUserAssetsProtocol(userId: number): void {
    window.open('/protocols/' + ProtocolEmitEnum.USERS_ASSETS_PROTOCOL + '/' +userId, '_blank');
  }

  prepareProtocol(prepareProtocol: ProtocolEnumWithAssetsSource): void {
    const protocolEmited: ProtocolEmitEnum = prepareProtocol.protocol;
    const sourceType: AssetSource = prepareProtocol.source;

    firstValueFrom(this.facade.getAssetExt(sourceType)).then(source => {
      localStorage.setItem('protocolList', JSON.stringify(source));
      window.open('/protocols/' + protocolEmited, '_blank');
    })
  }
}
