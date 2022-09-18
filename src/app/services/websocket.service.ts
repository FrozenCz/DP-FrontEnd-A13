import {Injectable} from '@angular/core';
import {webSocket, WebSocketSubjectConfig} from 'rxjs/webSocket';
import {AssetsWs} from '../assets/models/assets.ws.model';
import {webSocketUrl} from '../../environments/environment';
import {interval, Observable, Subject} from 'rxjs';
import {AssetsModelDto} from '../assets/models/assets.model';
import {
  takeWhile,
} from 'rxjs/operators';
import {CategoriesWs} from '../categories/models/categories.ws.model';
import {UsersWs} from '../users/model/users.ws.model';
import {ICategoryGet} from '../categories/models/category.model';
import {AssetsService} from '../assets/assets.service';
import {CategoriesService} from '../categories/categories.service';
import {UsersService} from '../users/users.service';
import {NbToastrService} from '@nebular/theme';
import {User} from '../users/model/user.model';
import {UserDto} from '../users/dto/user.dto';
import { io } from "socket.io-client";


// create update delete
export interface AssetsUpdate {
  changes: AssetsModelDto[];
  type: AssetsWs.assetsUpdate;
}

// create update
export interface CategoryUpdate {
  changes: ICategoryGet;
  type: CategoriesWs.categoryUpdate;
}

// delete
export interface CategoryDelete {
  changes: number;
  type: CategoriesWs.categoryDelete;
}

// create update
export interface UsersUpdate {
  changes: UserDto[];
  type: UsersWs.usersUpdate;
}

// delete
export interface UsersDelete {
  changes: UserDto[];
  type: UsersWs.usersDelete;
}


export interface WsResponse {
  event: string; // 'ws'
  data: AssetsUpdate | CategoryUpdate | CategoryDelete | UsersUpdate | UsersDelete;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  // websocket: RxWebsocketSubject<WsResponse> = new RxWebsocketSubject<WsResponse>();
  socket = io(webSocketUrl);

  constructor(
    private assetsService: AssetsService,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
    private toastrService: NbToastrService
  ) {

    this.socket.on('changes', (response: WsResponse) => {
      switch (response?.data?.type) {
        case AssetsWs.assetsUpdate:
          this.assetsService.wsAssetsUpdate(response.data.changes);
          break;
        case CategoriesWs.categoryUpdate:
          this.categoriesService.wsCategoryUpdate(response.data.changes);
          break;
        case CategoriesWs.categoryDelete:
          this.categoriesService.wsCategoryDelete(response.data.changes);
          break;
        case UsersWs.usersUpdate:
          this.usersService.wsUsersUpdate(response.data.changes);
          break;
        case UsersWs.usersDelete:
          this.usersService.wsUsersDelete(response.data.changes);
          break;
      }

    })


    // this.websocket.wsMessages$.subscribe((response: WsResponse) => {
    //   switch (response?.data?.type) {
    //     case AssetsWs.assetsUpdate:
    //       this.assetsService.wsAssetsUpdate(response.data.changes);
    //       break;
    //     case CategoriesWs.categoryUpdate:
    //       this.categoriesService.wsCategoryUpdate(response.data.changes);
    //       break;
    //     case CategoriesWs.categoryDelete:
    //       this.categoriesService.wsCategoryDelete(response.data.changes);
    //       break;
    //     case UsersWs.usersUpdate:
    //       this.usersService.wsUsersUpdate(response.data.changes);
    //       break;
    //     case UsersWs.usersDelete:
    //       this.usersService.wsUsersDelete(response.data.changes);
    //       break;
    //   }
    // });
    // this.websocket.connectionEstablished$.subscribe(connected => {
    //   if (connected) {
    //     this.toastrService.success('spojení navázáno', 'WEBSOCKET', {icon: 'wifi-outline'});
    //   } else {
    //     this.toastrService.danger('spojení ztraceno', 'WEBSOCKET', {icon: 'wifi-off-outline'});
    //   }
    // });
  }
}

class RxWebsocketSubject<T> extends Subject<T> {
  private reconnectInterval = 5000;
  private reconnectAttempts = 5000;
  private reconnection$!: Observable<number> | null;
  private socket!: any;
  private websocketConf: WebSocketSubjectConfig<any> = {
    url: webSocketUrl,
    closeObserver: {
      next: (e: CloseEvent) => {
        this.socket = null;
        this.connectionEstablished$.next(false);
      }
    },
    openObserver: {
      next: (e: Event) => {
        this.connectionEstablished$.next(true);
      }
    }
  };
  private wsMessages: Subject<WsResponse> = new Subject<WsResponse>();
  public wsMessages$: Observable<WsResponse> = this.wsMessages.asObservable();
  connectionEstablished$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    super();
    this.connect();
    this.getConnectionStatus().subscribe((isConnected) => {
      console.log(isConnected);
      if (!isConnected) {
        this.reconnect();
      }
    });
  }

  connect(): void {
    this.socket = webSocket(this.websocketConf);
    this.socket.subscribe(
      (ws: WsResponse) => {
        this.wsMessages.next(ws);
      },
      (error: Event) => {
        if (!this.socket) {
          this.reconnect();
        }
      }
    );
    this.socket.next({event: 'ws'});
  }

  reconnect(): void {
    this.reconnection$ = interval(this.reconnectInterval).pipe(takeWhile((v, index) => {
      return index < this.reconnectAttempts && !this.socket;
    }));
    this.reconnection$.subscribe({
      next: () => {
        this.connect();
      },
      complete: () => {
        this.reconnection$ = null;
        if (!this.socket) {
          this.complete();
          this.socket.complete();
        }
      }
    });
  }

  private getConnectionStatus(): Observable<boolean> {
    return this.connectionEstablished$.asObservable();
  }


}

