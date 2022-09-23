import {Component, OnInit} from '@angular/core';
import {LocationService} from '../../location.service';
import {Observable, tap} from 'rxjs';
import {Location} from '../../model/location';
import {trigger} from '@angular/animations';
import {showHideDialog} from '../../../utils/animations';

@Component({
  selector: 'app-main-location-dashboard',
  templateUrl: './main-location-dashboard.component.html',
  styleUrls: ['./main-location-dashboard.component.scss'],
  animations: [
    trigger('comeToScene', showHideDialog),
  ]
})
export class MainLocationDashboardComponent implements OnInit {
  locations$: Observable<Location[]>;
  selectedLocation: Location | undefined = undefined;
  locationForDelete: Location | null = null;
  deletePerformed: boolean = false;

  constructor(private locationService: LocationService) {
    this.locations$ = this.locationService.locationStore.getAll$().pipe(tap(console.log));
  }

  ngOnInit(): void {
  }

  onDeletePressed($event: Location): void {
    this.locationForDelete = $event;
  }

  deleteConfirmed(locationForDelete: Location): void {
    this.deletePerformed = true;
    this.locationService.removeLocation(locationForDelete).subscribe({
      next: () => {

      },
      error: () => {
        this.deletePerformed = false;
      },
      complete: () => {
        this.locationForDelete = null;
        this.deletePerformed = false;
      }
    })
  }
}
