import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import {SignupComponent} from "./auth/singup.component";
import {RecoverComponent} from "./auth/recover.component";
import {LoginComponent} from "./auth/login.component.web";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {LandingComponent} from "./layout/landing.component";
import {UserDetailsComponent} from "./account/account.component";
import {PasswordComponent} from "./account/changepassword.component";
import {accountRoutes} from "./account/account.routes";
import {routes as pageRoutes} from "./content-page/routes";
import {routes as faqRoutes} from "./faqs/routes";
import {ResetPassword} from "./auth/resetpassword";


let mainRoutes = [
    { path: '', component: SignupComponent/*, canActivate: ['canActivateForLogoff']*/ },
    { path: 'dashboard', component: DashboardComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'recover', component: RecoverComponent },
    {path: 'account', component: UserDetailsComponent},
    {path: 'changepassword', component:PasswordComponent},
    {path: 'reset-password/:token',component:ResetPassword}

];

export const routes: Route[] = [
    ...mainRoutes,
    ...accountRoutes,
    ...pageRoutes,
    ...faqRoutes
];

export const ROUTES_PROVIDERS = [
    {
        provide: 'canActivateForLoggedIn',
        useValue: () => !! Meteor.userId()
    },
    {
        provide: 'canActivateForLogoff',
        useValue: () => ! Meteor.userId()
    },
];
