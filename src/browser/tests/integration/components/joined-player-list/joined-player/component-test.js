import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('joined-player-list/joined-player', 'Integration | Component | joined player list/joined player', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{joined-player-list/joined-player}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#joined-player-list/joined-player}}
      template block text
    {{/joined-player-list/joined-player}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
