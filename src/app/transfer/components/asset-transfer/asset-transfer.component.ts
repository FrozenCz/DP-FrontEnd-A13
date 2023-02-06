import {Component, OnInit} from '@angular/core';
import {TransferService} from '../transfer.service';
import {combineLatest, firstValueFrom, Observable} from 'rxjs';
import {IAssetsExt} from '../../../assets/assets.service';
import {Caretaker} from '../../../users/model/caretaker.model';
import {map} from 'rxjs/operators';
import {NbToastrService} from '@nebular/theme';

@Component({
  selector: 'app-asset-transfer',
  templateUrl: './asset-transfer.component.html',
  styleUrls: ['./asset-transfer.component.scss']
})
export class AssetTransferComponent implements OnInit {
  assets$: Observable<IAssetsExt[]>
  caretakers$: Observable<Caretaker[]>
  caretaker$: Observable<Caretaker>
  toCaretaker: Caretaker | null = null;

  constructor(private transferService: TransferService, private toasterService: NbToastrService) {
    this.assets$ = transferService.getAssetsForTransfer$();
    this.caretaker$ = transferService.getCaretaker$();
    this.caretakers$ = combineLatest([transferService.getCaretakers$(), this.caretaker$]).pipe(map(([caretakers, currentUser]) => caretakers.filter(c => c.id !== currentUser.id)));
  }

  ngOnInit(): void {
  }


  sendRequestForTransfer(fromUser: number, toUser: number, assets: IAssetsExt[], message: string) {
    firstValueFrom(this.transferService.sendRequestForAssetTransfer(fromUser, toUser, assets.map(a => a.id), message)).then(() => {
      this.toasterService.success('povedlo se')
    }, reason => {
      console.log(reason);
      this.toasterService.danger('error');
    })
  }
}
