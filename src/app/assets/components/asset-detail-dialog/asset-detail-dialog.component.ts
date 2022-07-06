import {Component, Input} from '@angular/core';
import {Observable} from 'rxjs';
import {NbWindowRef} from '@nebular/theme';
import {ICategory} from '../asset-detail/asset-detail.component';

@Component({
  selector: 'app-create-assets-dialog',
  templateUrl: './asset-detail-dialog.component.html',
  styleUrls: ['./asset-detail-dialog.component.scss']
})

export class AssetDetailDialogComponent {
  @Input() selectedCategory!: ICategory;
  @Input() assetId!: number;

  constructor(private nbWindowRef: NbWindowRef) {
  }

  dismiss(): void {
    this.nbWindowRef.close();
  }
}
