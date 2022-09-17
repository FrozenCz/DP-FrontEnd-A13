import {Unit} from '../../units/models/unit.model';
import {User} from '../../users/model/user.model';
import {IAssetsExt} from '../assets.service';

export const ASSETS_INFORMATION = ['quantity', 'name', 'serialNumber', 'inventoryNumber', 'evidenceNumber',
  'identificationNumber', 'inquiryDate', 'inquiryPrice', 'document', 'note'];

export enum AssetState {
  actual,
  removed,
  both
}

export interface AssetModelExt {
  id: number;
  category: IAssetCategory;
  name: string;
  quantity: number;
  user: User;
  serialNumber: string;
  inventoryNumber: string;
  evidenceNumber: string;
  identificationNumber: string;
  inquiryDate: Date;
  document: string;
  inquiryPrice: bigint;
  location: string;
  locationEtc: string;
  note: string;
  state: AssetState;
}

export interface AssetsModelDto {
  id: number;
  category: IAssetCategory;
  name: string;
  quantity: number;
  user_id: number;
  serialNumber: string;
  inventoryNumber: string;
  evidenceNumber: string;
  identificationNumber: string;
  inquiryDate: Date;
  document: string;
  inquiryPrice: bigint;
  location: string;
  locationEtc: string;
  note: string;
  state: AssetState;
  removingProtocol: IRemovingProtocolInAsset;
  version: number;
}

export interface IRemovingProtocolInAsset {
  id: number;
  document: string;
  documentDate: Date;
  possibleRemovingDate: Date;
  created: Date;
}


export interface IAssetCategory {
  id: number;
  name: string;
  // code: string;
}

export interface IAssetUser {
  id: number;
  name: string;
  surname: string;
  unit: {
    id: number;
    name: string;
  };
}

export interface IAssetUserExt {
  id: number;
  name: string;
  surname: string;
  reachable: boolean;
  unit: Unit;
}

export interface ICreateAsset {
  categoryId: number;
  quantity: number;
  userId: number;
  name?: string;

  serialNumber?: string;
  inventoryNumber?: string;
  evidenceNumber?: string;
  identificationNumber?: string;
  inquiryDate?: Date;
  document?: string;
  location?: string;
  locationEtc?: string;
  note?: string;
  inquiryPrice?: bigint;
}

export interface IAssetUserExt {
  id: number;
  name: string;
  surname: string;
  reachable: boolean;
  unit: Unit;
}

export enum AssetNoteSetTypeEnum {
  start,
  end,
  replace
}

export enum AssetChangeEnum {
  assetUser = 'assetUser',
  assetSerialNumber = 'assetSerialNumber',
  assetInventoryNumber = 'assetInventoryNumber',
  assetEvidenceNumber = 'assetEvidenceNumber',
  assetIdentificationNumber = 'assetIdentificationNumber',
  assetName = 'assetName',
  assetNote = 'assetNote'
}

export interface Change {
  type: AssetChangeEnum;
  newValue: string | number | User;
}

export interface IAssetExtWithChanges extends IAssetsExt {
  changes: Change[];
}

export interface IRemoveAssetsInformation {
  removingDocumentIdentification: string;
  documentDate: Date;
  possibleRemovingDate: Date;
}

export interface AssetNote {
  id: number;
  user: IAssetUserExt;
  note: string;
  created: Date;
  updated: Date;
}
