import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('active-player-list/active-player', 'Integration | Component | active player list/active player', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{active-player-list/active-player}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#active-player-list/active-player}}
      template block text
    {{/active-player-list/active-player}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
