import Ember from 'ember';
import GeoLocationMixin from 'agent-down/mixins/geolocation-mixin';

// Returns in miles
function dist(lat1, lon1, lat2, lon2) {
    lat1 = toRadians(lat1);
    lon1 = toRadians(lon1);
    lat2 = toRadians(lat2);
    lon2 = toRadians(lon2);
    var dlon = lon2 - lon1;
    var dlat = lat2 - lat1;
    var a = Math.pow(Math.sin(dlat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2), 2);
    var c = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1-a) );
    return 3959 * c;
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

var threshold = 1;

export default Ember.Route.extend(GeoLocationMixin, {
    geoPosition: null,
    actions: {
        didTransition: function() {
            this.get('controller').send('reset');
        },
        updateGames: function(){
            this.refresh();

            return false;
        }
    },
    beforeModel: function() {
        if ( this.get('geoPosition') ) {
            return new Ember.RSVP.Promise(function(resolve/*, reject*/){
                resolve(this.get('geoPosition'));
            }.bind(this));
        }

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
            games: this.store.filter('game', {state: 'awaitingPlayers'}, (g) => {
                    if ( !g.get('longitude') || !g.get('latitude') )
                    {
                        return false;
                    }

                    var pos = this.get('geoPosition');

                    console.log('me: ' + JSON.stringify(pos));
                    console.log('lat: ' + pos.latitude);
                    console.log('lng: ' + pos.longitude);

                    var d = dist(pos.latitude, pos.longitude, g.get('latitude'), g.get('longitude'));

                    console.log('Possible match: ' + JSON.stringify(g));
                    console.log('Dist: ' + d);
                    return  d < threshold;
                }
            ),
            geoPosition: this.get('geoPosition')
        });
    }
});
