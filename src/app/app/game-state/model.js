import DS from 'ember-data';

import StorageObject from 'ember-local-storage/local/object';

export default StorageObject.extend({
    storageKey: 'agent-down-state',
    initialContent: {
        playerId: null,
        gameId: null
    }
});
