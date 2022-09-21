import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Location} from '../../model/location';
import {ColDef, GetDataPath, GridApi, GridOptions, SelectionChangedEvent} from 'ag-grid-community';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit, OnChanges {
  @Input() locations: Location[] = [];
  @Output() selectedLocation: EventEmitter<Location> = new EventEmitter<Location>();
  treeData = true;
  gridApi: GridApi | undefined = undefined;

  colDefs: ColDef[] = [
  ];
  getDataPath: GetDataPath = (data: Location) => {
    return data.treePath;
  }
  gridOptions: GridOptions = {
    groupDefaultExpanded: -1,
    getRowId: (data) => data.data.uuid,
    rowSelection: 'single'
  };
  autoGroupColumnDef = {
    // cellRenderer: (params: any) => {
    //   return params.data.name
    // },
    headerName: "My Group",
    width: 300,
    cellRendererParams: {
      suppressCount: true,
      innerRenderer: (params: any) => params.data.name
    }
  };


  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void { }

  onSelectionChanged(params: SelectionChangedEvent) {
    const data = params.api.getSelectedNodes()[0];
    if (data.isSelected()) {
      this.selectedLocation.emit(data.data);
      this.router.navigate(['locations', data.data.uuid]);
    } else {
      this.router.navigate(['locations', 'all']);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.gridApi?.redrawRows()
  }

}
