import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('vote-tally-list/vote-tally', 'Integration | Component | vote tally list/vote tally', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{vote-tally-list/vote-tally}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#vote-tally-list/vote-tally}}
      template block text
    {{/vote-tally-list/vote-tally}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
