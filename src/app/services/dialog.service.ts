import {Injectable} from '@angular/core';
import {CreateUnitDialogComponent} from '../units/components/create-unit-dialog/create-unit-dialog.component';
import {NbDialogService, NbWindowService, NbWindowState} from '@nebular/theme';
import {CreateCategoryDialogComponent} from '../categories/components/create-category-dialog/create-category-dialog.component';
import {CreateUserDialogComponent} from '../users/components/create-user-dialog/create-user-dialog.component';
import {DeleteSelectedUsersDialogComponent} from '../users/components/delete-selected-users-dialog/delete-selected-users-dialog.component';
import {EditCategoryColumnsDialogComponent} from '../categories/components/edit-category-columns-dialog/edit-category-columns-dialog.component';
import {AssetDetailDialogComponent} from '../assets/components/asset-detail-dialog/asset-detail-dialog.component';
import {Category} from '../categories/models/category.model';
import {Observable} from 'rxjs';
import {DeleteListDialogComponent} from '../lists/components/delete-list-dialog/delete-list-dialog.component';
import {ListDetailComponent} from '../lists/components/list-detail/list-detail.component';
import {AssetsSourceEnum} from '../assets/assets.service';
import {SelectAssetsProtocolDialogComponent} from '../protocols/components/select-assets-protocol-dialog/select-assets-protocol-dialog.component';
import {MultiEditAssetDialogComponent} from '../assets/components/multi-edit-asset-dialog/multi-edit-asset-dialog.component';
import {RemoveAssetDialogComponent} from '../assets/components/remove-asset-dialog/remove-asset-dialog.component';
import {RemovedAssetsListComponent} from '../assets/components/removed-assets-list/removed-assets-list.component';
import {RemovingProtocolsListComponent} from '../protocols/components/removing-protocols-list/removing-protocols-list.component';
import {ChooseFirstCategoryDialogComponent} from '../categories/components/choose-first-category-dialog/choose-first-category-dialog.component';
import {HistoryDetailComponent} from '../history/components/history-detail/history-detail.component';
import {HistoryModel} from '../history/models/history.model';
import {AssetSource} from '../facade/facade';


@Injectable({
  providedIn: 'root'
})

export class DialogService {


  constructor(private nbDialogService: NbDialogService,
              private nbWindowService: NbWindowService) {
  }

  showCreateUserDialog(): void {
    this.nbDialogService.open(CreateUserDialogComponent);
  }

  showDeleteSelectedUsersDialog(): void {
    this.nbDialogService.open(DeleteSelectedUsersDialogComponent);
  }

  showCreateUnitDialog(): void {
    this.nbDialogService.open(CreateUnitDialogComponent);
  }

  showCreateCategoryDialog(): void {
    this.nbDialogService.open(CreateCategoryDialogComponent);
  }

  showEditCategoryColumnsDialog(): void {
    this.nbWindowService.open(EditCategoryColumnsDialogComponent, {title: 'Editace názvů sloupců kategorií'});
  }

  showCreateAssetsDialog(category?: Category): void {
    this.nbWindowService.open(AssetDetailDialogComponent, {
      title: 'Vložení nového majetku', context: {
        selectedCategoryId: category?.id
      }
    });
  }

  showConfirmDeleteAssetsList(listId: number, listName: string): void {
    this.nbDialogService.open(DeleteListDialogComponent, {
      context: {
        listId
      }
    });
  }

  showList(listId: number, name: string): void {
    this.nbWindowService.open(ListDetailComponent, {
      title: name,
      context: {
        listId,
      },
      windowClass: 'listsWindow'
    });
  }

  showProtocolListSelectionDialog(source: AssetSource): void {
    this.nbDialogService.open(SelectAssetsProtocolDialogComponent, {context: {source}});
  }

  showMultiEditAssetDialog(source: AssetSource): void {
    this.nbDialogService.open(MultiEditAssetDialogComponent,
      {
        hasBackdrop: true,
        closeOnBackdropClick: false,
        context: {source},
        closeOnEsc: false,
      });
  }

  openAssetDetail(assetId: number): void {
    this.nbWindowService.open(AssetDetailDialogComponent, {
      context: {assetId},
      hasBackdrop: true,
      windowClass: 'assetsDetailDialog',
      initialState: NbWindowState.FULL_SCREEN,
      title: 'Majetek'
    }).onClose.subscribe(() => {
      const elements = document.getElementsByClassName('cdk-global-overlay-wrapper');
      elements.item(elements.length - 1)?.remove();
    });
  }

  showRemoveAssetClicked(source: AssetSource): void {
    this.nbDialogService.open(RemoveAssetDialogComponent,
      {
        closeOnBackdropClick: false,
        context: {source},
        closeOnEsc: false,
      });
  }

  showRemovedAssetsList(): void {
    this.nbWindowService.open(RemovedAssetsListComponent,
      {
        title: 'Vyřazený majetek',
        context: {},
      });
  }

  showRemovedProtocolsList(): void {
    this.nbWindowService.open(RemovingProtocolsListComponent, {
      title: 'Vyřazovací protokoly',
    });
  }

  youMustSelectCategoryFirst(): void {
    this.nbDialogService.open(ChooseFirstCategoryDialogComponent, {});
  }

  showHistoryDetail(history: HistoryModel): void {
    this.nbDialogService.open(HistoryDetailComponent, {context: {history}});
  }
}
