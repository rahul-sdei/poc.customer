import { Meteor } from "meteor/meteor";
import {Component, OnInit, OnDestroy, NgZone} from "@angular/core";
import {Observable, Subscription, Subject, BehaviorSubject} from "rxjs";
import {MeteorObservable} from "meteor-rxjs";
import {InjectUser} from "angular2-meteor-accounts-ui";
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Page } from "../../../../both/models/page.model";
import {showAlert} from "../shared/show-alert";
import { Title } from '@angular/platform-browser';
import template from "./view.html";
import terms from "./static/terms.html";
import privacy from "./static/privacy.html";
import disclaimer from "./static/disclaimer.html";
import story from "./static/our-story.html";
import useAtorvia from "./static/why-use.html";
import sell from "./static/sell.html";

@Component({
  selector: '',
  template
})
@InjectUser('user')
export class ViewPageComponent extends MeteorComponent implements OnInit, OnDestroy {
    paramsSub: Subscription;
    item: Page;
    slug: string;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private titleService: Title,
        private ngZone: NgZone
    ) {
        super();
    }

    ngOnInit() {
      this.slug = this.route.routeConfig.path;

      if (! this.slug) {
        showAlert("Invalid slug supplied.");
        return;
      }

      switch (this.slug) {
        case "terms":
        this.titleService.setTitle("Terms and Conditions | Atorvia");
          this.item = <Page> {
            heading: "Terms",
            contents: terms
          };
        break;
        case "privacy":
        this.titleService.setTitle("Privacy | Atorvia");
          this.item = <Page> {
            heading: "Privacy",
            contents: privacy
          };
        break;
        case "disclaimer":
        this.titleService.setTitle("Disclaimer | Atorvia");
          this.item = <Page> {
            heading: "Disclaimer",
            contents: disclaimer
          };
        break;
        case "story":
        this.titleService.setTitle("Our Story | Atorvia");
          this.item = <Page> {
            heading: "Our Story",
            contents: story
          };
        break;
        case "use-atorvia":
        this.titleService.setTitle("Why Use Atorvia | Atorvia");
          this.item = <Page> {
            heading: "Why Use Atorvia",
            contents: useAtorvia
          }
        break;
        case "sell":
        this.titleService.setTitle("Sell On Atorvia | Atorvia");
          this.item = <Page> {
            heading: "Sell On Atorvia",
            contents: sell
          }
        break;
        default:
          this.call("pages.findOne", this.slug, (err, res)=> {
              if (err) {
                  showAlert("Error while fetching page data.", "danger");
                  return;
              }

              this.item = res;
          });
        break;
      }
    }

    get page() {
        return this.item;
    }
}
