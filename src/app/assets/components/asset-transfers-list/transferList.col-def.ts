import {ColDef} from 'ag-grid-community';

export const transferListColDef: ColDef[] = [
  {field: 'uuid', headerName: 'Identifikátor'},
  {field: 'caretakerFrom.fullname', headerName: 'Převod od'},
  {field: 'caretakerFrom.unit_id', headerName: 'Převod od'},
  {field: 'caretakerTo.fullname', headerName: 'Převod na'},
  {field: 'caretakerTo.unit_id', headerName: 'Převod na'},
  {field: 'assets.inventory_numbers', headerName: 'Inv. č. majetku'},
  {field: 'createdAt', headerName: 'Žádán'},
  {field: 'acceptedAt', headerName: 'Potvrzen'},
  {field: 'rejectedAt', headerName: 'Zamítnut'},
  {field: 'revertedAt', headerName: 'Stažen'},

]
