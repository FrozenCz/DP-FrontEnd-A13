import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  SelectAssetsProtocolDialogComponent
} from './components/select-assets-protocol-dialog/select-assets-protocol-dialog.component';
import {NbButtonModule, NbCardModule, NbIconModule} from '@nebular/theme';
import {FlexModule} from '@angular/flex-layout';
import {ProtocolsRoutingModule} from './protocols-routing.module';
import {ProtocolsComponent} from './protocols.component';
import {TransferProtocolComponent} from './components/transfer-protocol/transfer-protocol.component';
import {RemovingProtocolsListComponent} from './components/removing-protocols-list/removing-protocols-list.component';
import {UsersAssetsProtocolComponent} from './components/users-assets-protocol/users-assets-protocol.component';
import {QrCodesModule} from '../qrCodes/qr-codes.module';
import {QrCodeBridge} from '../qrCodes/components/qr-codes/qrCode.bridge';
import {ProtocolsService} from './protocols.service';


@NgModule({
  declarations: [SelectAssetsProtocolDialogComponent, ProtocolsComponent, TransferProtocolComponent, RemovingProtocolsListComponent, UsersAssetsProtocolComponent],
  imports: [
    ProtocolsRoutingModule,
    CommonModule,
    NbCardModule,
    NbIconModule,
    FlexModule,
    NbButtonModule,
    QrCodesModule
  ],
  providers: [
    {provide: QrCodeBridge, useExisting: ProtocolsService}
  ]
})
export class ProtocolsModule {
}
