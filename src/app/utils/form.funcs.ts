import {AbstractControl} from '@angular/forms';
import {NbComponentStatus} from '@nebular/theme';

export class FormFuncs {

  public static status(formControl: AbstractControl): NbComponentStatus {
    let status: NbComponentStatus = 'basic';
    if (formControl.valid) {
      status = 'success';
    } else if (!formControl.valid && formControl.touched) {
      status = 'danger';
    }
    return status;
  }
}
