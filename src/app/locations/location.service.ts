import {Injectable} from '@angular/core';
import {Store} from '../store/store';
import {Location} from './model/location';
import {firstValueFrom, noop, Observable} from 'rxjs';
import {CreateLocationDto} from './dto/out/createLocation.dto';
import {HttpClient} from '@angular/common/http';
import {restIp} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {LocationDto} from './dto/in/location.dto';
import {Transforms} from '../utils/Transforms';


@Injectable({
  providedIn: 'root'
})
export class LocationService {
  locationStore: Store<Location> = new Store<Location>();

  constructor(private httpClient: HttpClient) {
    // fake fetch... need first emit
    firstValueFrom(this.fetchLocations()).then(locations => {
      this.locationStore.putData(locations);
    });
  }

  /**
   * projit pole, kde kdyz je rodic, tak pridej odkaz na nej
   * jedná se o stromovou strukturu, ale z backendu si ji nechavam vracet jen jako pole,
   * kde je uveden rodic, pokud existuje
   * @private
   */
  private fetchLocations(): Observable<Location[]> {
    return this.httpClient.get<LocationDto[]>(restIp + '/locations')
      .pipe(
        map(locations => {
          const locMap: Map<string, Location> = new Map<string, Location>();
          for (const loc of locations) {
            locMap.set(loc.uuid, Transforms.getLocationFromDto(loc, locMap))
          }
          return locMap;
        }),
        map(locMap => {
          return Array.from(locMap.values())
        })
      );
  }


  saveLocation(location: Location): Observable<void> {
    let nLoc;
    if (!location.uuid) {
      return this.createLocation({name: location.name, parent: location.parent?.uuid ?? null});
    } else {
      nLoc = location;
    }

    this.locationStore.update(nLoc).then(noop);
    return this.httpClient.patch<void>(restIp + '/locations/' + location.uuid, {name: location.name});
  }

  private createLocation(createLocation: CreateLocationDto): Observable<void> {
    return this.httpClient.post<void>(restIp + '/locations', {
      name: createLocation.name,
      parent: createLocation.parent
    });
  }


  removeLocation(locationForDelete: Location): Observable<void> {
    return this.httpClient.delete<void>(restIp + '/locations/' + locationForDelete.uuid)
  }

  reFetchLocations(): void {
    firstValueFrom(this.fetchLocations()).then(locations => this.locationStore.putData(locations))
  }
}
