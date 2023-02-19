import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {QrCodeAdapter} from './qrCode.adapter';
import {Barcode} from './qrCode.model';

@Component({
  selector: 'app-qr-codes',
  templateUrl: './qr-codes.component.html',
  styleUrls: ['./qr-codes.component.scss']
})
export class QrCodesComponent {
  barcodes$: Observable<Barcode[]>

  constructor(private qrService: QrCodeAdapter) {
    this.barcodes$ = qrService.getBarcodes$();
  }

  codeShowingJSOn(barcode: Barcode): string {
    return JSON.stringify({id: barcode.id});
  }

}
