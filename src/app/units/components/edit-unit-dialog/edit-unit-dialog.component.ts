import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NbComponentStatus, NbDialogRef, NbToastrService, NbTooltipDirective, NbTrigger} from '@nebular/theme';
import {FormControl, FormGroup} from '@angular/forms';
import {UnitsService} from '../../units.service';
import {TokenService} from '../../../auth/token.service';
import {Unit} from '../../models/unit.model';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-unit-dialog.component.html',
  styleUrls: ['./edit-unit-dialog.component.scss']
})
export class EditUnitDialogComponent implements OnInit, OnDestroy {
  @ViewChild(NbTooltipDirective) nbTooltip!: NbTooltipDirective;
  @Input() unitId!: number;
  editUnitForm: FormGroup;
  unitNameStatus: NbComponentStatus = 'basic';
  units: Unit[] = [];
  unsubscribe: Subject<void> = new Subject<void>();
  trigger = NbTrigger.NOOP;

  constructor(
    private nbDialogRef: NbDialogRef<EditUnitDialogComponent>,
    private nbToastrService: NbToastrService,
    private tokenService: TokenService,
    private unitsService: UnitsService
  ) {
    this.editUnitForm = new FormGroup({
      unitName: new FormControl({})
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnInit(): void {
    this.unitsService.getUnits()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(units => {
        this.units = units;
        this.editUnitForm.patchValue({unitName: units.find(unit => unit.id === this.unitId)?.name});
      });

    const unitName = this.editUnitForm.controls['unitName'];
    unitName.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((name => {
        if (this.units.some(found => found.name === name)) {
          unitName.setErrors({exists: 'name exists'});
          this.unitNameStatus = 'danger';
          this.nbTooltip.show();
        } else {
          unitName.setErrors(null);
          this.unitNameStatus = 'basic';
          this.nbTooltip.hide();
        }
      }));
  }

  dismiss(): void {
    // toaster s nbTooltip directive FIX
    document.querySelectorAll('.cdk-overlay-connected-position-bounding-box').forEach(s => s.remove());
    this.nbDialogRef.close();
  }

  onSubmit(): void {
    this.unitsService.updateUnit(this.unitId, this.editUnitForm.controls['unitName'].value)
      .pipe(
        take(1),
        takeUntil(this.unsubscribe)
      )
      .subscribe(newUnit => {
          if (newUnit) {
            this.dismiss();
            this.nbToastrService.success('Jednotka úspěšně upravena', 'Jednotka upravena', {duration: 2000});
          }
        },
        err => {
          this.nbToastrService.danger(err.error.message, 'Jednotka nebyla upravena');
        }, () => {}
      );
  }

}
