import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AssetsComponent} from './assets.component';
import {
  AssetDetailSinglePageWrapperComponent
} from './components/asset-detail-single-page-wrapper/asset-detail-single-page-wrapper.component';
import {AssetsDashboardComponent} from './dashboards/assets-dashboard/assets-dashboard.component';
import {AssetTransferComponent} from './components/asset-transfer/asset-transfer.component';
import {AssetTransfersListComponent} from './components/asset-transfers-list/asset-transfers-list.component';
import {AssetTransferDetailComponent} from './components/asset-transfer-detail/asset-transfer-detail.component';
import {StockTakingNewComponent} from './components/stock-taking-new/stock-taking-new.component';
import {StockTakingDetailComponent} from './components/stock-taking-detail/stock-taking-detail.component';
import {StockTakingListComponent} from './components/stock-taking-list/stock-taking-list.component';

const routes: Routes = [
  {
    path: '', component: AssetsComponent, children: [
      {path: '', component: AssetsDashboardComponent},
      {path: 'detail/:id', component: AssetDetailSinglePageWrapperComponent}
    ]
  },
  {path: 'transfers', component: AssetTransfersListComponent},
  {path: 'transfers/request', component: AssetTransferComponent},
  {path: 'transfers/:uuid', component: AssetTransferDetailComponent},

  {path: 'stock-taking/new', component: StockTakingNewComponent},
  {path: 'stock-taking/list', component: StockTakingListComponent},
  {path: 'stock-taking/:uuid', component: StockTakingDetailComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AssetsRoutingModule {
}
