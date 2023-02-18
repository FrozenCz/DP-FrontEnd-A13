import {Component} from '@angular/core';
import {Barcode} from './qrCode.model';
import {Observable} from 'rxjs';
import {QrService} from '../../qr.service';

@Component({
  selector: 'app-qr-codes',
  templateUrl: './qr-codes.component.html',
  styleUrls: ['./qr-codes.component.scss']
})
export class QrCodesComponent {
  barcodes$: Observable<Map<number, Barcode>>

  constructor(private qrService: QrService) {
    this.barcodes$ = qrService.getBarcodes$();
  }

}
