import {Component, OnInit} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {IAfterGuiAttachedParams, ICellRendererParams} from 'ag-grid-community';
import {AssetsService, IAssetsExt} from '../../../assets/assets.service';



@Component({
  selector: 'app-action-buttons-for-ag-grid',
  templateUrl: './action-buttons-for-ag-grid.component.html',
  styleUrls: ['./action-buttons-for-ag-grid.component.scss']
})
export class ActionButtonsForAgGridComponent implements ICellRendererAngularComp {
  params!: ICellRendererParams;
  multiRowSelection = false;

  constructor(private assetsService: AssetsService) {
  }


  afterGuiAttached(params?: IAfterGuiAttachedParams): void {
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.multiRowSelection = !!this.params.node.allLeafChildren;
  }

  refresh(params: any): boolean {
    return false;
  }

  onArrayListClicked(assetModelExt: IAssetsExt | undefined): void {
    // this is single click selection
    if (assetModelExt) {
      const rowNode = this.params.node;
      this.selectNodes(assetModelExt);
      this.params.api.redrawRows({rowNodes: [rowNode]});
    } else {
      // multiple line selection
      if (this.params && this.params.node && this.params.node.allChildrenCount && this.params.node.allChildrenCount > 0) {
        this.params.node.allLeafChildren.forEach((rowNode) => {
          this.selectNodes(rowNode.data, true);
        });
        this.params.api.redrawRows({rowNodes: this.params.node.allLeafChildren});
      }
    }
  }

  private selectNodes(assetModelExt: IAssetsExt, removeIfIsPresent: boolean = true): void {
    if (this.assetsService.isInWorkingList(assetModelExt.asset.id)) {
      if (removeIfIsPresent) { this.assetsService.removeFromAssetsWorkingList(assetModelExt.asset.id); }
    } else {
      this.assetsService.addAssetIdToWorkingList(assetModelExt.asset.id);
    }
  }

}
