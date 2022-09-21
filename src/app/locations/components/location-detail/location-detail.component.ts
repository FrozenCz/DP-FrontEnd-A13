import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Location} from '../../model/location';

@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.scss']
})
export class LocationDetailComponent implements OnChanges {
  @Input() location!: Location;
  @Input() locations: Location[] = [];
  @Output() saveEmit: EventEmitter<Location> = new EventEmitter<Location>();
  private rootLevel: Location = new Location(null, 'Nejvyšší úroveň', undefined);

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.locations.unshift(this.rootLevel);
    if (!this.location.parent) {
      this.location.parent = this.rootLevel;
    }
  }

  save(location: Location): void {
    this.saveEmit.emit(location);
    this.location = new Location();
  }
}
