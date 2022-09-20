import {Component, Input, OnInit} from '@angular/core';
import {NbDialogRef, NbToastrService} from '@nebular/theme';
import {ProtocolEmitEnum, ProtocolsService} from '../../protocols.service';
import {AssetSource} from '../../../facade/facade';

@Component({
  selector: 'app-select-assets-protocol-dialog',
  templateUrl: './select-assets-protocol-dialog.component.html',
  styleUrls: ['./select-assets-protocol-dialog.component.scss']
})
export class SelectAssetsProtocolDialogComponent implements OnInit {
  @Input() source?: AssetSource;

  constructor(private dialogRef: NbDialogRef<SelectAssetsProtocolDialogComponent>,
              private nbToastrService: NbToastrService,
              private protocolsService: ProtocolsService) { }

  ngOnInit(): void {
    if (!this.source) {
      this.nbToastrService.danger('Nepodařilo se získat typ zdroje, ze kterého se má protokol vytvořit', 'Výběr protokolu');
      this.dialogRef.close();
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  onPrepareTypeProtocol(protocolType: ProtocolEmitEnum): void {
    if (!this.source) {return}
    this.protocolsService.prepareProtocol({protocol: protocolType, source: this.source});
  }

}
