import {Component, Input, OnInit} from '@angular/core';
import {ListsService} from '../../lists.service';
import {NbDialogRef, NbToastrService} from '@nebular/theme';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-delete-list-dialog',
  templateUrl: './delete-list-dialog.component.html',
  styleUrls: ['./delete-list-dialog.component.scss']
})
export class DeleteListDialogComponent implements OnInit {
  @Input() listId!: number;

  constructor(private listsService: ListsService,
              private nbDialogRef: NbDialogRef<DeleteListDialogComponent>,
              private nbToastrService: NbToastrService
              ) { }

  ngOnInit(): void {
  }

  dismiss(): void {
    this.nbDialogRef.close();
  }

  deleteList(listId: number): void {
    this.nbDialogRef.close();
    this.listsService.deleteAssetsList(listId)
      .pipe(
        take(1))
      .subscribe(
      () => {
        this.nbToastrService.success('byla smazána', 'Sestava', {icon: 'link-outline'});
      },
      error => {
        this.nbToastrService.danger('se nepovedlo smazat', 'Sestavu', {icon: 'alert'});
      }
    );
  }
}
