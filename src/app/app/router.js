import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('create');
  this.route('home');
  this.route('join');
  this.route('active');
  this.route('accuse');
  this.route('results');
  this.route('vote');
});

export default Router;
