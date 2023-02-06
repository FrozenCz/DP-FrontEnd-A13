import {IRightsGet} from '../users.service';

export class User {
  private _id: number;
  private _username: string;
  private _name: string;
  private _surname: string;
  private _unit_id: number;
  private _reachable: boolean;

  constructor(id: number, username: string, name: string, surname: string, unit_id: number, reachable: boolean) {
    this._id = id;
    this._username = username;
    this._name = name;
    this._surname = surname;
    this._unit_id = unit_id;
    this._reachable = reachable;
  }

  get id(): number {
    return this._id;
  }


  get username(): string {
    return this._username;
  }

  set username(value: string) {
    this._username = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get surname(): string {
    return this._surname;
  }

  set surname(value: string) {
    this._surname = value;
  }

  get unit_id(): number {
    return this._unit_id;
  }

  set unit_id(value: number) {
    this._unit_id = value;
  }

  get fullName(): string {
    return this._surname + ' ' + this._name
  }

  get reachable(): boolean {
    return this._reachable;
  }

}

export interface IUserWithRights extends User {
  user: User;
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
