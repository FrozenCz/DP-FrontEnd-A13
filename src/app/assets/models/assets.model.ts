import {Unit} from '../../units/models/unit.model';
import {User} from '../../users/model/user.model';
import {IAssetsExt} from '../assets.service';
import {Location} from '../../locations/model/location';
import {AssetAttachmentType} from './assets.dto';

export const ASSETS_INFORMATION = ['quantity', 'name', 'serialNumber', 'inventoryNumber', 'evidenceNumber', 'location',
  'identificationNumber', 'inquiryDate', 'inquiryPrice', 'document', 'note'];


export class Asset {
  private _id: number;
  private _category_id: number;
  private _name: string;
  private _quantity: number;
  private _user_id: number;
  private _serialNumber: string;
  private _inventoryNumber: string;
  private _evidenceNumber: string;
  private _identificationNumber: string;
  private _inquiryDate: Date;
  private _document: string;
  private _inquiryPrice: number;
  private _location_uuid: string | null;
  private _locationEtc: string;
  private _note: string;
  private _state: AssetState;
  private _attachments: AssetAttachments[];
  private _mainImageUrl: string | null = null;

  constructor(category_id: number,
              id?: number,
              name?: string,
              quantity?: number,
              user_id?: number,
              serialNumber?: string,
              inventoryNumber?: string,
              evidenceNumber?: string,
              identificationNumber?: string,
              inquiryDate?: Date,
              document?: string,
              inquiryPrice?: number,
              location?: string | null,
              locationEtc?: string,
              note?: string,
              state?: AssetState,
              attachments?: AssetAttachments[],
              mainImageUrl?: string
  ) {
    this._category_id = category_id;
    this._id = id ?? -1;
    this._name = name ?? '';
    this._quantity = quantity ?? -1;
    this._user_id = user_id ?? -1;
    this._serialNumber = serialNumber ?? '';
    this._inventoryNumber = inventoryNumber ?? '';
    this._evidenceNumber = evidenceNumber ?? '';
    this._identificationNumber = identificationNumber ?? '';
    this._inquiryDate = inquiryDate ?? new Date();
    this._document = document ?? '';
    this._inquiryPrice = inquiryPrice ?? -1;
    this._location_uuid = location ?? null;
    this._locationEtc = locationEtc ?? '';
    this._note = note ?? '';
    this._state = state ?? AssetState.new;
    this._attachments = attachments ?? [];
    this._mainImageUrl = mainImageUrl ?? (attachments?.length ? attachments[0].url : null);
  }

  get mainImageUrl(): string | null {
    return this._mainImageUrl;
  }

  get images(): AssetAttachments[] {
    return this._attachments.filter(attachment => attachment.type === AssetAttachmentType.image)
  }

  get id(): number {
    return this._id;
  }

  get category_id(): number {
    return this._category_id;
  }

  get name(): string {
    return this._name;
  }

  get quantity(): number {
    return this._quantity;
  }

  get user_id(): number {
    return this._user_id;
  }

  get serialNumber(): string {
    return this._serialNumber;
  }

  get inventoryNumber(): string {
    return this._inventoryNumber;
  }

  get evidenceNumber(): string {
    return this._evidenceNumber;
  }

  get identificationNumber(): string {
    return this._identificationNumber;
  }

  get inquiryDate(): Date {
    return this._inquiryDate;
  }

  get document(): string {
    return this._document;
  }

  get inquiryPrice(): number {
    return this._inquiryPrice;
  }

  get location_uuid(): string | null {
    return this._location_uuid;
  }

  get locationEtc(): string {
    return this._locationEtc;
  }

  get note(): string {
    return this._note;
  }

  get state(): AssetState {
    return this._state;
  }

  get attachments(): AssetAttachments[] {
    return this._attachments;
  }
}

export enum AssetState {
  new = -1,
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
  inquiryPrice: number;
  location: Location | null;
  locationEtc: string;
  note: string;
  state: AssetState;
  attachments: AssetAttachments[];
}

export interface AssetAttachments {
  url: string;
  filename: string;
  uuid: string;
  type: AssetAttachmentType;
}


export interface AssetsChanges {
  id: number;
  category_id: number;
  name: string;
  quantity: number;
  user: User;
  serialNumber: string;
  inventoryNumber: string;
  evidenceNumber: string;
  identificationNumber: string;
  inquiryDate: string;
  document: string;
  inquiryPrice: number;
  location_uuid: string;
  locationEtc: string;
  note: string;
  state: AssetState;
  removingProtocol_id: number;
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
