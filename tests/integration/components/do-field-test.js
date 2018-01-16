import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import registerTestComponent from '../../ember-test-component';
import configDefaults from 'ember-do-forms/utils/config-defaults';

const {
  get,
  Object: EmObject,
  Service,
  set
} = Ember;

const ConfigStub = Service.extend(configDefaults({
  defaultClasses: {
    field: ['default-field-class'],
    feedback: ['feedback-class']
  },
  validationClasses: {
    fieldSuccess: ['field-success'],
    fieldError: ['field-error'],
    controlSuccess: ['control-success'],
    controlError: ['control-error']
  }
}));

moduleForComponent('do-field', 'Integration | Component | do field', {
  integration: true,
  beforeEach() {
    this.register('service:ember-do-forms/config', ConfigStub);
    this.inject.service('ember-do-forms/config', { as: 'config' });
    set(this, 'object', EmObject.create({
      name: 'Stefan',
      lastName: ''
    }));
  }
});

test('it requires an object as context', function(assert) {
  assert.expect(1);
  assert.expectAssertion(() => {
    this.render(hbs`{{do-field}}`);
  }, /{{do-field}} requires an object/);
});

test('it requires a propertyName as context', function(assert) {
  assert.expect(1);
  assert.expectAssertion(() => {
    this.render(hbs`{{do-field object=object}}`);
  }, /{{do-field}} requires a propertyName/);
});

test('it renders a div by default', function(assert) {
  assert.expect(1);
  this.render(hbs`
    {{do-field 'name' object=object }}
  `);
  assert.equal(this.$('div').length, 1, "it's a div by default");
});

test('it can render a label with correct context', function(assert) {
  assert.expect(3);
  this.render(hbs`
    {{#do-field 'name' object=object controlId='myControl' as |field|}}
      {{field.do-label 'Name' }}
    {{/do-field}}
  `);

  assert.equal(this.$('label').length, 1);
  assert.equal(this.$('label').text().trim(), 'Name');
  assert.equal(this.$('label').attr('for'), 'myControl', 'label has the correct for attribute');
});

test('the label component can be changed to any component', function(assert) {
  assert.expect(1);
  registerTestComponent(this);
  this.render(hbs`
    {{#do-field 'name' object=object labelComponent='test-component' as |field|}}
      {{field.do-label}}
    {{/do-field}}
  `);
  assert.equal(this.$('dummy').length, 1, 'custom component is used for label');
});

test('it renders a text input by default as a control', function(assert) {
  assert.expect(1);
  this.render(hbs`
    {{#do-field 'name' object=object as |field|}}
      {{field.do-control }}
    {{/do-field}}
  `);
  assert.equal(this.$('input').attr('type'), 'text', 'input has the correct type');
});

test('it renders a different input type as a control when specifying controlType', function(assert) {
  assert.expect(1);
  this.render(hbs`
    {{#do-field 'email' object=object controlType='email' as |field|}}
      {{field.do-control }}
    {{/do-field}}
  `);
  assert.equal(this.$('input').attr('type'), 'email', 'input has the correct type');
});

test('it renders an input with correct context', function(assert) {
  assert.expect(3);
  this.render(hbs`
    {{#do-field 'name' object=object controlId='myControl' as |field|}}
      {{field.do-control 'text' }}
    {{/do-field}}
  `);
  assert.equal(this.$('input').length, 1);
  assert.equal(this.$('input').attr('id'), 'myControl', 'input has the correct id');
  assert.equal(this.$('input').val(), get(this, 'object.name'), "the input's value is bound to the object property");
});

test('uses its objectName for the name of the control by default', function(assert) {
  assert.expect(2);
  this.render(hbs`
    {{#do-field 'name' object=object objectName='pizza' as |field|}}
      {{field.do-control 'text' }}
    {{/do-field}}
  `);
  assert.equal(this.$('input').attr('name'), 'pizza[name]', 'input has the correct name');

  this.set('object.constructor.modelName', 'bigger-pizza');
  this.render(hbs`
    {{#do-field 'name' object=object objectName='pizza' as |field|}}
      {{field.do-control 'text' }}
    {{/do-field}}
  `);
  assert.equal(this.$('input').attr('name'), 'pizza[name]', 'objectName takes precedence over computed modelName');
  this.set('object.constructor.modelName', undefined);
});

test('it uses propertyName as the name of the control when objectName is missing', function(assert) {
  assert.expect(1);
  this.render(hbs`
    {{#do-field 'firstName' object=object as |field|}}
      {{field.do-control 'text' }}
    {{/do-field}}
  `);
  assert.equal(this.$('input').attr('name'), 'firstName', 'input has the correct name');
});

test('it uses the constructor.modelName of the object for its name, when objectName is missing', function(assert) {
  assert.expect(1);
  this.set('object.constructor.modelName', 'pizza');
  this.render(hbs`
    {{#do-field 'name' object=object as |field|}}
      {{field.do-control 'text' }}
    {{/do-field}}
  `);
  assert.equal(this.$('input').attr('name'), 'pizza[name]', 'input has the correct name');
  this.set('object.constructor.modelName', undefined);
});

test('it uses the content from ember-changeset when objectName is missing', function(assert) {
  assert.expect(1);
  this.set('object._content', { constructor: { modelName: 'changeset' } });
  this.render(hbs`
    {{#do-field 'name' object=object as |field|}}
      {{field.do-control 'text' }}
    {{/do-field}}
  `);
  assert.equal(this.$('input').attr('name'), 'changeset[name]', 'input has the changeset name');
  this.set('object._content', undefined);
});

test('it uses the content from buffered-proxy when objectName is missing', function(assert) {
  assert.expect(1);
  this.set('object.content', { constructor: { modelName: 'bufferered-proxy' } });
  this.render(hbs`
    {{#do-field 'name' object=object as |field|}}
      {{field.do-control 'text' }}
    {{/do-field}}
  `);
  assert.equal(this.$('input').attr('name'), 'bufferered-proxy[name]', 'input has the buffered-proxy name');
  this.set('object.content', undefined);
});

test('the input component can be changed to any component', function(assert) {
  assert.expect(1);
  registerTestComponent(this);
  this.render(hbs`
    {{#do-field 'name' object=object controlComponent='test-component' as |field|}}
      {{field.do-control}}
    {{/do-field}}
  `);
  assert.equal(this.$('dummy').length, 1, 'custom component is used for input');
});

test("it changes the bound object's value on input", function(assert) {
  assert.expect(2);
  this.render(hbs`
    {{#do-field 'name' object=object controlId='myControl' as |field|}}
      {{field.do-control 'text' }}
    {{/do-field}}
  `);
  this.$('input').val('Dodo');
  this.$('input').change();
  this.$('input').trigger('input');

  assert.equal(this.$('input').val(), 'Dodo', "the input's value is updated");
  assert.equal(get(this, 'object.name'), 'Dodo', "the object's name is updated on input change");
});

test('it binds to any errorsPath for validations', function(assert) {
  assert.expect(1);
  this.set('config', {
    validationClasses: { fieldError: 'custom-error-prop' },
    errorsPath: 'feedbacks.{PROPERTY_NAME}.things'
  });
  this.set('object.feedbacks', { name: { things: ['error'] } });
  this.render(hbs`{{do-field 'name' object=object config=config showAllValidations=true}}`);
  assert.equal(this.$('div').hasClass('custom-error-prop'), true, 'errorsPath is read correctly');
});

test('it binds validation classes to the field and input when focusing out', function(assert) {
  assert.expect(8);
  this.set('object.validations', {
    attrs: { lastName: { errors: [{ message: "can't be blank" }] } }
  });

  this.render(hbs`
    {{#do-field 'name' object=object as |field|}}
      {{field.do-control 'text' }}
    {{/do-field}}
  `);
  this.$('div').trigger('focusout');

  assert.ok(this.$('div').hasClass('field-success'), 'adds .field-success to the field if it has errors');
  assert.ok(this.$('input').hasClass('control-success'), 'adds .control-success to the input with error');
  assert.notOk(this.$('div').hasClass('field-error'), 'no .field-error class initially');
  assert.notOk(this.$('input').hasClass('control-error'), 'no .control-error class initially');

  this.render(hbs`
    {{#do-field 'lastName' object=object as |field|}}
      {{field.do-control 'text' }}
    {{/do-field}}
  `);
  this.$('div').trigger('focusout');

  assert.ok(this.$('div').hasClass('field-error'), 'adds .field-error to fields with errors');
  assert.ok(this.$('input').hasClass('control-error'), 'adds .control-error to the input with error');
  assert.notOk(this.$('div').hasClass('field-success'), 'no .field-success class');
  assert.notOk(this.$('input').hasClass('control-success'), 'no .control-success class');
});

test('it shows feedback when it has errors', function(assert) {
  assert.expect(3);
  this.set('object.validations', {
    attrs: { lastName: { errors: [{ message: "can't be blank" }] } }
  });

  this.render(hbs`
    {{#do-field 'lastName' object=object as |field|}}
      {{field.do-control 'text' }}
      {{field.do-feedback}}
    {{/do-field}}
  `);
  assert.equal(this.$('.feedback-class').length, 0, "there's no feedback element initially");
  this.$('div').trigger('focusout');
  assert.equal(this.$('.feedback-class').length, 1, 'a feedback element is present');
  assert.equal(this.$('.feedback-class').text().trim(), "can't be blank", 'has the correct feedback message');
});

test('it shows feedback when errorsPath is an array of strings', function(assert) {
  assert.expect(3);
  this.set('object.validations', {
    attrs: { lastName: { errors: ["can't be blank"] } }
  });

  this.render(hbs`
    {{#do-field 'lastName' object=object as |field|}}
      {{field.do-control 'text' }}
      {{field.do-feedback}}
    {{/do-field}}
  `);
  assert.equal(this.$('.feedback-class').length, 0, "there's no feedback element initially");
  this.$('div').trigger('focusout');
  assert.equal(this.$('.feedback-class').length, 1, 'a feedback element is present');
  assert.equal(this.$('.feedback-class').text().trim(), "can't be blank", 'has the correct feedback message');
});

test('the feedback can also read its message from the validation key', function(assert) {
  assert.expect(2);
  this.set('object.validations', {
    attrs: { lastName: { errors: [{ validation: 'changeset-validations' }] } }
  });

  this.render(hbs`
    {{#do-field 'lastName' object=object as |field|}}
      {{field.do-feedback showFeedback=true}}
    {{/do-field}}
  `);
  assert.equal(this.$('.feedback-class').length, 1, 'a feedback element is present');
  assert.equal(this.$('.feedback-class').text().trim(), 'changeset-validations', 'has the correct feedback message');
});

test('feedback changes as errors get fixed', function(assert) {
  assert.expect(3);
  this.set('object.validations', {
    attrs: { lastName: { errors: [
      { message: "can't be blank" },
      { message: 'Never gonna give you up' }
    ] } }
  });

  this.render(hbs`
    {{#do-field 'lastName' object=object as |field|}}
      {{field.do-control 'text' }}
      {{field.do-feedback}}
    {{/do-field}}
  `);
  this.$('div').trigger('focusout');
  assert.equal(this.$('.feedback-class').text().trim(), "can't be blank", 'only the first message is shown initially');

  this.set('object.validations', {
    attrs: { lastName: { errors: [{ message: 'Never gonna give you up' }] } }
  });
  assert.equal(this.$('.feedback-class').text().trim(), 'Never gonna give you up', 'feedback text changes as errors dissappear');

  this.set('object.validations', {
    attrs: { lastName: { errors: [] } }
  });
  assert.equal(this.$('.feedback-class').length, 0, 'feedback is no longer visible');
});

test('the feedback component can be changed to any component', function(assert) {
  assert.expect(1);
  registerTestComponent(this);
  this.render(hbs`
    {{#do-field 'name' object=object feedbackComponent='test-component' as |field|}}
      {{field.do-feedback}}
    {{/do-field}}
  `);
  assert.equal(this.$('dummy').length, 1, 'custom component is used for feedback');
});

test('it has a hint contextual component', function(assert) {
  assert.expect(1);
  this.render(hbs`
    {{#do-field 'name' object=object as |field|}}
      {{field.do-hint 'hint-text'}}
    {{/do-field}}
  `);
  assert.equal(this.$().text().trim(), 'hint-text', 'renders the hint component');
});

test('the hint component can be changed to any component', function(assert) {
  assert.expect(1);
  registerTestComponent(this);
  this.render(hbs`
    {{#do-field 'name' object=object hintComponent='test-component' as |field|}}
      {{field.do-hint}}
    {{/do-field}}
  `);
  assert.equal(this.$('dummy').length, 1, 'custom component is used for hint');
});

// FIXME: Very hacky, but works.. Some things can be dumped in data-attributes
// for the others just render them as strings.
test('it sets a rich context for the yielded hash', function(assert) {
  this.set('object.validations', {
    attrs: { name: { errors: [{ message: 'too cool' }] } }
  });

  // debugger;

  this.render(hbs`
    {{#do-field 'name' object=object objectName='user' showValidation=true as |field|}}
      <div id='context'
        data-object={{field.object}}
        data-propertyName={{field.propertyName}}
        data-controlName={{field.controlName}}
        data-controlid={{field.controlId}}
        data-controlValidationClasses={{field.controlValidationClasses}}
        data-errorMessage={{field.errorMessage}}
      ></div>

      <div id='showValidation'>{{field.showValidation}}</div>
      <div id='value'>{{field.value}}</div>
    {{/do-field}}
  `);

  let context = this.$('#context').data();
  assert.equal(/Ember.Object/.test(context.object), true, 'context has the object');
  assert.equal(context.propertyname, 'name', 'context has propertyName');
  assert.equal(context.controlname, 'user[name]', 'context has controlName');
  assert.equal(context.controlid, `name-${this.$().children().first().attr('id')}`, 'context has controlId');
  assert.equal(context.controlvalidationclasses, 'control-error', 'context has controlValidationClasses');
  assert.equal(context.errormessage, 'too cool', 'context has errorMessage');
  assert.equal(this.$('#value').text(), 'Stefan', 'context has value');
  assert.equal(this.$('#showValidation').text(), 'true', 'context has showValidation');
});

test('it has fieldClasses applied from configuration', function(assert) {
  assert.expect(1);
  this.render(hbs`{{do-field 'name' object=object}}`);
  assert.equal(this.$('div').hasClass('default-field-class'), true, 'has default fieldClasses');
});

test('configuration fieldClasses can be overridden by own classNames', function(assert) {
  assert.expect(2);
  this.render(hbs`{{do-field 'name' object=object classNames='my-custom-field-class'}}`);
  assert.equal(this.$('div').hasClass('my-custom-field-class'), true, 'fieldClasses are overridden correctly');
  assert.equal(this.$('div').hasClass('default-field-class'), false, 'no default fieldClasses');
});

test('data-test-* attributes are absent when config.autoDataTestSelectors is false', function(assert) {
  assert.expect(5);
  set(this, 'config.autoDataTestSelectors', false);
  this.render(hbs`
    {{#do-field 'lastName' object=object as |field|}}
      {{field.do-label 'Last name'}}
      {{field.do-control 'text' }}
      {{field.do-feedback message="Can't be blank" showFeedback=true wrapperTagName='p'}}
      {{field.do-hint 'What your teacher calls you' }}
    {{/do-field}}
  `);

  assert.notOk(this.$('div').attr('data-test-do-field'), 'do-field data attribute was not generated');
  assert.notOk(this.$('label').attr('data-test-do-label'), 'do-label data attribute was not generated');
  assert.notOk(this.$('input').attr('data-test-do-control'), 'do-control data attribute was not generated');
  assert.notOk(this.$('p').attr('data-test-do-feedback'), 'do-feedback data attribute was not generated');
  assert.notOk(this.$('small').attr('data-test-do-hint'), 'do-hint data attribute was not generated');
});

test('data-test-* attributes are correctly set when config.autoDataTestSelectors is true', function(assert) {
  assert.expect(5);
  set(this, 'config.autoDataTestSelectors', true);
  this.render(hbs`
    {{#do-field 'lastName' object=object as |field|}}
      {{field.do-label 'Last name'}}
      {{field.do-control 'text' }}
      {{field.do-feedback message="Can't be blank" showFeedback=true wrapperTagName='p'}}
      {{field.do-hint 'What your teacher calls you' }}
    {{/do-field}}
  `);

  assert.equal(this.$('div').attr('data-test-do-field'), 'lastName', 'do-field has the data attribute');
  assert.equal(this.$('label').attr('data-test-do-label'), 'lastName', 'do-label has the data attribute');
  assert.equal(this.$('input').attr('data-test-do-control'), 'lastName', 'do-control has the data attribute');
  assert.equal(this.$('p').attr('data-test-do-feedback'), 'lastName', 'do-feedback has the data attribute');
  assert.equal(this.$('small').attr('data-test-do-hint'), 'lastName', 'do-hint has the data attribute');
});

test('data-test-* attributes are overriden when config.autoDataTestSelectors is true', function(assert) {
  assert.expect(5);
  set(this, 'config.autoDataTestSelectors', true);
  this.render(hbs`
    {{#do-field 'lastName' object=object data-test-do-field='never' as |field|}}
      {{field.do-label 'Last name' data-test-do-label='gonna'}}
      {{field.do-control 'text' data-test-do-control='give'}}
      {{field.do-feedback message="Can't be blank" showFeedback=true wrapperTagName='p' data-test-do-feedback='you'}}
      {{field.do-hint 'What your teacher calls you' data-test-do-hint='up'}}
    {{/do-field}}
  `);

  assert.equal(this.$('div').attr('data-test-do-field'), 'never', 'do-field has the data attribute');
  assert.equal(this.$('label').attr('data-test-do-label'), 'gonna', 'do-label has the data attribute');
  assert.equal(this.$('input').attr('data-test-do-control'), 'give', 'do-control has the data attribute');
  assert.equal(this.$('p').attr('data-test-do-feedback'), 'you', 'do-feedback has the data attribute');
  assert.equal(this.$('small').attr('data-test-do-hint'), 'up', 'do-hint has the data attribute');
});
