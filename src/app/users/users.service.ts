import {Injectable} from '@angular/core';
import {NbDialogService, NbToastrService} from '@nebular/theme';
import {BehaviorSubject, firstValueFrom, forkJoin, noop, Observable, of, switchMap} from 'rxjs';
import {IUserChanges, IUserMultipleChanges, IUserWithRights, User} from './model/user.model';
import {HttpClient} from '@angular/common/http';
import {TokenService} from '../auth/token.service';
import {map, take, tap, withLatestFrom} from 'rxjs/operators';
import {Unit} from '../units/models/unit.model';
import {UnitsService} from '../units/units.service';
import {Store} from '../store/store';
import {UserDto} from './dto/user.dto';

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
  usersStore$: Store<User> = new Store<User>({identifierName: 'id'});
  selectedUsers$: Store<User> = new Store<User>({identifierName: 'id'});

  private reachableUnits: Unit[] = [];

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


  createUser(newUser: ICreateUser): Observable<void> {
    return this.httpClient.post<void>('/rest/users', newUser);
  }

  private fetchUsers(): Observable<UserDto[]> {
    return this.httpClient.get<UserDto[]>('/rest/users');
  }

  async loadUsers(): Promise<void> {
    try {
      const users = await this.fetchUsers().toPromise();
      if (users) {
        const usersEntities: User[] = [];
        for(const user of users) {
          usersEntities.push(this.createUserFromDTO(user))
        }
        this.usersStore$.putData(usersEntities);
      }
    } catch (e: any) {
      if ([401, 403].includes(e.error.statusCode)) {
        this.usersStore$.putData([]);
      }
    }
  }


  private createUserFromDTO(userDTO: UserDto): User {
    return new User(userDTO.id, userDTO.name, userDTO.name, userDTO.surname, userDTO.unit_id, userDTO.reachable)
  }

  getUser(id: number): Observable<User> {
    return this.usersStore$.getOne$(id);
  }

  getUserWithRights(userId: number): Observable<IUserWithRights> {
    return this.httpClient.get<IUserWithRights>('/rest/users/' + userId);
  }

  updateUser(userId: number, user: IUserChanges): Observable<void> {
    return this.httpClient.patch<void>('/rest/users/' + userId, {...user});
  }

  addUserToSelected(userId: number): void {
    firstValueFrom(this.usersStore$.getOne$(userId).pipe(withLatestFrom(this.selectedUsers$.getAll$()))).then(([user, users]) => {
      this.selectedUsers$.putData([...users.filter(u => u.id !== user.id), user]);
    })
  }

  removeUserFromSelected(userId: number): void {
    this.selectedUsers$.remove(userId).then(noop);
  }

  deleteUser(userId: number): Observable<void> {
    return this.httpClient.delete<void>('/rest/users/' + userId);
  }

  deleteUsers(users: User[]): Observable<any> {
    const requests = [];
    for (let user of users) {
      requests.push(this.deleteUser(user.id));
    }
    return forkJoin([...requests]).pipe(
      take(1),
      tap(() => {
        // toto by mel resit ws
        // const filteredUsers = this.usersStore$.getValue().filter(user => !users.includes(user));
        // this.users$.next(filteredUsers);
        this.selectedUsers$.putData([]);
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
      this.selectedUsers$.putData([]);
      this.loadUsers().then();
    } else {
      // nechápu vyznam teto akce
      // this.users$.next(this.selectedUsers$.getValue());
    }
  }

  getSelectedUsers(): Observable<User[]> {
    return this.selectedUsers$.getAll$();
  }

  updateUsers(changes: IUserMultipleChanges[]): Observable<void> {
    return this.httpClient.put<void>('/rest/users', {changes});
  }

  public getUsers$(): Observable<User[]> {
    return this.usersStore$.getAll$().pipe(map(users => users.sort((a, b) => {
      return a.surname.localeCompare(b.surname);
    })));
  }

  public getUsersMap$(): Observable<Map<number, User>> {
    return this.usersStore$.getMap$();
  }


  wsUsersUpdate(users: UserDto[]): void {
    // nejsem si jist zda se jedná o update všeho nebo jen jedne entity
    this.usersStore$.update(users.map(u => this.createUserFromDTO(u)));
  }

  wsUsersDelete(users: UserDto[]): void {
    this.usersStore$.remove(users).then(noop);
  }
}
