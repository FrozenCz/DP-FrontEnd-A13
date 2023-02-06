import { Component, OnInit } from '@angular/core';
import {TransferService} from '../transfer.service';
import {Observable} from 'rxjs';
import {IAssetsExt} from '../../../assets/assets.service';

@Component({
  selector: 'app-asset-transfer',
  templateUrl: './asset-transfer.component.html',
  styleUrls: ['./asset-transfer.component.scss']
})
export class AssetTransferComponent implements OnInit {
  assets$: Observable<IAssetsExt[]>

  constructor(private transferService: TransferService) {
    this.assets$ = transferService.getAssetsForTransfer$();
  }

  ngOnInit(): void {
  }



}
