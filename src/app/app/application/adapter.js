import DS from 'ember-data';

import ENV from 'agent-down/config/environment';

var extendObj = {
    namespace: '/api'
};

if (ENV.environment === 'production' ) {
    extendObj.host = 'http://52.24.227.145';
    extendObj.namespace = 'api';
} else if (ENV.environment === 'local' ) {
    extendObj.host = 'http://localhost:8080';
    extendObj.namespace = 'api';
}

export default DS.RESTAdapter.extend(extendObj);
