
define([
  "underscore",
  "backbone",
  "./backbone-validators",
], function(_, Backbone, validators) {

  return (function(validators) {
  
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
    
      initialize: function(options) {
        var options = options || {};
    
        if (options.model) {
          if (!options.key) throw "Missing option: 'key'";
    
          this.model = options.model;
          this.key = options.key;
    
          this.value = this.model.get(this.key);
        } else if (options.value) {
          this.value = options.value;
        }
          
        
        if (this.value === undefined) this.value = this.defaultValue;
    
        this.schema = options.schema || {};
        this.validators = options.validators || this.schema.validators;
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
          error = null,
          value = this.getValue();
    
        if (this.validators) {
          _(this.validators).each(function(validator) {
            if (!error) {
              error = this.getValidator(validator)(value);
            }
          });
        }
    
        if (!error && this.model && this.model.validate) {
          var change = {};
          change[this.key] = value;
          error = this.model.validate(change);
        }
    
        if (error) {
          el.addClass('bbf-error');
        } else {
          el.removeClass('bbf-error');
        }
    
        return error;
      },
  
  
      getValidator: function(validator) {
        var isRegExp = _(validator).isRegExp();
        if (isRegExp || validator['RegExp']) {
          if (!isRegExp) {
            validator = new RegExp(validator['RegExp']);
          }
          return function (value) {
            if (!validator.test(value)) {
                return 'Value '+value+' does not pass validation against regular expression '+validator;
            }
          };
        } else if (_.isString(validator)) {
          if (validators[validator]) {
            return validators[validator];
          } else {
            throw 'Validator "'+validator+'" not found';
          }
        } else if (_.isFunction(validator)) {
          return validator;
        } else {
          throw 'Could not process validator' + validator;
        }
      },

    
      /**
       * Update the model with the new value from the editor
       *
       * @return {Error|null} Validation error or null
       */
      commit: function() {
        var error = null;
        var change = {};
        change[this.key] = this.getValue();
        this.model.set(change, {
          error: function(model, e) {
            error = e;
          }
        });
    
        return error;
      }
    
    });
    
    editors.Text = editors.Base.extend({
    
      tagName: 'input',
    
      defaultValue: '',
      
      initialize: function(options) {      
        editors.Base.prototype.initialize.call(this, options);
        
        //Allow customising text type (email, phone etc.) for HTML5 browsers
        var type = (this.schema && this.schema.dataType) ? this.schema.dataType : 'text';
    
        $(this.el).attr('type', type);
      },
    
      /**
       * Adds the editor to the DOM
       */
      render: function() {
        this.setValue(this.value);
    
        return this;
      },
    
      /**
       * Returns the current editor value
       * @return {String}
       */
      getValue: function() {
        return $(this.el).val();
      },
      
      /**
       * Sets the value of the form element
       * @param {String}
       */
      setValue: function(value) {
        $(this.el).val(value);
      }
    
    });
    
    
    /**
     * Normal text input that only allows a number. Letters etc. are not entered
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
    
    
    editors.Password = editors.Text.extend({
    
      initialize: function(options) {
        editors.Text.prototype.initialize.call(this, options);
    
        $(this.el).attr('type', 'password');
      }
    
    });
    
    
    editors.TextArea = editors.Text.extend({
    
      tagName: 'textarea'
    
    });
    
    
    editors.Checkbox = editors.Base.extend({
      
      defaultValue: false,
      
      tagName: 'input',
      
      initialize: function(options) {
        editors.Base.prototype.initialize.call(this, options);
        
        $(this.el).attr('type', 'checkbox');
      },
    
      /**
       * Adds the editor to the DOM
       */
      render: function() {
        this.setValue(this.value);
    
        return this;
      },
      
      getValue: function() {
        return $(this.el).attr('checked') ? true : false;
      },
      
      setValue: function(value) {
        $(this.el).attr('checked', value);
      }
      
    });
    
    
    editors.Hidden = editors.Base.extend({
      
      defaultValue: '',
    
      initialize: function(options) {
        editors.Text.prototype.initialize.call(this, options);
    
        $(this.el).attr('type', 'hidden');
      },
      
      getValue: function() {
        return this.value;
      },
      
      setValue: function(value) {
        this.value = value;
      }
    
    });
    
    
    /**
     * Renders a <select> with given options
     *
     * Requires an 'options' value on the schema.
     * Can be an array of options, a function that calls back with the array of options, a string of HTML
     * or a Backbone collection. If a collection, the models must implement a toString() method
     */
    editors.Select = editors.Base.extend({
    
      tagName: 'select',
    
      initialize: function(options) {
        editors.Base.prototype.initialize.call(this, options);
    
        if (!this.schema || !this.schema.options)
          throw "Missing required 'schema.options'";
      },
    
      render: function() {
        var options = this.schema.options,
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
    
        return this;
      },
    
      /**
       * Adds the <option> html to the DOM
       * @param {Mixed}  Options as a simple array e.g. ['option1', 'option2']
       *           or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
       *           or as a string of <option> HTML to insert into the <select>
       */
      renderOptions: function(options) {
        var $select = $(this.el),
          html;
    
        //Accept string of HTML
        if (_.isString(options)) {
          html = options;
        }
    
        //Or array
        else if (_.isArray(options)) {
          html = this._arrayToHtml(options);
        }
    
        //Or Backbone collection
        else if (options instanceof Backbone.Collection) {
          html = this._collectionToHtml(options)
        }
    
        //Insert options
        $select.html(html);
    
        //Select correct option
        this.setValue(this.value);
      },
    
      getValue: function() {
        return $(this.el).val();
      },
      
      setValue: function(value) {
        $(this.el).val(value);
      },
    
      /**
       * Transforms a collection into HTML ready to use in the renderOptions method
       * @param {Backbone.Collection} 
       * @return {String}
       */
      _collectionToHtml: function(collection) {
        //Convert collection to array first
        var array = [];
        collection.each(function(model) {
          array.push({ val: model.id, label: model.toString() });
        });
    
        //Now convert to HTML
        var html = this._arrayToHtml(array);
    
        return html;
      },
    
      /**
       * Create the <option> HTML
       * @param {Array}  Options as a simple array e.g. ['option1', 'option2']
       *           or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
       * @return {String} HTML
       */
      _arrayToHtml: function(array) {
        var html = [];
    
        //Generate HTML
        _.each(array, function(option) {
          if (_.isObject(option)) {
            var val = option.val ? option.val : '';
            html.push('<option value="'+val+'">'+option.label+'</option>');
          }
          else {
            html.push('<option>'+option+'</option>');
          }
        });
    
        return html.join('');
      }
    
    });
    
    
    
    
    /**
     * Renders a <ul> with given options represented as <li> objects containing radio buttons
     *
     * Requires an 'options' value on the schema.
     * Can be an array of options, a function that calls back with the array of options, a string of HTML
     * or a Backbone collection. If a collection, the models must implement a toString() method
     */
    editors.Radio = editors.Select.extend({
    
      tagName: 'ul',
      className: 'bbf-radio',
    
      getValue: function() {
        return this.$('input[type=radio]:checked').val();
      },
    
      setValue: function(value) {
        return this.$('input[type=radio][value='+value+']').attr({checked: 'checked'});
      },
    
      /**
       * Create the radio list HTML
       * @param {Array}  Options as a simple array e.g. ['option1', 'option2']
       *           or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
       * @return {String} HTML
       */
      _arrayToHtml: function (array) {
        var html = [];
        var self = this;
    
        _.each(array, function(option, index) {
          var itemHtml = '<li>';
          if (_.isObject(option)) {
            var val = option.val ? option.val : '';
            itemHtml += ('<input type="radio" name="'+self.id+'" value="'+val+'" id="'+self.id+'-'+index+'" />')
            itemHtml += ('<label for="'+self.id+'-'+index+'">'+option.label+'</label>')
          }
          else {
            itemHtml += ('<input type="radio" name="'+self.id+'" value="'+option+'" id="'+self.id+'-'+index+'" />')
            itemHtml += ('<label for="'+self.id+'-'+index+'">'+option+'</label>')
          }
          itemHtml += '</li>';
          html.push(itemHtml);
        });
    
        return html.join('');
      }
    
    });
    
    
    
    
    /**
     * Creates a child form. For editing Javascript objects
     * 
     * Special options:
     *  schema.subSchema:  Subschema for object.
     *  idPrefix, 
     */
    editors.Object = editors.Base.extend({
    
      className: 'bbf-object',
    
      defaultValue: {},
    
      initialize: function(options) {
        editors.Base.prototype.initialize.call(this, options);
    
        if (!this.schema.subSchema)
          throw "Missing required 'schema.subSchema' option for Object editor";
    
        this.idPrefix = options.idPrefix || '';
      },
    
      render: function() {
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
     * Creates a child form. For editing nested Backbone models
     * 
     * Special options:
     *  schema.model:  Embedded model constructor
     */
    editors.NestedModel = editors.Object.extend({
    
      initialize: function(options) {
        editors.Base.prototype.initialize.call(this, options);
    
        if (!options.schema.model)
          throw 'Missing required "schema.model" option for NestedModel editor';
    
        this.idPrefix = options.idPrefix || '';
      },
    
      render: function() {
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
 
  })(validators);

});