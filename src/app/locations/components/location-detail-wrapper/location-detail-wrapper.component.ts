import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '../../model/location';
import {combineLatest, Observable, of, startWith, switchMap, tap} from 'rxjs';
import {LocationService} from '../../location.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-location-detail-wrapper',
  templateUrl: './location-detail-wrapper.component.html',
  styleUrls: ['./location-detail-wrapper.component.scss']
})
export class LocationDetailWrapperComponent implements OnInit {
  @Input() uuid: string | undefined;
  location$!: Observable<Location>;
  locations$!: Observable<Location[]>;
  newLoc: Location = new Location();

  constructor(private route: ActivatedRoute, private locationService: LocationService) { }

  ngOnInit(): void {
    this.location$ = this.route.paramMap.pipe(switchMap(paramsMap => {
      this.uuid = paramsMap.get('uuid') ?? undefined;
      if(this.uuid === 'all') this.uuid = undefined;
      if (this.uuid) {
        return this.locationService.locationStore.getOne$(this.uuid).pipe(tap(location => {
          this.newLoc = new Location(null,'', location)
        }));
      } else {
        return of(new Location());
      }
    }))

    this.locations$ = combineLatest([this.location$, this.locationService.locationStore.getMap$().pipe(startWith(new Map()))])
      .pipe(map(([location, locationsMap]) => {
        locationsMap.delete(location);
        return Array.from(locationsMap.values());
      }))
  }

  onSaveEmit($event: Location): void {
    this.locationService.saveLocation($event);
  }
}
