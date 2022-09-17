import {HistoryRelatedTo} from './history.enum';
import {AssetsModelDto} from '../../assets/models/assets.model';
import {User} from '../../users/model/user.model';

export interface IHistoryInList {
  id: number;
  relatedTo: HistoryRelatedTo;
  changedFrom: Partial<AssetsModelDto>;
  changedTo: Partial<AssetsModelDto>;
  changedBy: SimpleUser;
  user?: User;
  asset?: AssetsModelDto;
  created: Date;
}
export interface SimpleUser {
  id: number; name: string; surname: string; unit: {id: number; name: string};
}

export interface HistoryModel{
  id: number;
  changedBy: SimpleUser;
  changedFrom: Partial<AssetsModelDto>;
  changedTo: Partial<AssetsModelDto>;
  relatedTo: HistoryRelatedTo;
  created: Date;
  asset?: AssetsModelDto;
  user?: SimpleUser;
}

export interface HistoryDto {
  id: number;
  changedBy: SimpleUser;
  changedFrom: Partial<AssetsModelDto>;
  changedTo: Partial<AssetsModelDto>;
  relatedTo: HistoryRelatedTo;
  created: Date;
  asset?: AssetsModelDto;
  user?: SimpleUser;
}
