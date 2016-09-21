import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('create', {path: '/create/:game_id'});
  this.route('join');
  this.route('active');
  this.route('results', {path: '/results/:game_id'});
  this.route('vote', {path: '/vote/:accusation_id'});
  this.route('invite-received', {path: '/invite-received/:game_id'});
  this.route('guess-location');
  this.route('final-reckoning', {path: '/final-reckoning/:game_id'});
  this.route('how-to-play');
});

export default Router;
