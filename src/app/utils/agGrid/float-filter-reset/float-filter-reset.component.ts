import { Component, OnInit } from '@angular/core';
import {IFloatingFilterAngularComp} from 'ag-grid-angular';
import {FilterChangedEvent, GridApi, IAfterGuiAttachedParams, IFloatingFilterParams} from 'ag-grid-community';

@Component({
  selector: 'app-float-filter-reset',
  templateUrl: './float-filter-reset.component.html',
  styleUrls: ['./float-filter-reset.component.scss']
})
export class FloatFilterResetComponent implements OnInit, IFloatingFilterAngularComp {
  filterActive = false;
  gridApi!: GridApi;

  constructor() { }

  ngOnInit(): void {
  }

  afterGuiAttached(params?: IAfterGuiAttachedParams): void {
  }

  agInit(params: IFloatingFilterParams): void {
    this.gridApi = params.api;

    this.gridApi.addEventListener('filterChanged', () => {
      this.filterActive = !!Object.keys(this.gridApi.getFilterModel()).length;
    });
  }

  onParentModelChanged(parentModel: any, filterChangedEvent?: FilterChangedEvent): void {
  }


  clearFilters(): void {
    this.gridApi.setFilterModel(null);
  }
}
