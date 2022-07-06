import { Component } from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {UsersService} from '../../users.service';

@Component({
  selector: 'app-select-unit-cell-renderer',
  templateUrl: './select-unit-cell-renderer.component.html',
  styleUrls: ['./select-unit-cell-renderer.component.scss']
})
export class SelectUnitCellRendererComponent implements ICellRendererAngularComp {
  private params: any;
  editMode = false;

  selected: any;
  selectionOpen = false;

  constructor(private usersService: UsersService) {
    this.usersService.editMode$.subscribe((editMode) => {
      this.editMode = editMode;
    });
  }

  agInit(params: any): void {
    this.selected = params.value;
  }

  refresh(params: any): boolean {
    this.params = params;
    this.selected = params.value;
    this.selectionOpen = false;
    return true;
  }


}
