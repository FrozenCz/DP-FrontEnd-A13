import {NgModule} from '@angular/core';
import {AssetTransferComponent} from './components/asset-transfer/asset-transfer.component';
import {TransferRoutingModule} from './transfer-routing.module';
import {CommonModule} from '@angular/common';
import {TransferDataProvider} from './components/abstract/transferDataProvider';
import {FlexModule} from '@angular/flex-layout';
import {AssetsModule} from '../assets/assets.module';
import {Facade} from '../facade/facade';
import {NbButtonModule, NbInputModule, NbSelectModule} from '@nebular/theme';
import {SharedModule} from '../utils/shared.module';
import {FormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    AssetTransferComponent
  ],
  imports: [
    CommonModule,
    TransferRoutingModule,
    FlexModule,
    AssetsModule,
    NbSelectModule,
    NbInputModule,
    NbButtonModule,
    SharedModule,
    FormsModule
  ],
  providers: [
    {provide: TransferDataProvider, useExisting: Facade}
  ]
})
export class TransferModule {

}
