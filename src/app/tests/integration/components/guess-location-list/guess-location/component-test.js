import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('guess-location-list/guess-location', 'Integration | Component | guess location list/guess location', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{guess-location-list/guess-location}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#guess-location-list/guess-location}}
      template block text
    {{/guess-location-list/guess-location}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
