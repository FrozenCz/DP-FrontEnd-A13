import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-section-working-list',
  templateUrl: './section-working-list.component.html',
  styleUrls: ['./section-working-list.component.scss']
})
export class SectionWorkingListComponent {
  @Output() showWorkingList: EventEmitter<undefined> = new EventEmitter<undefined>();
  @Output() onClearWorkingList: EventEmitter<undefined> = new EventEmitter<undefined>();
  @Input() itemsInWorkingList: number = 0;

  constructor() { }


  showWorkingListEmit(): void {
    this.showWorkingList.emit();
  }

  onClearWorkingListEmit(): void {
    this.onClearWorkingList.emit();
  }
}
