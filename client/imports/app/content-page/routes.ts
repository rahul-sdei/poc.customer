import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';


import { ViewPageComponent } from "./view";

export const routes = [
    {path: "about", component: ViewPageComponent},
    {path: "privacy", component: ViewPageComponent},
    {path: "terms", component: ViewPageComponent},
    {path: "story", component: ViewPageComponent},
    {path: "use-atorvia", component: ViewPageComponent},
    {path: "sell", component: ViewPageComponent},
];
