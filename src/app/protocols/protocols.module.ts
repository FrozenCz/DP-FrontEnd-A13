import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectAssetsProtocolDialogComponent } from './components/select-assets-protocol-dialog/select-assets-protocol-dialog.component';
import {NbButtonModule, NbCardModule, NbIconModule} from '@nebular/theme';
import {FlexModule} from '@angular/flex-layout';
import {ProtocolsRoutingModule} from './protocols-routing.module';
import {ProtocolsComponent} from './protocols.component';
import { TransferProtocolComponent } from './components/transfer-protocol/transfer-protocol.component';
import { RemovingProtocolsListComponent } from './components/removing-protocols-list/removing-protocols-list.component';
import { UsersAssetsProtocolComponent } from './components/users-assets-protocol/users-assets-protocol.component';
import { QrCodesComponent } from './components/qr-codes/qr-codes.component';



@NgModule({
  declarations: [SelectAssetsProtocolDialogComponent, ProtocolsComponent, TransferProtocolComponent, RemovingProtocolsListComponent, UsersAssetsProtocolComponent, QrCodesComponent],
  imports: [
    ProtocolsRoutingModule,
    CommonModule,
    NbCardModule,
    NbIconModule,
    FlexModule,
    NbButtonModule
  ]
})
export class ProtocolsModule { }
