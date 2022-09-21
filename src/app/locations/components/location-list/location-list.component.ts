import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Location} from '../../model/location';
import {ColDef, RowSelectedEvent} from 'ag-grid-community';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit {
  @Input() locations: Map<string, Location> | null = null;
  @Output() selectedLocation: EventEmitter<Location> = new EventEmitter<Location>();

  colDefs: ColDef[] = [
    {colId: 'locName', field: 'name', headerName: 'Název lokace'}
  ];

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

  onRowSelected($event: RowSelectedEvent): void {
    if ($event.data.uuid) {
      this.selectedLocation.emit(this.locations?.get($event.data.uuid))
    }
  }
}
