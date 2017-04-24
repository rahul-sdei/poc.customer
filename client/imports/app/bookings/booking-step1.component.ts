import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators as Validators } from '@angular/forms';
import { CustomValidators as CValidators } from "ng2-validation";
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { InjectUser } from "angular2-meteor-accounts-ui";
import { MeteorComponent } from 'angular2-meteor';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { validateEmail, validatePhoneNum, validateFirstName, validatePassportNum } from "../../validators/common";
import { Booking } from "../../../../both/models/booking.model";
import { Tour } from "../../../../both/models/tour.model";
import { showAlert } from "../shared/show-alert";
import template from './booking-step1.component.html';

@Component({
  selector: '',
  template
})
@InjectUser('user')
export class BookingStep1Component extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy  {
  bookingForm: FormGroup
  booking: Booking;
  tour: Tour;
  isProcessing: boolean = false;
  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder, private localStorage: LocalStorageService, private sessionStorage: SessionStorageService) {
    super();
  }

  ngOnInit() {
    this.booking = <Booking>this.sessionStorage.retrieve("bookingDetails");
    this.bookingForm = this.formBuilder.group({
      travellers: this.formBuilder.array([
      ]),
      nameOnCard: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
      cardNumber: ['', Validators.compose([Validators.required, CValidators.creditCard, Validators.minLength(15), Validators.maxLength(19)])],
      expiryMonth: ['', Validators.compose([Validators.required])],
      expiryYear: ['', Validators.compose([Validators.required])],
      cvvNumber:  ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(3)])]
    });
    this.loadTravellers();
  }

  ngAfterViewChecked() {
  }

  ngAfterViewInit() {
    Meteor.setTimeout(() => {
      jQuery(function($){
        var leftImage = $(".tour-details").parent().height();
        var rightImage = $(".fee-summary").parent().height();

        $(".tour-details").css("height", rightImage +"px");
      });
    }, 500);
  }

  ngOnDestroy() {
  }

  get bookingDetails() {
    return this.booking;
  }

  private loadTravellers() {
    let booking = this.booking;
    let numOfTravellers = <number>booking.numOfTravellers;
    for(let i=0; i<numOfTravellers; i++) {
      this.addTraveller(i);
    }
  }

  private initTraveller(i) {
    let travellers = this.booking.travellers;
    if (typeof travellers[i] == "undefined") {
      travellers[i] = {
      };
    }

    if (typeof travellers[i] ["passport"] == "undefined") {
      travellers[i] ["passport"] = {};
    }

    return this.formBuilder.group({
      firstName: [travellers[i].firstName, Validators.compose([Validators.required, validateFirstName, Validators.minLength(2), Validators.maxLength(30)])],
      middleName: [travellers[i].middleName, Validators.compose([validateFirstName, Validators.minLength(2), Validators.maxLength(30)])],
      lastName: [travellers[i].lastName, Validators.compose([Validators.required, validateFirstName, Validators.minLength(2), Validators.maxLength(30)])],
      email: [travellers[i].email, Validators.compose([Validators.required, validateEmail, Validators.minLength(5), Validators.maxLength(50)])],
      contact: [travellers[i].contact, Validators.compose([Validators.required, validatePhoneNum, Validators.minLength(7), Validators.maxLength(15)])],
      addressLine1: [travellers[i].addressLine1, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      addressLine2: [travellers[i].addressLine2, Validators.compose([Validators.minLength(2), Validators.maxLength(50)])],
      suburb: [travellers[i].state, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      postCode: [travellers[i].postCode, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(12)])],
      state: [travellers[i].state, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      country: [travellers[i].country, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      "passport.country": [travellers[i].passport.country, Validators.compose([Validators.required])],
      "passport.number": [travellers[i].passport.number, Validators.compose([Validators.required, validatePassportNum, Validators.minLength(7), Validators.maxLength(15)])],
      specialRequest: [travellers[i].specialRequest, Validators.compose([])],
    });
  }

  private addTraveller(i) {
    const control = <FormArray>this.bookingForm.controls['travellers'];
    control.push(this.initTraveller(i));
  }

  resetStateValue() {
    this.bookingForm.controls['travellers'].controls[0].controls["state"].setValue(null);
  }

  doBooking() {
    if (this.isProcessing === true) {
      showAlert("Your previous request is under processing. Please wait for a while.", "info");
      return;
    }
    this.isProcessing = true;
    let travellers = this.bookingForm.value.travellers;
    travellers.map((item) => {
      item.passport = {
        number: item["passport.number"],
        country: item["passport.country"]
      };
      delete item["passport.number"];
      delete item["passport.country"];
    })
    let cardDetails = {
      nameOnCard: this.bookingForm.value.nameOnCard,
      cardNumber: this.bookingForm.value.cardNumber,
      expiryMonth: this.bookingForm.value.expiryMonth,
      expiryYear: this.bookingForm.value.expiryYear,
      cvvNumber: this.bookingForm.value.cvvNumber
    }
    let booking = this.booking;
    booking.travellers = travellers;

    // save booking data into session
    this.sessionStorage.store("bookingDetails", this.booking);
    this.call("bookings.insert", booking, (err, res) => {
      if (err) {
        showAlert(err.reason, "danger");
        return;
      }
      booking._id = res;
      this.processPayment(booking, cardDetails);

    });

  }

  processPayment(booking, cardDetails) {
    var paypal = require('paypal-rest-sdk');
    let res = cardDetails.nameOnCard.split(" ");
    let first_name = res[0];
    let last_name = res[1];
    paypal.configure({
      'mode': 'sandbox', //sandbox or live
      'client_id': 'AeNIxZgtK5ybDTEbj8kOwsC-apBuG6fs_eRgtyIq4qS5SzDOtTsBla2FIl3StvVhJHltFFf-RBSAyp7c',
      'client_secret': 'EJkxMwNb1sfofwhXEgDf-epl-3qDmrwDIdRGoL0SD6iMJsFk4jn5r3ZDpAnvg7LRE5Xjcre-zlRvTHiA'
    });

    var create_payment_json = {
          "intent": "sale",
          "payer": {
              "payment_method": "credit_card",
              "funding_instruments": [{
                  "credit_card": {
                      "type": "visa",
                      "number": cardDetails.cardNumber,
                      "expire_month": cardDetails.expiryMonth,
                      "expire_year": cardDetails.expiryYear,
                      "cvv2": cardDetails.cvvNumber,
                      "first_name": first_name,
                      "last_name": last_name,
                      "billing_address": {
                          "line1": booking.travellers[0].addressLine1,
                          "city": booking.travellers[0].suburb,
                          "state": booking.travellers[0].state,
                          "postal_code": booking.travellers[0].postCode,
                          "country_code": "IN"
                      }
                  }
              }]
          },
          "transactions": [{
              "amount": {
                  "total": booking.totalPrice,
                  "currency": "AUD"
              },
              "description": "This is the payment transaction description."
          }]
      };

    let self = this;

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            self.isProcessing = false;
            showAlert("Payment processing failed at server. Please recheck your details and try again.", "danger");
        } else {
            self.call("bookings.insertpayment", booking._id, payment, (err, res) => {
              self.isProcessing = false;
              if (err) {
                showAlert(err.reason, "danger");
                return;
              }
              self.zone.run(() => {
                showAlert("Thank you for booking your trip with us. You will receive confirmation email very soon.", "success")
                self.router.navigate(['/booking/step2']);
              });
            })
        }
    });
}
}