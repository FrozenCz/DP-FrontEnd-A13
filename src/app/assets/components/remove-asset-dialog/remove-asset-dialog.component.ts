import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AssetsService, AssetsSourceEnum, IAssetsExt} from '../../assets.service';
import {NbComponentStatus, NbDialogRef, NbToastrService} from '@nebular/theme';
import {ColDef, GridOptions} from 'ag-grid-community';
import {BehaviorSubject, Subject} from 'rxjs';
import {IRemoveAssetsInformation} from '../../models/assets.model';
import {RightsTag} from '../../../shared/rights.list';
import {TokenService} from '../../../auth/token.service';
import {UsersService} from '../../../users/users.service';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormFuncs} from '../../../utils/form.funcs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-remove-asset-dialog',
  templateUrl: './remove-asset-dialog.component.html',
  styleUrls: ['./remove-asset-dialog.component.scss']
})
export class RemoveAssetDialogComponent implements OnInit, OnDestroy {
  @Input() source: AssetsSourceEnum = AssetsSourceEnum.GRID;
  gridUid = 'removeAssetForm';
  customColDefs: ColDef[] = [];
  customGridOptions: GridOptions = {};
  assetsList: IAssetsExt[] = [];
  unsubscribe = new Subject();
  removeAssetForm: FormGroup;
  today = new Date();
  removingDate = new Date(this.today);
  removingPeriod = 365 * 7;
  removing = false;


  constructor(
    private assetsService: AssetsService,
    private usersService: UsersService,
    private tokenService: TokenService,
    private nbDialogRef: NbDialogRef<RemoveAssetDialogComponent>,
    private toasterService: NbToastrService,
    private formBuilder: FormBuilder
  ) {
    this.removingDate.setDate(this.removingDate.getDate() + this.removingPeriod);
    tokenService.getToken()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        if (!this.tokenService.getPermission(RightsTag.changeAssetsInformation)) {
          this.nbDialogRef.close();
          this.toasterService.warning('nemáte oprávnění k přístupu do této sekce', 'Nemáte oprávnění');
        }
      });

    this.removeAssetForm = this.formBuilder.group({
      removingDocumentIdentification: [null, [Validators.pattern(/^\S*$/), Validators.required, Validators.minLength(1)]],
      documentDate: [this.today],
      possibleRemovingDate: [this.removingDate]
    });
  }

  ngOnInit(): void {
    this.fetchData();
  }

  private fetchData(): void {
      this.assetsList = this.assetsService.getAssetFromSource(this.source)
        .map((asset) => {
          return {...asset, asset: {...asset.asset}, changes: []};
        }).filter((asset => asset.asset.user.reachable === true))
  }

  /**
   * close dialog
   */
  close(): void {
    this.nbDialogRef.close();
  }

  onRemoveClicked(): void {
    this.removing = true;
    const removingInformation: IRemoveAssetsInformation = {
      removingDocumentIdentification: this.removeAssetForm.value.removingDocumentIdentification,
      documentDate: this.removeAssetForm.value.documentDate,
      possibleRemovingDate: this.removeAssetForm.value.possibleRemovingDate
    };
    this.assetsService.removeAssets(removingInformation, this.assetsList)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.toasterService.success('vyřazen', 'Majetek');
        this.close();
      }, () => {
        this.toasterService.danger('nepodařilo vyřadit', 'Majetek');
      }, () => {
        this.removing = false;
      });
  }

  status(formControl: AbstractControl): NbComponentStatus {
    return FormFuncs.status(formControl);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
  }
}
