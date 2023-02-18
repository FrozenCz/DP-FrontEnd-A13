import {Component, Input} from '@angular/core';
import {IAssetsExt} from '../../../assets/assets.service';

@Component({
  selector: 'app-qr-codes',
  templateUrl: './qr-codes.component.html',
  styleUrls: ['./qr-codes.component.scss']
})
export class QrCodesComponent {
  @Input() data: IAssetsExt[] = [];

  constructor() { }


}
