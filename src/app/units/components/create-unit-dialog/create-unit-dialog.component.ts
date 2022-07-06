import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NbComponentStatus, NbDialogRef, NbToastrService, NbTooltipDirective, NbTrigger} from '@nebular/theme';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UnitsService} from '../../units.service';
import {Unit} from '../../models/unit.model';
import {filter, takeUntil, withLatestFrom} from 'rxjs/operators';
import {TokenService} from '../../../auth/token.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-create-unit-dialog',
  templateUrl: './create-unit-dialog.component.html',
})
export class CreateUnitDialogComponent implements OnInit, OnDestroy {
  @ViewChild(NbTooltipDirective) nbTooltip!: NbTooltipDirective;
  @Input() parentId!: number;
  createUnitForm: FormGroup;
  unsubscribe: Subject<void> = new Subject<void>();

  //beware of id, must set from null to zero
  defaultUnit: Unit = {name: 'Nadřazená jednotka', id: 0, parent: null, children: [], tree: []};
  units: Unit[] = [];
  unitNameStatus: NbComponentStatus = 'basic';
  trigger = NbTrigger.NOOP;

  constructor(
    private nbDialogRef: NbDialogRef<CreateUnitDialogComponent>,
    private nbToastrService: NbToastrService,
    private tokenService: TokenService,
    private unitsService: UnitsService
  ) {
    if (this.defaultUnit) {
      this.units.push(this.defaultUnit);
    }
    this.createUnitForm = new FormGroup({
      unitName: new FormControl(null, [Validators.required]),
      parentUnit: new FormControl(this.units[0].id)
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnInit(): void {
    const unitName = this.createUnitForm.controls['unitName'];
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

    this.unitsService.getUnits()
      .pipe(
        withLatestFrom(this.tokenService.getToken()),
        filter(([units, token]) => !!token),
        takeUntil(this.unsubscribe)
      )
      .subscribe(([units, token]) => {
        if (units) {
          this.units = units.map((unit) => {
            return {
              ...unit
            };
          });
          this.units.sort((a, b) => a.name.localeCompare(b.name));

          if (this.parentId || (token && token.unitId)) {
            const findBy: number | undefined | null = this.parentId ? this.parentId : token?.unitId;
            const found = this.units.find(unit => unit.id === findBy);
            if (found) {
              this.defaultUnit = found;
            }
            this.createUnitForm.patchValue({parentUnit: this.defaultUnit});
          } else {
            if (this.defaultUnit) {
              this.units.unshift(this.defaultUnit);
            }
            this.createUnitForm.patchValue({parentUnit: this.defaultUnit});
          }
        }
      });
  }

  dismiss(): void {
    // toaster s nbTooltip directive FIX
    document.querySelectorAll('.cdk-overlay-connected-position-bounding-box').forEach(s => s.remove());
    this.nbDialogRef.close();
  }

  onSubmitCreate(): void {
    this.unitsService.createUnit(this.createUnitForm.controls['unitName'].value, this.createUnitForm.controls['parentUnit'].value?.id).subscribe(
      (newUnit) => {
        if (newUnit) {
          this.dismiss();
          this.nbToastrService.success('Jednotka úspěšně vytvořena', 'Jednotka vytvořena', {duration: 2000});
        }
      },
      err => {
        this.nbToastrService.danger(err.error.message, 'Jednotka nebyla vytvořena');
      }
    );
  }


}

