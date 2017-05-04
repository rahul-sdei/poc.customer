import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Places } from "../../both/collections/places.collection";
import { Place } from "../../both/models/place.model";

Meteor.methods({
  "places.findCountries": () => {
    return Places.collection.find({"active": true, "country": {$exists: false}}, {sort: {"sortOrder": 1}, fields: {name: 1}}).fetch();
  }
})
