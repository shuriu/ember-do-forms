import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import registerTestComponent from '../../ember-test-component';
import configDefaults from 'ember-do-forms/utils/config-defaults';

const {
  get,
  Object,
  set,
  Service
} = Ember;

const ConfigStub = Service.extend(configDefaults({
  defaultClasses: {
    form: ['default-form-class']
  },
  validationClasses: {
    fieldSuccess: ['field-success'],
    fieldError: ['field-error'],
    controlSuccess: ['control-success'],
    controlError: ['control-error']
  }
}));

moduleForComponent('do-form', 'Integration | Component | do form', {
  integration: true,
  beforeEach() {
    this.register('service:ember-do-forms/config', ConfigStub);
    this.inject.service('ember-do-forms/config', { as: 'config' });

    set(this, 'submitted', false);

    set(this, 'object', Object.create({
      name: 'Stefan',
      lastName: ''
    }));

    set(this, 'submitTask', () => {
      set(this, 'submitted', true);
    });
  }
});

test('it requires an object as context', function(assert) {
  assert.expect(1);
  assert.expectAssertion(() => {
    this.render(hbs`{{do-form}}`);
  }, /{{do-form}} requires an object/);
});

test('it requires a submit action', function(assert) {
  assert.expect(1);
  assert.expectAssertion(() => {
    this.render(hbs`{{do-form object}}`);
  }, /{{do-form}} requires a submit action/);
});

test('it has an object as the first positional param', function(assert) {
  assert.expect(1);
  this.render(hbs`{{do-form object submit=(action submitTask)}}`);
  assert.equal(this.$('form').length, 1);
});

test('it passes down its objectName to the context', function(assert) {
  assert.expect(1);
  this.render(hbs`
    {{#do-form object submit=(action submitTask) objectName='pizza' as |form|}}
      {{#form.do-field 'name' as |field|}}
        {{field.do-control 'text'}}
      {{/form.do-field}}
    {{/do-form}}
  `);

  assert.equal(this.$('input').attr('name'), 'pizza[name]', 'controls have objectName in their names');
});

test('passes an input-field to the context', function(assert) {
  this.render(hbs`
    {{#do-form object submit=(action submitTask) as |form|}}
      {{form.input-field 'name' label='Full name' hint='Never gonna give you up'}}
    {{/do-form}}
  `);
  assert.equal(this.$('input').attr('type'), 'text', 'has a text input');
  assert.equal(this.$('input').val(), get(this, 'object.name'), 'input has the correct value');
  assert.equal(this.$('label').text().trim(), 'Full name', 'has correct label');
  assert.equal(this.$('small').text().trim(), 'Never gonna give you up', 'has correct hint text');
});

test('it can submit', function(assert) {
  assert.expect(7);
  this.set('object.validations', {
    attrs: { lastName: { errors: [{ message: "can't be blank" }] } }
  });

  this.render(hbs`
    {{#do-form object submit=(action submitTask) as |form|}}
      {{form.do-field 'name'}}
      {{form.do-field 'lastName'}}
      <button type='submit'>Submit</button>
    {{/do-form}}
  `);

  assert.equal(this.$('.field-error').length, 0, 'no error fields initially');
  assert.equal(this.$('.field-success').length, 0, 'no success fields initially');

  this.$('form').submit();
  assert.equal(get(this, 'submitted'), true, 'submit action was called');

  assert.equal(this.$('.field-error').length, 1, 'one field with error');
  assert.equal(this.$('.field-success').length, 1, 'one field with success');

  // Clear the validations
  this.set('object.validations', {
    attrs: { lastName: { errors: [] } }
  });

  assert.equal(this.$('.field-error').length, 0, 'no error fields now');
  assert.equal(this.$('.field-success').length, 2, 'all the fields are successful now');
});

test('the field component can be changed to any component', function(assert) {
  assert.expect(1);
  registerTestComponent(this);
  this.render(hbs`
    {{#do-form object submit=(action submitTask) fieldComponent='test-component' as |form|}}
      {{form.do-field}}
    {{/do-form}}
  `);
  assert.equal(this.$('dummy').length, 1, 'custom component is used when specified');
});

test('it has formClasses applied from configuration', function(assert) {
  assert.expect(1);
  this.render(hbs`{{do-form object submit=(action submitTask)}}`);
  assert.equal(this.$('form').hasClass('default-form-class'), true, 'has default formClasses');
});

test('configuration formClasses can be overridden by own classNames', function(assert) {
  assert.expect(2);
  this.render(hbs`{{do-form object submit=(action submitTask) classNames='my-custom-form-class'}}`);
  assert.equal(this.$('form').hasClass('my-custom-form-class'), true, 'formClasses are overridden correctly');
  assert.equal(this.$('form').hasClass('default-form-class'), false, 'no default formClasses');
});
