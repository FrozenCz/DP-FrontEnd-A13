import {Unit} from '../../units/models/unit.model';
import {IRightsGet} from '../users.service';

export interface IUserExt extends IUser {
  fullName: string;
  reachable: boolean;
}

export interface IUser {
  id: number;
  username: string;
  name: string;
  surname: string;
  unit: Unit;
}

export interface IUserWithRights extends IUser{
  rights: IRightsGet[];
}

export interface IUserMultipleChanges {
  userId: number;
  unitId: number;
}

export interface IUserChanges{
  name?: string;
  surname?: string;
  unitId?: number;
}
