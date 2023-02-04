import {Component, Input} from '@angular/core';
import {IAssetsExt} from '../../../assets/assets.service';



@Component({
  selector: 'app-transfer-protocol',
  templateUrl: './transfer-protocol.component.html',
  styleUrls: ['./transfer-protocol.component.scss']
})
export class TransferProtocolComponent {

  @Input()data: IAssetsExt[] = [];
  todayDate = new Date().toLocaleDateString();

  printDocument() {
    const el = document.getElementById('protocolPrint');
  }
}
