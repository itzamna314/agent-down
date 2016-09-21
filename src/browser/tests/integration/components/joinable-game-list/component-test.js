import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('joinable-game-list', 'Integration | Component | joinable game list', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{joinable-game-list}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#joinable-game-list}}
      template block text
    {{/joinable-game-list}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
