import Ember from 'ember';
import GeoLocationMixin from 'agent-down/mixins/geolocation-mixin';

// Returns in miles
function dist(lat1, lon1, lat2, lon2) {
    var dlon = lon2 - lon1;
    var dlat = lat2 - lat1;
    var a = Math.pow(Math.sin(dlat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2), 2);
    var c = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1-a) );
    return 3959 * c;
}

var threshold = 1;

export default Ember.Route.extend(GeoLocationMixin, {
    geoPosition: null,
    actions: {
        updateGames: function(){
            this.refresh();
        }
    },
    beforeModel: function() {
        return this.get('geolocation').getGeoposition().then(gotGeoPos.bind(this), noGeoPos.bind(this));

        function gotGeoPos(pos) {
            this.set('geoPosition', pos.coords);
       }

        function noGeoPos(){
            this.transitionTo('index');
        }
    },
    model: function(){
        return Ember.RSVP.hash({
            games: this.store.filter('game', {state: 'awaitingPlayers'}, function(g) {
                    if ( !g.get('longitude') || !g.get('latitude') )
                    {
                        return false;
                    }

                    var pos = this.get('geoPosition');

                    var d = dist(pos.latitude, pos.longitude, g.get('latitude'), g.get('longitude'));

                    return  d < threshold;
                }.bind(this)
            ),
            geoPosition: this.get('geoPosition')
        });
    }
});
