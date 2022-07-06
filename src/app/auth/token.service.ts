import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
// @ts-ignore
import jwt_decode from 'jwt-decode';
import {RightsTag} from '../shared/rights.list';

export interface JwtToken {
  userId: number;
  username: string;
  rights: string[];
  unitId: number | null;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private currentTokenSubject: BehaviorSubject<JwtToken | undefined> = new BehaviorSubject<JwtToken | undefined>(undefined);
  private currentToken$: Observable<JwtToken | undefined> = this.currentTokenSubject.asObservable();


  constructor() {
    const localStorageToken = localStorage.getItem('authJwtToken');
    if (localStorageToken) {
      this.logIn(localStorageToken);
    }
  }

  public logOut(): void {
    localStorage.removeItem('authJwtToken');
    this.currentTokenSubject.next(undefined);
  }

  public logIn(token: string): void {
    localStorage.setItem('authJwtToken', token);
    const decodeToken: JwtToken = jwt_decode(token);

    if (decodeToken) {
      this.currentTokenSubject.next(decodeToken);
    }
  }

  public getPermission(rightsTag: RightsTag): boolean {
    return !!this.currentTokenSubject.getValue()?.rights.includes(rightsTag);
  }

  public getToken(): Observable<JwtToken | undefined> {

    if (this.currentTokenSubject.getValue()) {
      const decodedToken = this.currentTokenSubject.getValue();
      const time = Math.round(+new Date() / 1000);

      if ((decodedToken && time > decodedToken.exp) || !decodedToken) {
        this.currentTokenSubject.next(undefined);
      }
    }

    return this.currentToken$;
  }

}
