import {Component, Input, OnInit} from '@angular/core';
import {Location} from '../../model/location';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit {
  @Input() locations: Map<string, Location> | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  getLocations(): Location[] {
    if (this.locations) {
      return Array.from(this.locations.values());
    } else {
      return [];
    }
  }
}
