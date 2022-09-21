import {Injectable} from '@angular/core';
import {Store} from '../store/store';
import {Location} from './model/location';
import {noop, Observable, of} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LocationService {
  locationStore: Store<Location> = new Store<Location>();

  constructor() {
    // fake fetch... need first emit
    this.locationStore.putData([]);
  }




  saveLocation(location: Location): Observable<void> {
    let nLoc;
    if(!location.uuid) {
      nLoc = new Location((Math.random() * 1000000).toString(), location.name, location.parent);
    } else {
      nLoc = location;
    }
    this.locationStore.update(nLoc).then(noop);
    return of();
  }


}
