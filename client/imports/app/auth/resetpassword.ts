import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Observable, Subscription, Subject, BehaviorSubject} from "rxjs";
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import {MeteorComponent} from 'angular2-meteor';
import { matchingPasswords, validatePassword } from '../validators/validators';
import {showAlert} from "../shared/show-alert";

import template from './resetpassword.html';

@Component({
  selector: '',
  template
})
export class ResetPassword extends MeteorComponent implements OnInit {
  paramsSub: Subscription;
  passwordForm: FormGroup;
  error: string;
  token: string;
  userId: any;

  constructor(private router: Router, private route: ActivatedRoute, private zone: NgZone, private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['token'])
      .subscribe(token => {
          this.token = token;

          this.call("users.findByToken", this.token, (err, res) => {
            if (err) {
              console.log("Error while calling users.findByToken()");
              this.zone.run(() => {
                showAlert("Uncaught server error. Please try later.");
                this.router.navigate(['/signup']);
              });
              return;
            }

            if (!res || !res.length) {
              console.log("Invalid token supplied");
              this.zone.run(() => {
                showAlert("Invalid token supplied.");
                this.router.navigate(['/signup']);
              });
              return;
            }

            this.userId = res;
          })
        });

    this.passwordForm = this.formBuilder.group({
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), validatePassword])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), validatePassword])],
    }, {validator: matchingPasswords('newPassword', 'confirmPassword')});

     this.error = '';
  }

  changePassword() {
    if (! this.passwordForm.valid) {
      showAlert("Invalid formData supplied.", "danger");
      return;
    }

    this.call("users.resetPasswd", this.token, this.passwordForm.value.newPassword, (err) => {
      //console.log("res:", err);
      if (err) {
        this.error = err;
        showAlert(err.message, "danger");
      } else {
        showAlert("Password updated successfully.", "success");
        this.router.navigate(['/login']);
      }
    });

  }
}
