import {ColDef} from 'ag-grid-community';

export const DefaultColDef: ColDef = {
  floatingFilter: true,
  filter: 'agTextColumnFilter',
}

export const ColDefs: ColDef[] = [
  {field: 'assetName', headerName: 'Název'},
  {field: 'serialNumber', headerName: 'Seriové číslo'},
  {field: 'foundAt', headerName: 'Nalezeno'},
  {field: 'assetName'},
];
