import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AssetTransferComponent} from './components/asset-transfer/asset-transfer.component';

const routes: Routes = [
  {path: 'asset', component: AssetTransferComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransferRoutingModule {

}
