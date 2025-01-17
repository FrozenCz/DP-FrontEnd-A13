import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetDetailDialogComponent } from './components/asset-detail-dialog/asset-detail-dialog.component';
import {FlexModule} from '@angular/flex-layout';
import {
  NbActionsModule, NbAutocompleteModule, NbBadgeModule,
  NbButtonModule,
  NbCardModule,
  NbDatepickerModule,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule, NbListModule,
  NbSelectModule, NbSpinnerModule, NbTabsetModule, NbTooltipModule, NbWindowModule, NbWindowRef
} from '@nebular/theme';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AssetsComponent } from './assets.component';
import {AssetsRoutingModule} from './assets-routing.module';
import {NbDateFnsDateModule} from '@nebular/date-fns';
import { cs } from 'date-fns/locale';
import { AssetsListComponent } from './components/assets-list/assets-list.component';
import {AgGridModule} from 'ag-grid-angular';
import { QuickFilterComponent } from './components/quick-filter/quick-filter.component';
import { ActionButtonsForAgGridComponent } from '../utils/agGrid/action-buttons-for-ag-grid/action-buttons-for-ag-grid.component';
import {AssetsGridComponent} from './utils/assets-grid/assets-grid.component';
import {SharedModule} from '../utils/shared.module';
import { MultiEditAssetDialogComponent } from './components/multi-edit-asset-dialog/multi-edit-asset-dialog.component';
import { RemoveAssetDialogComponent } from './components/remove-asset-dialog/remove-asset-dialog.component';
import { RemovedAssetsListComponent } from './components/removed-assets-list/removed-assets-list.component';
import {HistoryModule} from '../history/history.module';
import { AssetDetailComponent } from './components/asset-detail/asset-detail.component';
import { AssetDetailSinglePageWrapperComponent } from './components/asset-detail-single-page-wrapper/asset-detail-single-page-wrapper.component';
import { AssetsDashboardComponent } from './dashboards/assets-dashboard/assets-dashboard.component';
import {LocationsModule} from '../locations/locations.module';
import {ImageCropperModule} from 'ngx-image-cropper';
import {Facade} from '../facade/facade';
import {TransferDataProvider} from './components/abstract/transferDataProvider';
import { AssetTransfersListComponent } from './components/asset-transfers-list/asset-transfers-list.component';
import {AssetTransferComponent} from './components/asset-transfer/asset-transfer.component';
import { AssetTransferDetailComponent } from './components/asset-transfer-detail/asset-transfer-detail.component';
import { StockTakingListComponent } from './components/stock-taking-list/stock-taking-list.component';
import { StockTakingDetailComponent } from './components/stock-taking-detail/stock-taking-detail.component';
import { StockTakingNewComponent } from './components/stock-taking-new/stock-taking-new.component';
import {StockTakingListProvider} from './components/stock-taking-list/stockTakingListProvider';
import {StockTakingDetailProvider} from './components/stock-taking-detail/stockTakingDetail.provider';

@NgModule({
  declarations: [AssetsComponent, AssetDetailDialogComponent, AssetsListComponent, QuickFilterComponent, ActionButtonsForAgGridComponent,
    AssetTransfersListComponent, AssetTransferComponent,
    AssetsGridComponent, MultiEditAssetDialogComponent, RemoveAssetDialogComponent, RemovedAssetsListComponent, AssetDetailComponent, AssetDetailSinglePageWrapperComponent, AssetsDashboardComponent, AssetTransfersListComponent, AssetTransferDetailComponent, StockTakingListComponent, StockTakingDetailComponent, StockTakingNewComponent],
  imports: [
    AssetsRoutingModule,
    CommonModule,
    FlexModule,
    NbFormFieldModule,
    NbInputModule,
    NbCardModule,
    ReactiveFormsModule,
    NbSelectModule,
    NbDatepickerModule.forRoot(),
    NbDatepickerModule,
    NbDateFnsDateModule.forChild({
      parseOptions: {locale: cs},
      formatOptions: {locale: cs},
    }),
    NbButtonModule,
    NbIconModule,
    NbWindowModule.forChild(),
    AgGridModule,
    SharedModule,
    FormsModule,
    NbTooltipModule,
    NbTabsetModule,
    NbActionsModule,
    NbListModule,
    NbBadgeModule,
    NbSpinnerModule,
    HistoryModule,
    LocationsModule,
    NbAutocompleteModule,
    ImageCropperModule,
  ],
  providers: [
    {provide: TransferDataProvider, useExisting: Facade},
    {provide: StockTakingListProvider, useExisting: Facade},
    {provide: StockTakingDetailProvider, useExisting: Facade},
  ],
    exports: [
        AssetsListComponent,
        QuickFilterComponent,
        AssetsGridComponent,
        AssetDetailComponent,
    ]
})
export class AssetsModule { }
