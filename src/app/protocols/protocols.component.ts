import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AssetsService, IAssetsExt} from '../assets/assets.service';
import {ProtocolEmitEnum} from './protocols.service';
import {takeUntil, tap} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Barcode} from '../qrCodes/components/qr-codes/qrCode.model';


@Component({
  selector: 'app-protocols-component',
  templateUrl: './protocols.component.html',
  styleUrls: ['./protocols.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProtocolsComponent implements OnInit, OnDestroy {
  public protocolType: ProtocolEmitEnum;
  public protocolTypes = ProtocolEmitEnum;
  public source: IAssetsExt[] = [];
  public qrCodes: Barcode[] = [];
  private unsubscribe = new Subject();


  constructor(private route: ActivatedRoute, private assetsService: AssetsService) {
    this.protocolType = +route.snapshot.params['protocolType'];
  }

  ngOnInit(): void {
    switch (this.protocolType) {
      case ProtocolEmitEnum.TRANSFER_PROTOCOL:
        const jsonsource = localStorage.getItem('protocolList');
        if (jsonsource) {
          this.source = JSON.parse(jsonsource);
        }
        break;
      case ProtocolEmitEnum.DELETE_LIST:
        break;
      case ProtocolEmitEnum.USERS_ASSETS_PROTOCOL:
        const userId = +this.route.snapshot.params['userId'];
        if (userId) {
          this.assetsService.getAssets({userId}).pipe(takeUntil(this.unsubscribe)).pipe(tap(console.log))
            .subscribe(assets => this.source = assets);
        }
        break;
      case ProtocolEmitEnum.QR_CODES:
        break;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
  }


}
