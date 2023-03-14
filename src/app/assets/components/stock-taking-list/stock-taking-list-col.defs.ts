import {ColDef} from 'ag-grid-community';
import {AgGridFuncs, DateTimeFormatterType} from '../../../utils/agGrid/ag-grid.funcs';

export const stockTakingListColDefs: ColDef[] = [
  {field: 'name', headerName: 'Název'},
  {field: 'authorName', headerName: 'Vytvořil'},
  {field: 'solverName', headerName: 'Řeší'},
  {
    field: 'createAt',
    headerName: 'Vytvořena',
    valueFormatter: (params) => params.value ? AgGridFuncs.dateTimeFormatter(params.value, DateTimeFormatterType.WITH_HOURS) : ''
  },
  {
    field: 'lastUpdateAt',
    headerName: 'Poslední update',
    valueFormatter: (params) => params.value ? AgGridFuncs.dateTimeFormatter(params.value, DateTimeFormatterType.WITH_HOURS) : ''
  },
  {field: 'items', headerName: 'Počet položek'},
  {field: 'foundPercentage', headerName: 'Nalezeno'},
  {
    field: 'closedAt',
    headerName: 'Ukončena',
    valueFormatter: (params) => params.value ? AgGridFuncs.dateTimeFormatter(params.value, DateTimeFormatterType.WITH_HOURS) : ''
  },
]
