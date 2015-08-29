import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('voted-player-list/voted-player', 'Integration | Component | voted player list/voted player', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{voted-player-list/voted-player}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#voted-player-list/voted-player}}
      template block text
    {{/voted-player-list/voted-player}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
