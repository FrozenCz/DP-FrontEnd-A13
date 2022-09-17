import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
// @ts-ignore
import jwt_decode from 'jwt-decode';
import {RightsTag} from '../shared/rights.list';
import {map} from 'rxjs/operators';

export interface JwtToken {
  userId: number;
  username: string;
  rights: string[];
  unitId: number | null;
  exp: number;
  iat: number;
}

export interface AppSettings {
  name: string;
  value: any;
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

  public getPermission$(rightsTag: RightsTag): Observable<boolean> {
    return this.currentToken$.pipe(map(token => !!token?.rights.includes(rightsTag)))
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

  public setSettings(name: string, value: any): void {
    const localStorageSettings = localStorage.getItem('mat-settings');
    let oldSettings: AppSettings[];
    if (localStorageSettings) {
      oldSettings = JSON.parse(localStorageSettings);
    } else {
      oldSettings = [];
    }

    const settings: AppSettings[] = [...oldSettings.filter(a => a.name !== this.currentTokenSubject.getValue()?.username + '_' + name)];
    settings.push({
      name: this.currentTokenSubject.getValue()?.username + '_' + name,
      value: JSON.stringify(value)
    });
    console.log(settings);
    localStorage.setItem('mat-settings', JSON.stringify(settings));
  }

  public getSetting(name: string): any {
    const localStorageSettingsString = localStorage.getItem('mat-settings');
    if (!localStorageSettingsString) return;
    const settings: AppSettings[] = JSON.parse(localStorageSettingsString);
    const val = settings?.find(s => s.name === this.currentTokenSubject.getValue()?.username + '_' + name)?.value;
    if (val) {
      return JSON.parse(val);
    }
    return null;
  }

}
