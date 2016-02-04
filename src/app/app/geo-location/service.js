import Ember from 'ember';

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

var threshold = 0.25;

export default Ember.Service.extend({
    getGeoPosition() {
        return new Ember.RSVP.Promise((resolve, reject) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(position => {
                    var userLocation = {
                        latitude: position.coords.latitude, 
                        longitude: position.coords.longitude
                    };

                    resolve(userLocation);
                }, () => { reject('nope');});
            } else {
                reject('Unable to get user location');
            } 
        });
    },
    isNearby(pointA, pointB) {
        return dist(pointA.latitude, pointA.longitude, pointB.latitude, pointB.longitude) < threshold;
    }
});
