import {Component, Input} from '@angular/core';
import {ChangeType, HistoryService} from '../../history.service';
import {HistoryModel, SimpleUser} from '../../models/history.model';
import {AssetsModelDto} from '../../../assets/models/assets.model';
import {HumanReadableAssetsChange} from '../../models/history.humanReadable';
import {HistoryRelatedTo} from '../../models/history.enum';
import {User} from '../../../users/model/user.model';
import {NbWindowService, NbWindowState} from '@nebular/theme';
import {AssetDetailDialogComponent} from '../../../assets/components/asset-detail-dialog/asset-detail-dialog.component';
import {UsersService} from '../../../users/users.service';
import {firstValueFrom} from 'rxjs';

interface ChangeHumanReadableForm {
  propertyName: string;
  propertyValue: string;
}

@Component({
  selector: 'app-history-detail',
  templateUrl: './history-detail.component.html',
  styleUrls: ['./history-detail.component.scss']
})
export class HistoryDetailComponent {
  @Input() history!: HistoryModel;
  changeType: ChangeType;
  doneBy: SimpleUser;
  createdDate: string;
  changedFrom: ChangeHumanReadableForm[] = [];
  changedTo: ChangeHumanReadableForm[] = [];

  constructor(private nbWindowService: NbWindowService, private usersService: UsersService) {
    this.changeType = HistoryService.translateRelatedToEnum(this.history.relatedTo);
    this.doneBy = this.history.changedBy;
    this.createdDate = new Date(this.history.created).toLocaleDateString();
    firstValueFrom(this.usersService.usersStore$.getMap$()).then(usersMap => {
      this.changedFrom = HistoryDetailComponent.humanReadableChangesInArray(this.history.changedFrom, this.history.relatedTo, usersMap);
      this.changedTo = HistoryDetailComponent.humanReadableChangesInArray(this.history.changedTo, this.history.relatedTo, usersMap);
    })

  }
  static isAssetsModelDto(obj: any): obj is Partial<AssetsModelDto> {
    return 'id' in obj && 'serialNumber' in obj;
  }

  static humanReadableChangesInArray(changedFrom: Partial<AssetsModelDto> | Partial<User>, relatedTo: HistoryRelatedTo, usersMap: Map<number, User>): ChangeHumanReadableForm[] {
    if (!(changedFrom instanceof Object)) {
      return [];
    }
    const result: ChangeHumanReadableForm[] = [];
    switch (relatedTo) {
      case HistoryRelatedTo.assetsCreate:
      case HistoryRelatedTo.assetsChangeInformation:
      case HistoryRelatedTo.assetsRemoved:
        Object.keys(changedFrom).forEach((change) => {
          if (!HistoryDetailComponent.isAssetsModelDto(changedFrom)) {
            throw new Error('Unable to add user into assets change');
          }
          const changeAsKey = change as keyof typeof changedFrom;
          let propertyValue: any;
          propertyValue = changedFrom[changeAsKey];
          if (change === 'user') {
            // todo: až uvidím co jsem tim chtel delat
            // const user = usersMap.get(changedFrom.user_id);
            // propertyValue = changedFrom.user?.surname + ' ' + changedFrom.user?.name;
          } else if (change === 'category') {
            propertyValue = changedFrom.category?.name;
          }
          result.push({propertyName: HumanReadableAssetsChange[change as keyof typeof HumanReadableAssetsChange], propertyValue});
        });
        break;
      case HistoryRelatedTo.assetsUserChange:
        if (HistoryDetailComponent.isAssetsModelDto(changedFrom)) {
          throw new Error('Unable to add assets into user change');
        }
        result.push({propertyName: 'Uživatel', propertyValue: changedFrom['surname'] + ' ' + changedFrom['name']});
        break;
    }
    return result;
  }



  openDetail(): void {
    switch (this.history.relatedTo) {
      case HistoryRelatedTo.assetsCreate:
      case HistoryRelatedTo.assetsChangeInformation:
      case HistoryRelatedTo.assetsUserChange:
      case HistoryRelatedTo.assetsRemoved:
        if (!this.history.asset) {
          throw new Error('Havent got and asset');
        }
        this.nbWindowService.open(AssetDetailDialogComponent, {
          context: {assetId: this.history.asset.id},
          hasBackdrop: true,
          windowClass: 'assetsDetailDialog',
          initialState: NbWindowState.FULL_SCREEN,
          title: 'Majetek',
        }).onClose.subscribe(() => {
          const elements = document.getElementsByClassName('cdk-global-overlay-wrapper');
          if (!elements || elements.length < 1) {
            throw new Error('Elements missing');
          }
          const assetDetails = elements.item(elements.length - 1)?.remove();
        });
        break;
    }
  }
}
