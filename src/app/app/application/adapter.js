import DS from 'ember-data';

import ENV from 'agent-down/config/environment';

var extendObj = {
    namespace: '/api'
};

if (ENV.environment == 'production' ) {
    extendObj.host = 'http://localhost:8080';
    extendObj.namespace = 'api';
}

export default DS.RESTAdapter.extend(extendObj);
