import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {IAssetsList, ListsService} from '../../lists.service';
import {Observable, OperatorFunction, Subject} from 'rxjs';
import {AssetsService, AssetsSourceEnum, IAssetsExt} from '../../../assets/assets.service';
import {NbDialogService, NbWindowRef} from '@nebular/theme';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SelectAssetsProtocolDialogComponent} from '../../../protocols/components/select-assets-protocol-dialog/select-assets-protocol-dialog.component';
import {AgGridInstanceService} from '../../../utils/agGrid/ag-grid-instance.service';
import {AgGridService} from '../../../utils/agGrid/ag-grid.service';
import {GridInstance} from '../../../utils/agGrid/models/grid.model';
import {AssetSource} from '../../../facade/facade';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.component.html',
  styleUrls: ['./list-detail.component.scss']
})
export class ListDetailComponent implements OnInit, OnDestroy {
  @Input() listId!: number;
  @Input() windowRef!: NbWindowRef;
  gridUid = 'assetList';
  gridService!: AgGridService;
  unsubscribe: Subject<void> = new Subject<void>();
  assetSourceEnum = AssetSource;

  assetsInList: IAssetsExt[] = [];
  assetList: IAssetsList | undefined = undefined;
  listForm: FormGroup;
  editMode = false;


  constructor(private listsService: ListsService,
              private route: ActivatedRoute,
              private fb: FormBuilder,
              private assetsService: AssetsService,
              private nbDialogService: NbDialogService,
              private agGridInstanceService: AgGridInstanceService
  ) {
    this.listForm = this.fb.group({
      listName: [null, [Validators.required, Validators.maxLength(200)]],
      category: [null, [Validators.maxLength(200)]],
      connected: [false],
      archived: [false],
      description: [null, [Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.agGridInstanceService.getGridInstance(this.gridUid)
      .pipe(filter(e => !!e) as OperatorFunction<GridInstance | undefined, GridInstance>,
        take(1))
      .subscribe(instance => this.gridService = instance.gridService);

    if (!this.listId) {
      this.listId = +this.route.snapshot.params['id'];
    }

    this.setEditModeTo(false);

    this.listsService.getAssetList(this.listId)
      .pipe(
        filter(list => !!list) as OperatorFunction<IAssetsList | undefined, IAssetsList>)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(assetList => {
        this.assetList = assetList;
        this.assetsInList = assetList.assets;
        this.listForm.setValue({
          listName: assetList.name,
          category: assetList.category,
          connected: assetList.connected,
          archived: assetList.archived,
          description: assetList.description
        });
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }

  dismiss(): void {

  }

  setEditModeTo(bool: boolean): void {
    this.editMode = bool;
    if (bool) {
      for (const controlsKey of Object.keys(this.listForm.controls)) {
        this.listForm.controls[controlsKey].enable();
      }
    } else {
      for (const controlsKey of Object.keys(this.listForm.controls)) {
        this.listForm.controls[controlsKey].disable();
      }
    }
  }

  onRefreshClicked(): void {
    alert('not implemented yet');
  }

  onToWorkingListClicked(assets: IAssetsExt[]): void {
    const assetsIds: number[] = assets.map(asset => asset.asset.id);
    this.assetsService.addAssetsIdToWorkingList(assetsIds);
    this.gridService.redrawRows();
  }


  onShowProtocolSelectList(source: AssetSource): void {
    this.nbDialogService.open(SelectAssetsProtocolDialogComponent, {context: {source}});
  }
}
