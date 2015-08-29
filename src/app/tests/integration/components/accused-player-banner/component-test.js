import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('accused-player-banner', 'Integration | Component | accused player banner', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{accused-player-banner}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#accused-player-banner}}
      template block text
    {{/accused-player-banner}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
