import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NbDialogRef, NbToastrService} from '@nebular/theme';
import {UnitsService} from '../../units.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-delete-unit-dialog',
  templateUrl: './delete-unit-dialog.component.html',
  styleUrls: ['./delete-unit-dialog.component.scss']
})
export class DeleteUnitDialogComponent implements OnInit, OnDestroy {
  @Input() unitId!: number;
  ableToDelete: boolean = false;
  deleteCheckFinished = false;
  unsubscribe: Subject<void> = new Subject<void>();


  constructor(private nbDialogRef: NbDialogRef<DeleteUnitDialogComponent>,
              private toastrService: NbToastrService,
              private unitsService: UnitsService) {
  }

  ngOnInit(): void {
    this.unitsService.ableToDelete(this.unitId).pipe(
      takeUntil(this.unsubscribe)
    ).subscribe((result) => {
      this.ableToDelete = result
      this.deleteCheckFinished = true;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }


  dismiss(): void {
    this.nbDialogRef.close();
  }

  deleteUnit(unitId: number): void {
    this.unitsService.deleteUnit(unitId).subscribe(() => {
      this.toastrService.success('smazána', 'Jednotka', {icon: 'layers-outline'});
      this.nbDialogRef.close();
    }, error => {
      this.toastrService.danger('nebyla smazána', 'Jednotka', {icon: 'layers-outline'});
    });
  }
}
