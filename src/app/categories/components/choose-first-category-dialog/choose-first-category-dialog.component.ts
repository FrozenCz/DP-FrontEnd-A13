import { Component, OnInit } from '@angular/core';
import {NbDialogRef} from '@nebular/theme';

@Component({
  selector: 'app-choose-first-category-dialog',
  templateUrl: './choose-first-category-dialog.component.html',
  styleUrls: ['./choose-first-category-dialog.component.scss']
})
export class ChooseFirstCategoryDialogComponent implements OnInit {

  constructor(private dialogRef: NbDialogRef<ChooseFirstCategoryDialogComponent>) { }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }
}
