import {Component, OnInit} from '@angular/core';
import {UsersService} from '../../../users/users.service';
import {JwtToken, TokenService} from '../../../auth/token.service';
import {combineLatest, firstValueFrom, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CaretakerDto} from '../../../users/dto/user.dto';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {User} from '../../../users/model/user.model';
import {AssetsService} from '../../assets.service';
import {NbToastrService} from '@nebular/theme';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-stock-taking-new',
  templateUrl: './stock-taking-new.component.html',
  styleUrls: ['./stock-taking-new.component.scss']
})
export class StockTakingNewComponent implements OnInit {
  ableToCreateInventory: Observable<Boolean>;
  stockTakingNewForm!: FormGroup;
  solvers$: Observable<User[]>;

  constructor(private userService: UsersService,
              private tokenService: TokenService,
              private fb: FormBuilder,
              private assetService: AssetsService,
              private toasterService: NbToastrService,
              private router: Router,
              private route: ActivatedRoute
  ) {
    const careTakers = this.userService.getCaretakers$();
    const token = this.tokenService.getToken();
    this.ableToCreateInventory = combineLatest([careTakers, token]).pipe(map(([careTakers, token]) => this.isCaretaker(careTakers, token)));
    this.solvers$ = this.userService.getUsers$().pipe(map(users => users.filter(user => user.reachable)));
  }

  private createForm() {
    this.stockTakingNewForm = this.fb.group({
      name: new FormControl(null, [Validators.required]),
      solver: new FormControl(null),
    });
  }

  private isCaretaker(careTakers: CaretakerDto[], token: JwtToken | undefined) {
    return careTakers.some(c => c.id === token?.userId);
  }

  ngOnInit(): void {
    this.createForm();
  }

  createNewStockTaking() {
    firstValueFrom(this.assetService.createStockTaking({
      solverId: this.stockTakingNewForm.value.solver.id,
      name: this.stockTakingNewForm.value.name
    })).then(uuid => {
      this.router.navigate(['../', uuid], {relativeTo: this.route});
      this.toasterService.success('vytvoreno')
    }, reason => {
      this.toasterService.danger('chyba')
    })
  }
}
