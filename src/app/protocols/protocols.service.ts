import {Injectable} from '@angular/core';
import {AssetsService, AssetsSourceEnum} from '../assets/assets.service';

export enum ProtocolEmitEnum {
  TRANSFER_PROTOCOL = 1,
  DELETE_LIST,
  USERS_ASSETS_PROTOCOL
}

export interface ProtocolEnumWithAssetsSource {
  protocol: ProtocolEmitEnum;
  source: AssetsSourceEnum;
}

@Injectable({
  providedIn: 'root'
})


export class ProtocolsService {

  constructor(private assetsService: AssetsService) {
  }

  showUserAssetsProtocol(userId: number): void {
    window.open('/protocols/' + ProtocolEmitEnum.USERS_ASSETS_PROTOCOL + '/' +userId, '_blank');
  }

  prepareProtocol(prepareProtocol: ProtocolEnumWithAssetsSource): void {
    const protocolEmited: ProtocolEmitEnum = prepareProtocol.protocol;
    const sourceType: AssetsSourceEnum = prepareProtocol.source;

    const source = this.assetsService.getAssetFromSource(sourceType);
    localStorage.setItem('protocolList', JSON.stringify(source));
    window.open('/protocols/' + protocolEmited, '_blank');
  }
}
