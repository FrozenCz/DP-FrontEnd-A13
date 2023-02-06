import {NgModule} from '@angular/core';
import {AssetTransferComponent} from './components/asset-transfer/asset-transfer.component';
import {TransferRoutingModule} from './transfer-routing.module';
import {CommonModule} from '@angular/common';
import {AssetService} from './components/abstract/asset.service';
import {FlexModule} from '@angular/flex-layout';
import {AssetsModule} from '../assets/assets.module';
import {Facade} from '../facade/facade';


@NgModule({
  declarations: [
    AssetTransferComponent
  ],
  imports: [
    CommonModule,
    TransferRoutingModule,
    FlexModule,
    AssetsModule
  ],
  providers: [
    {provide: AssetService, useExisting: Facade}
  ]
})
export class TransferModule {

}
