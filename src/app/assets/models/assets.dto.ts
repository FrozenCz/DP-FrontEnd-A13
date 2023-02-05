import {AssetState} from './assets.model';

export interface SaveImageToAssetDto {
  filename: string;
  base64: string | ArrayBuffer;
}


export interface AssetsModelDto {
  id: number;
  category_id: number;
  name: string;
  quantity: number;
  user_id: number;
  serialNumber: string;
  inventoryNumber: string;
  evidenceNumber: string;
  identificationNumber: string;
  inquiryDate: string;
  document: string;
  inquiryPrice: number;
  location_uuid: string | null;
  locationEtc: string;
  note: string;
  state: AssetState;
  removingProtocol_id: number;
  version: number;
  attachments: AssetAttachmentDto[];
  mainImageUuid: string | null;
}

export interface AssetAttachmentDto {
  uuid: string;
  url: string;
  filename: string;
  type: AssetAttachmentType
}

export enum AssetAttachmentType {
  file,
  image,
}
