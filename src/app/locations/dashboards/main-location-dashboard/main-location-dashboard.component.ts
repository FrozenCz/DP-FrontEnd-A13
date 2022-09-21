import { Component, OnInit } from '@angular/core';
import {LocationService} from '../../location.service';
import {Observable, tap} from 'rxjs';
import {Location} from '../../model/location';

@Component({
  selector: 'app-main-location-dashboard',
  templateUrl: './main-location-dashboard.component.html',
  styleUrls: ['./main-location-dashboard.component.scss']
})
export class MainLocationDashboardComponent implements OnInit {
  locations$: Observable<Location[]>;
  selectedLocation: Location | undefined = undefined;

  constructor(private locationService: LocationService) {
    this.locations$ = this.locationService.locationStore.getAll$().pipe(tap(console.log));
  }

  ngOnInit(): void {
  }

}
