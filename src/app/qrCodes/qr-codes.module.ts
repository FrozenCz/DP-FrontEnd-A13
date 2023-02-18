import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {QrCodesComponent} from './components/qr-codes/qr-codes.component';


@NgModule({
  declarations: [QrCodesComponent],
  imports: [CommonModule],
  exports: [QrCodesComponent]
})
export class QrCodesModule {


}
