import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {QrCodesComponent} from './components/qr-codes/qr-codes.component';
import {QRCodeModule} from 'angularx-qrcode';


@NgModule({
  declarations: [QrCodesComponent],
    imports: [CommonModule, QRCodeModule],
  exports: [QrCodesComponent]
})
export class QrCodesModule {


}
