import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NbSidebarService, NbToastrService} from '@nebular/theme';
import {AssetsService, IAssetsExt} from '../../../assets/assets.service';
import {combineLatest, Subject} from 'rxjs';
import {map, take, takeUntil} from 'rxjs/operators';
import { IAssetsListForCreateUpdate, ListsService} from '../../lists.service';
import {Asset} from '../../../assets/models/assets.model';

@Component({
  selector: 'app-save-list',
  templateUrl: './save-list.component.html',
  styleUrls: ['./save-list.component.scss']
})
export class SaveListComponent implements OnInit, OnDestroy {
  listForm: FormGroup;
  assetsWorkingList: Asset[] = [];
  editedListId: number | undefined = undefined;
  unsubscribe: Subject<void> = new Subject<void>();

  constructor(private fb: FormBuilder,
              private nbSidebarService: NbSidebarService,
              private assetsService: AssetsService,
              private listsService: ListsService,
              private nbToastrService: NbToastrService) {
    this.listForm = this.fb.group({
      listName: [null, [Validators.required, Validators.maxLength(200)]],
      category: [null, [Validators.maxLength(200)]],
      connected: [false],
      archived: [false],
      description: [null, [Validators.maxLength(1000)]]
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    }

  ngOnInit(): void {


    this.assetsService.getAssetsWorkingList$().pipe(takeUntil(this.unsubscribe))
      .subscribe(assetsList => this.assetsWorkingList = Array.from(assetsList.values()));

    combineLatest([this.listsService.getAssetsLists(), this.listForm.valueChanges])
      .pipe(
        map(([assetList, valueChanges]) => assetList.find(al => al.name === valueChanges.listName.trim())?.id),
        takeUntil(this.unsubscribe)
      )
      .subscribe(listId => this.editedListId = listId);
  }


  close(): void {
    this.nbSidebarService.toggle(true, 'saveListForm');
  }

  async submit(listForm: FormGroup): Promise<void> {
    if (!this.editedListId) {
      throw new Error('id musí být vyplněno');
    }
    const assetsList: IAssetsListForCreateUpdate = {
      id: this.editedListId,
      name: listForm.value.listName,
      category: listForm.value.category,
      connected: listForm.value.connected,
      description: listForm.value.description,
      archived: listForm.value.archived,
      assets: this.assetsWorkingList
    };

    if (this.editedListId) {
      this.listsService.updateAssetsList(assetsList).pipe(take(1))
        .subscribe();
    } else {
      this.listsService.createAssetsList(assetsList).pipe(take(1))
        .subscribe({
          next: () => {
            this.nbToastrService.success('úspěšně uložena', 'Sestava', {icon: 'link-outline', duration: 2000})
          },
          error: err => {
            if (err.status === 401) {
              this.nbToastrService.danger('nepřihlášený uživatel si nemůže uložit sestavu', 'Nepřihlášen',
                {icon: 'person-outline', duration: 10000});
            } else {
              this.nbToastrService.danger('došlo k chybě', 'Neúspěch', {duration: 10000, icon: 'alert-triangle-outline'})
            }
          }
        });
    }

  }
}
