import {Injectable} from '@angular/core';
import {NbDialogService, NbToastrService} from '@nebular/theme';
import {BehaviorSubject, forkJoin, Observable, of, switchMap} from 'rxjs';
import {IUser, IUserChanges, IUserExt, IUserMultipleChanges, IUserWithRights} from './model/user.model';
import {HttpClient} from '@angular/common/http';
import {TokenService} from '../auth/token.service';
import {map, take, tap} from 'rxjs/operators';
import {Unit} from '../units/models/unit.model';
import {UnitsService} from '../units/units.service';

export interface IRightsGet {
  id: number;
  tag: string;
  name: string;
  relatedTo: string;
  description?: string;
}

export interface ICreateUser {
  username: string;
  password: string;
  name: string;
  surname: string;
  unitId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private users$: BehaviorSubject<IUserExt[]> = new BehaviorSubject<IUserExt[]>([]);
  private reachableUnits: Unit[] = [];

  private selectedUsers: BehaviorSubject<IUserExt[]> = new BehaviorSubject<IUserExt[]>([]);
  selectedUsers$: Observable<IUser[]> = this.selectedUsers.asObservable();

  editMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  editMode$: Observable<boolean> = this.editMode.asObservable();

  constructor(private tokenService: TokenService,
              private nbDialogService: NbDialogService,
              private httpClient: HttpClient,
              private nbToastrService: NbToastrService,
              private unitsService: UnitsService
  ) {
    this.tokenService.getToken()
      .pipe(
        switchMap((token) => {
          if (token && token.unitId) {
            return this.unitsService.getDescendants(token.unitId);
          } else {
            return of([])
          }
        })).subscribe((reachableUnits) => {
      this.reachableUnits = reachableUnits;
      this.loadUsers().catch((err) => console.log(err));
    });
  }

  private static createFullName(user: IUser): string {
    return user.surname + ' ' + user.name;
  }

  createUser(newUser: ICreateUser): Observable<IUser> {
    return this.httpClient.post<IUser>('/rest/users', newUser);
  }

  private fetchUsers(): Observable<IUserExt[]> {
    return this.httpClient.get<IUser[]>('/rest/users').pipe(
      map(users => users.map(user => {
        return {
          ...user,
          fullName: UsersService.createFullName(user),
          reachable: this.isUserReachable(user)
        };
      }))
    );
  }

  async loadUsers(): Promise<void> {
    try {
      const users = await this.fetchUsers().toPromise();
      if (users) {
        this.users$.next(users);
      }
    } catch (e: any) {
      if ([401, 403].includes(e.error.statusCode)) {
        this.users$.next([]);
      }
    }
  }

  getUser(id: number): Observable<IUserExt> {
    return this.users$.asObservable()
      .pipe(
        map(users => {
          const userFound = users.find(user => user.id === id);
          if (!userFound) {
            throw new Error(`user with id ${id} not found`);
          }
          return userFound;
        })
      );
  }

  getUserWithRights(userId: number): Observable<IUserWithRights> {
    return this.httpClient.get<IUserWithRights>('/rest/users/' + userId);
  }

  updateUser(userId: number, user: IUserChanges): Observable<IUser> {
    return this.httpClient.patch<IUser>('/rest/users/' + userId, {...user});
  }

  addUserToSelected(userId: number): void {
    const selectedUsers = this.selectedUsers.getValue().slice(0);
    if (selectedUsers.find(u => u.id === userId)) {
      return;
    }
    const userToAdd = this.users$.getValue().find(user => user.id === userId);

    if (userToAdd) {
      selectedUsers.push(userToAdd);
      this.selectedUsers.next(selectedUsers);
    }
  }


  removeUserFromSelected(userId: number): void {
    const selectedUsers = this.selectedUsers.getValue().slice(0);
    const selectedUserIndex = selectedUsers.findIndex(user => user.id === userId);

    if (selectedUserIndex > -1) {
      selectedUsers.splice(selectedUserIndex, 1);
      this.selectedUsers.next(selectedUsers);
    }
  }

  deleteUser(userId: number): Observable<void> {
    return this.httpClient.delete<void>('/rest/users/' + userId);
  }

  deleteUsers(users: IUser[]): Observable<any> {
    const requests = [];
    for (let user of users) {
      requests.push(this.deleteUser(user.id));
    }
    return forkJoin([...requests]).pipe(
      take(1),
      tap(() => {
        const filteredUsers = this.users$.getValue().filter(user => !users.includes(user));
        this.users$.next(filteredUsers);
        this.selectedUsers.next([]);
      })
    );
  }

  getRights(): Observable<IRightsGet[]> {
    return this.httpClient.get<IRightsGet[]>('/rest/rights');
  }

  saveUsersRights(userId: number, rightsToAdd: number[], rightsToRemove: number[]): Observable<IRightsGet[]> {
    return this.httpClient.patch<IRightsGet[]>('/rest/users/' + userId + '/rights', {
      addRights: rightsToAdd,
      removeRights: rightsToRemove
    });
  }

  setEditModeTo(bool: boolean): void {
    this.editMode.next(bool);
    if (bool === false) {
      this.selectedUsers.next([]);
      this.loadUsers().then();
    } else {
      this.users$.next(this.selectedUsers.getValue());
    }
  }

  getSelectedUsers(): IUser[] {
    return this.selectedUsers.getValue();
  }

  updateUsers(changes: IUserMultipleChanges[]): Observable<IUser[]> {
    return this.httpClient.put<IUser[]>('/rest/users', {changes});
  }

  public getUsers$(): Observable<IUserExt[]> {
    return this.users$.asObservable().pipe(map(users => users.sort((a, b) => {
      return a.surname.localeCompare(b.surname);
    })));
  }


  private isUserReachable(user: IUser): boolean {
    if (user.unit === null) return true;
    return this.reachableUnits.map(unit => unit.id).includes(user.unit?.id);
  }

  wsUsersUpdate(users: IUser[]): void {
    console.log('co:?');
    if (!this.reachableUnits) {
      return;
    }
    const updatedUsers = this.users$.getValue().slice(0);
    users?.forEach((user) => {
      const userIndex = updatedUsers.findIndex(u => u.id === user.id);
      const updateUserExt: IUserExt = {
        ...user,
        fullName: UsersService.createFullName(user),
        reachable: this.isUserReachable(user)
      };
      if (userIndex > -1) { // update
        updatedUsers[userIndex] = updateUserExt;
      } else { // new user
        updatedUsers.push(updateUserExt);
      }
    });
    this.users$.next(updatedUsers);
  }

  wsUsersDelete(users: IUser[]): void {
    const updatedUsers = this.users$.getValue().slice(0).filter(user => !users.map(u => u.id).includes(user.id));
    this.users$.next(updatedUsers);
  }
}
