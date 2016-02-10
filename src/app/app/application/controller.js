import Ember from 'ember';

export default Ember.Controller.extend({
    appName: 'Agent Down',
    showAppName: true,
    gameState: Ember.inject.service('game-state') 
});
