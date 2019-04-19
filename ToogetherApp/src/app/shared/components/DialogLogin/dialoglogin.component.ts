import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Observable } from 'rxjs';
import * as fromRoot from '../../../app.reducer';
import { ResponseMessagesService } from '../../../core/services/error.service';
import * as UI from '../../actions/ui.actions';
import { UserService } from './../../../core/services/user.service';
import { UserLogin } from '../../models/UserLogin.model';


@Component({
  selector: 'app-dialog-login',
  templateUrl: './dialoglogin.component.html',
  styleUrls: ['./dialoglogin.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DialogLoginComponent {
  public hide: boolean;
  public Connected: boolean;
  public isLoading$: Observable<boolean>;
  public profileAble$: Observable<boolean>;
  public wallAble$: Observable<boolean>;
  public editAble$: Observable<boolean>;
  public id: string;
  public data: UserLogin;

  constructor(private userService: UserService, private snackBar: MatSnackBar, private router: Router,
              private responseMessageService: ResponseMessagesService,
              private store: Store<fromRoot.State>, private spinnerService: Ng4LoadingSpinnerService) {
    this.hide = true;
    this.Connected = false;
  }

  DoneLogin(form: NgForm) {

    this.data = {email: form.value.email, password: form.value.password};
    if (form.invalid) {
      return;
    } else {
      this.Connected = true;
      this.Loading();
      this.userService.LoginUser(form.value).subscribe(
        (response) => {
          if (response.token) {
            this.id = response.id;
            this.userService
              .UpdateLoggedIn(response.id, true)
              .subscribe(responseUpdate => {
                if (responseUpdate.success) {
                  this.Connected = true;
                  this.openSnackBar('You have successfully logged in', '');
                  this.router.navigate(['Wall/' + this.id]);
                }
              });
          } else {
            this.responseMessageService.FailureMessage('This user is not authorized in our system', 'Sorry');
          }
        },
        (error) => {
          this.responseMessageService.FailureMessage(error, 'Sorry');
        }
      );
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }


  Loading() {

    this.spinnerService.show();
    this.store.dispatch(new UI.StartLoading());
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
  }



}
