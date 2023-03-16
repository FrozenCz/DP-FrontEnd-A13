import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {restIp} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient) {
  }

  login(username: string, password: string): Observable<any>{
    return this.httpClient.post(restIp + '/auth/sign_in', {username, password});
  }


}
