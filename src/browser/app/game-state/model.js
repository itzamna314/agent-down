import StorageObject from 'ember-local-storage/local/object';

export default StorageObject.extend({
    storageKey: 'agent-down-state',
    initialContent: {
        gameId: null,
        playerId: null
    }
});