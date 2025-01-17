import {Component, Input} from '@angular/core';
import {User} from '../../model/user.model';
import {NbDialogRef, NbToastrService} from '@nebular/theme';
import {UsersService} from '../../users.service';
import {take} from 'rxjs/operators';
import {firstValueFrom, Observable} from 'rxjs';

@Component({
  selector: 'app-delete-selected-users-dialog',
  templateUrl: './delete-selected-users-dialog.component.html',
  styleUrls: ['./delete-selected-users-dialog.component.scss']
})
export class DeleteSelectedUsersDialogComponent {
  @Input('userToDelete') userToDelete!: User;
  usersToDelete$: Observable<User[]>

  constructor(
    private toastrService: NbToastrService,
    private nbDialogRef: NbDialogRef<DeleteSelectedUsersDialogComponent>,
    private usersService: UsersService) {
      this.usersToDelete$ = this.usersService.getSelectedUsers();
  }


  dismiss(): void {
    this.nbDialogRef.close();
  }

  async deleteUsers(): Promise<void> {
    if (this.userToDelete) {
      this.usersService.deleteUser(this.userToDelete.id).subscribe(() => {
          this.nbDialogRef.close();
        },
        error => {
          console.log(error);
          if (error.status === 405) {
            this.toastrService.danger('má svěřený majetek, odeberte jej.', 'Uživatel', {icon: 'person'});
          }
        });
    } else {
      firstValueFrom(this.usersToDelete$).then(users => {
        this.usersService.deleteUsers(users).pipe(take(1)).subscribe(() => {
          this.nbDialogRef.close();
        });
      })

    }
  }
}
