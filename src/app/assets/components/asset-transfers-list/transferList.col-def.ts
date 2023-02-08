import {ColDef} from 'ag-grid-community';
import {AgGridFuncs, DateTimeFormatterType} from '../../../utils/agGrid/ag-grid.funcs';

export const transferListColDef: ColDef[] = [
  {field: 'uuid', headerName: 'Identifikátor'},
  {field: 'caretakerFrom', headerName: 'Převod od'},
  {field: 'fromUnit', headerName: 'Převod od'},
  {field: 'caretakerTo', headerName: 'Převod na'},
  {field: 'toUnit', headerName: 'Převod na'},
  {field: 'assets_names', headerName: 'Název majetku', valueFormatter: params => params.value.join(', ')},
  {field: 'assets_ic', headerName: 'Inv. č. majetku', valueFormatter: params => params.value.join(', ')},
  {
    field: 'createdAt',
    headerName: 'Žádán',
    valueFormatter: (params) => params.value ? AgGridFuncs.dateTimeFormatter(params.value, DateTimeFormatterType.WITH_HOURS): null
  },
  {
    field: 'acceptedAt',
    headerName: 'Potvrzen',
    valueFormatter: (params) => params.value ? AgGridFuncs.dateTimeFormatter(params.value, DateTimeFormatterType.WITH_HOURS): null
  },
  {
    field: 'rejectedAt',
    headerName: 'Zamítnut',
    valueFormatter: (params) => params.value ? AgGridFuncs.dateTimeFormatter(params.value, DateTimeFormatterType.WITH_HOURS): null
  },
  {
    field: 'revertedAt',
    headerName: 'Stažen',
    valueFormatter: (params) => params.value ? AgGridFuncs.dateTimeFormatter(params.value, DateTimeFormatterType.WITH_HOURS): null
  },
]

