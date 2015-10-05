import Ember from 'ember';

export default Ember.Component.extend({
	origin: null,
	gameId: null,
	fromName: null,
	subjectBase: ' has invited you to play Agent Down!',
	emailSubject: Ember.computed('fromName', function(){
		return `${this.get('fromName')} ${this.get('subjectBase')}`;
	}),
	email_invite_href: Ember.computed('linkToGame', 'emailSubject', function(){
		return `mailto:?subject=${this.get('emailSubject')}&body=click%20here:%20${this.get('linkToGame')}`;
	}),
	linkToGame: Ember.computed('gameId', function(){
		return encodeURIComponent(`${this.get('origin')}/invite-received/${this.get('gameId')}`);
	}),

});
