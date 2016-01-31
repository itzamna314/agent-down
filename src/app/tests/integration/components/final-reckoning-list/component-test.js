import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('final-reckoning-list', 'Integration | Component | final reckoning list', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{final-reckoning-list}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#final-reckoning-list}}
      template block text
    {{/final-reckoning-list}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
