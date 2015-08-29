import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('accuse-player-list', 'Integration | Component | accuse player list', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{accuse-player-list}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#accuse-player-list}}
      template block text
    {{/accuse-player-list}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
