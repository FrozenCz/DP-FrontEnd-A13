import {Injectable} from '@angular/core';
import {AssetsWs} from '../assets/models/assets.ws.model';
import {webSocketUrl} from '../../environments/environment';
import {AssetsModelDto} from '../assets/models/assets.model';
import {CategoriesWs} from '../categories/models/categories.ws.model';
import {UsersWs} from '../users/model/users.ws.model';
import {ICategoryGet} from '../categories/models/category.model';
import {AssetsService} from '../assets/assets.service';
import {CategoriesService} from '../categories/categories.service';
import {UsersService} from '../users/users.service';
import {NbToastrService} from '@nebular/theme';
import {UserDto} from '../users/dto/user.dto';
import {io} from "socket.io-client";
import {LocationWs} from '../locations/model/location.ws';
import {LocationService} from '../locations/location.service';
import {LocationDto} from '../locations/dto/in/location.dto';
import {Transforms} from '../utils/Transforms';
import {firstValueFrom} from 'rxjs';


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

export interface LocationUpdate {
  changes: LocationDto,
  type: LocationWs.locationUpdate
}
export interface LocationDelete {
  changes: null,
  type: LocationWs.locationDelete
}

export interface WsResponse {
  event: string; // 'ws'
  data: AssetsUpdate | CategoryUpdate | CategoryDelete | UsersUpdate | UsersDelete | LocationUpdate | LocationDelete;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  socket = io(webSocketUrl);

  constructor(
    private assetsService: AssetsService,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
    private locationService: LocationService,
    private toastrService: NbToastrService
  ) {

    this.socket.on('changes', async (response: WsResponse) => {
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
        case LocationWs.locationUpdate:
          const locMap = await firstValueFrom(this.locationService.locationStore.getMap$());
          const loc = Transforms.getLocationFromDto(response.data.changes, locMap);
          this.locationService.locationStore.update(loc).catch(err => {
            alert('došlo k chybě v updatu lokace')
          });
          break;
        case LocationWs.locationDelete:
          this.locationService.reFetchLocations();
          break;
        default:
          alert('Neni definovana metoda pro ws ' + response.event);
      }

    })
  }
}
