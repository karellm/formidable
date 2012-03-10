define(['jquery', 'underscore', 'backbone', './backbone.validators'], function ($, _, Backbone, Validators) {

  var editors = {};

  /**
   * Base editor (interface). To be extended, not used directly

   * @param {Object} Options
   *   Optional:
   *     model  {Backbone.Model} : Use instead of value, and use commit().
   *     key   {String} : The model attribute key. Required when using 'model'
   *     value  {String} : When not using a model. If neither provided, defaultValue will be used.
   *     schema {Object} : May be required by some editors
   */

  editors.Base = Backbone.View.extend({

    defaultValue: null,


    initialize: function() {

      this.field         = this.options.field;
      this.editor        = this.model.get('editor');

      // Set html attributes to the editor -------------------
      if(this.options.attr && !this.schema.el) {
        var el = $(this.el);
        _.each(this.options.attr, function(value, attr) {
          el.attr(attr, value);
        });
      }


      // Add plugins ------------------------------------------
      if(_.isFunction(this.editor.plugin)) this.plugin = $.proxy(this.editor.plugin, this);
    },

    render: function(container) {
      // Create the dom element if a container argument was passed
      if(container && container.length) container.append(this.el);

      // Apply possible plugin
      if(this.plugin) this.plugin();
    },

    getValue: function() {
      throw 'Not implemented. Extend and override this method.';
    },

    setValue: function() {
      throw 'Not implemented. Extend and override this method.';
    },

    /**
     * Check the validity of a particular field
     */
    validate: function () {
      var el = $(this.el),
          self = this,
          tests = {},
          hasError = false,
          value = this.getValue(),
          validators = this.model.get('validators');

      if (validators) {
        _.each(validators, function(against, type) {
          if(_.isFunction(against))
            var test = against(value, self);
          else
            var test = self.getValidator(type)(value, against, self);

          tests[type] = test;
          if(!test) hasError = true;
        });
      }

      // if (_.isEmpty(tests) && this.model && this.model.validate) {
      //   var arg = {}; arg[this.key] = value;
      //   tests = this.model.validate(arg);
      // }

      return {
        hasError: hasError,
        el: el,
        tests: tests
      };
    },


    getValidator: function(validator) {
      if (_.isString(validator)) {
        if (Validators[validator]) {
          return Validators[validator];
        } else {
          throw 'Validator "'+validator+'" not found';
        }
      } else if (_.isFunction(validator)) {
        return validator;
      } else {
        throw 'Could not process validator ' + validator;
      }
    },


    /**
     * Update the model with the new value from the editor
     *
     * @return {Error|null} Validation error or null
     */
    commit: function() {
      var error = null,
          change = {};

      if(!this.model) return;

      change[this.key] = this.getValue();
      this.model.set(change, {
        error: function(model, e) {
          error = e;
        }
      });

      return error;
    }

  });


  /**
   * Text editor << Base
   * ------------------------------------
   * ------------------------------------
   */
  editors.Text = editors.Base.extend({

    tagName: 'input',

    defaultValue: '',

    initialize: function(options) {
      editors.Base.prototype.initialize.call(this, options);
    },

    render: function(container) {

      var el = $(this.el),
          type = this.editor.type || 'Text';


      // Set editor attributes
      if(!this.model.get('existing')) {
        el.attr('type', type.toLowerCase());
        if(this.editor.novalidate) el.attr('novalidate', 'novalidate');
        this.setValue(this.editor.value);
      }

      editors.Base.prototype.render.call(this, container || null);

      return this;
    },

    getValue: function() {
      return $(this.el).val();
    },

    setValue: function(value) {
      $(this.el).attr('value', value);
    }

  });


  /**
   * Number editor << Text
   * ------------------------------------
   * ------------------------------------
   */
  editors.Number = editors.Text.extend({

    defaultValue: 0,

    events: {
      'keypress': 'onKeyPress'
    },

    /**
     * Check value is numeric
     */
    onKeyPress: function(event) {
      var newVal = $(this.el).val() + String.fromCharCode(event.keyCode);

      var numeric = /^[0-9]*\.?[0-9]*?$/.test(newVal);

      if (!numeric) event.preventDefault();
    },

    getValue: function() {
      var value = $(this.el).val();

      return value === "" ? null : parseFloat(value, 10);
    },

    setValue: function(value) {
      value = value === null ? null : parseFloat(value, 10);

      editors.Text.prototype.setValue.call(this, value);
    }

  });


  /**
   * Password editor << Text
   * ------------------------------------
   * ------------------------------------
   */
  editors.Password = editors.Text.extend({

    initialize: function(options) {
      editors.Text.prototype.initialize.call(this, options);

      var type = (this.schema && this.schema.dataType) || 'password';
    }

  });


  /**
   * Number Textarea << Text
   * ------------------------------------
   * ------------------------------------
   */
  editors.TextArea = editors.Text.extend({

    tagName: 'textarea'

  });


  /**
   * Checkbox editor << Base
   * ------------------------------------
   * ------------------------------------
   */
  editors.Checkbox = editors.Base.extend({

    defaultValue: false,

    // tagName: 'input',

    initialize: function() {
      editors.Base.prototype.initialize.call(this, this.options);

      this.schema = this.options.schema;

      var el = $(this.el);
      if(!el.length) el.attr('type', 'checkbox');

      if(this.schema || el.length > 1) {
        // todo render one or multiple checkboxes

      }
    },

    render: function(container) {
      this.setValue(this.value);

      this.baseRender(container || null);

      return this;
    },

    getValue: function() {
      var el = $(this.el),
          results = {};

      el.each(function() {
        var checkbox = $(this);
        results[checkbox.val()] = checkbox.attr('checked') ? true : false;
      });

      return results;
    },

    setValue: function(value) {
      $(this.el).attr('checked', value);
    }

  });


  /**
   * Hidden editor << Base
   * ------------------------------------
   * ------------------------------------
   */
  editors.Hidden = editors.Base.extend({

    defaultValue: '',

    initialize: function() {
      editors.Text.prototype.initialize.call(this, this.options);

      var el = $(this.el);
      if(!el.length) el.attr('type', 'hidden');
    },

    getValue: function() {
      return this.value;
    },

    setValue: function(value) {
      this.value = value;
    }

  });


  /**
   * Options editor << Base
   * ------------------------------------
   * ------------------------------------
   */
  editors.Options = editors.Base.extend({

    tagName: 'div',

    template: _.template(''),

    initialize: function() {
      editors.Base.prototype.initialize.call(this, this.options);

      if (!this.config.options)
        throw "Editor: missing required 'options'";
    },

    render: function(container) {
      var options = this.config.options,
          self = this;

      //If a collection was passed, check if it needs fetching
      if (options instanceof Backbone.Collection) {
        var collection = options;

        //Don't do the fetch if it's already populated
        if (collection.length > 0) {
          self.renderOptions(options);
        } else {
          collection.fetch({
            success: function(collection) {
              self.renderOptions(options);
            }
          });
        }
      }

      //If a function was passed, run it to get the options
      else if (_.isFunction(options)) {
        options(function(result) {
          self.renderOptions(result);
        });
      }

      //Otherwise, ready to go straight to renderOptions
      else {
        self.renderOptions(options);
      }

      editors.Base.prototype.render.call(this, container || null);

      return this;
    },

    /**
     * Adds the <option> html to the DOM
     * @param {Mixed}  Options as a simple array e.g. ['option1', 'option2']
     *           or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
     *           or as a string of <option> HTML to insert into the <select>
     */
    renderOptions: function(options) {
      var html;

      if (_.isString(options)) {
        html = options;
      } else if (options instanceof Backbone.Collection) {
        html = this._collectionToHtml(options)
      } else {
        html = this._hashToHtml(options);
      }

      //Insert options
      $(this.el).html(html);

      //Select correct option
      this.setValue(this.config.value);
    },

    /**
     * Transforms a collection into HTML ready to use in the renderOptions method
     */
    _collectionToHtml: function(collection) {
      var self = this;

      return _(collection.models).map(function(model) {
        return self.template({
          name: self.config.name,
          value: model.value,
          label: model.toString()
        });
      }).join('');
    },

    /**
     * Create the <option> HTML
     */
    _hashToHtml: function(options) {
      var self = this;

      return _.map(options, function(label, value) {
        return self.template({
          name: self.config.name,
          value: value,
          label: label
        });
      }).join('');
    }
  });

  /**
   * Select editor << Base
   * ------------------------------------
   * ------------------------------------
   * Renders a <select> with given options
   *
   * Requires an 'options' value on the schema.
   * Can be an array of options, a function that calls back with the array of options, a string of HTML
   * or a Backbone collection. If a collection, the models must implement a toString() method
   */
  editors.Select = editors.Options.extend({

    tagName: 'select',

    template: _.template('<option value="<%= value %>"><%= label %></option>'),

    getValue: function() {
      return $(this.el).val();
    },

    setValue: function(value) {
      $(this.el).val(value);
    },

  });



 /**
   * Radio editor << Options
   * ------------------------------------
   * ------------------------------------
   * Renders a <ul> with given options represented as <li> objects containing radio buttons
   *
   * Requires an 'options' value on the schema.
   * Can be an array of options, a function that calls back with the array of options, a string of HTML
   * or a Backbone collection. If a collection, the models must implement a toString() method
   */
  editors.Radio = editors.Options.extend({

    tagName: 'div',

    template: _.template('<label><input type="radio" name="<%= name %>" value="<%= value %>" /><span><%= label %></span></label>'),

    toHTML: function() {
      return $(this.el).html();
    },

    getValue: function() {
      return this.$('input[type=radio]:checked').val();
    },

    setValue: function(value) {
      return this.$('input[type=radio][value='+value+']').attr({checked: 'checked'});
    }

  });




 /**
   * Object editor << Base
   * ------------------------------------
   * ------------------------------------
   * Creates a child form. For editing Javascript objects
   *
   * Special options:
   *  schema.subSchema:  Subschema for object.
   *  idPrefix,
   */
  editors.Nested = editors.Base.extend({

    defaultValue: {},

    initialize: function(options) {
      editors.Base.prototype.initialize.call(this, options);

      if (!this.schema.subSchema)
        throw "Missing required 'schema.subSchema' option for Object editor";

      this.idPrefix = options.idPrefix || '';
    },

    render: function(container) {
      var el = $(this.el),
          data = this.value || {},
          key = this.key,
          schema = this.schema,
          objSchema = schema.subSchema;

      this.form = new Form({
        schema: objSchema,
        data: data,
        idPrefix: this.idPrefix + this.key + '_'
      });

      //Render form
      el.html(this.form.render().el);

      this.baseRender(container || null);

      return this;
    },

    getValue: function() {
      return this.form.getValue();
    },

    setValue: function(value) {
      this.value = value;

      this.render();
    },

    remove: function() {
      this.form.remove();

      Backbone.View.prototype.remove.call(this);
    }

  });


 /**
   * NestedModel editor << Object
   * ------------------------------------
   * ------------------------------------
   * Creates a child form. For editing nested Backbone models
   *
   * Special options:
   *  schema.model:  Embedded model constructor
   */
  editors.NestedModel = editors.Nested.extend({

    initialize: function(options) {
      editors.Base.prototype.initialize.call(this, options);

      if (!options.schema.model)
        throw 'Missing required "schema.model" option for NestedModel editor';

      this.idPrefix = options.idPrefix || '';
    },

    render: function(container) {
      var el = $(this.el),
        data = this.value || {},
        key = this.key,
        nestedModel = this.schema.model,
        nestedModelSchema = (nestedModel).prototype.schema;

      this.form = new Form({
        schema: nestedModelSchema,
        model: new nestedModel(data),
        idPrefix: this.idPrefix + this.key + '_'
      });

      //Render form
      el.html(this.form.render().el);

      this.baseRender(container || null);

      return this;
    },

    /**
     * Update the embedded model, checking for nested validation errors and pass them up
     * Then update the main model if all OK
     *
     * @return {Error|null} Validation error or null
     */
    commit: function() {
      var error = this.form.commit();
      if (error) {
        $(this.el).addClass('error');
        return error;
      }

      return editors.Object.prototype.commit.call(this);
    }

  });

  return editors;

});