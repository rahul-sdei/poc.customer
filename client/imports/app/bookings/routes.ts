import { Routes } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { BookingStep1Component } from "./booking-step1.component";
import { BookingStep2Component } from "./booking-step2.component";
import { BookingConfirmComponent } from "./booking-confirm.component";

// Route Configuration
export const routes = [
  { path: 'booking/step1', component: BookingStep1Component },
  { path: 'booking/step2', component: BookingStep2Component },
  { path: 'booking/confirm', component: BookingConfirmComponent }
];
