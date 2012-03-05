define([
  'jquery',
  'underscore',
  'backbone',
  './backbone.validators',
  './backbone.helpers',
  './backbone.field',
  './backbone.editors'
], function ($, _, Backbone, Validators, Helpers, Field, Editors) {

  var FieldModel = Backbone.Model.extend({
  });

  var FieldCollection = Backbone.Collection.extend({
    model: FieldModel,
  });

  var Formidable = Backbone.View.extend({

    tagName: 'form',

    fields: {},

    collection: new FieldCollection,

    initialize: function() {
      this.action        = this.options.action || '';
      this.method        = this.options.method || 'post';
      this.schema        = this.options.schema || (this.options.model && this.options.model.schema) || {};
      this.data          = this.options.data;
      this.fieldsets     = this.options.fieldsets;
      this.novalidate    = this.options.novalidate || true;
      this.prefix        = this.options.prefix || '';
      this.fieldClass    = this.options.fieldClass || 'field';
      this.editorClass   = this.options.editorClass || 'editor';
      this.templates     = this.options.templates;
    },

    /**
     * Render the form.
     */
    render: function(container) {
      var el = $(this.el),
          self = this;

      this.fields = {};

      // Render the form
      el.attr('action', this.action);
      el.attr('method', this.method);
      if(container && container.length) container.append(el);

      // Render the fields (in fieldset if needed)
      if (this.fieldsets) {
        _.each(this.fieldsets, function (fieldset) {
          if (_(fieldset).isArray()) {
            fieldset = {'fields': fieldset};
          }

          var $fieldset = $('<fieldset>');

          if (fieldset.legend) {
            $fieldset.append($('<legend>').html(fieldset.legend));
          }

          self.renderFields(self.keysToSchema(fieldset.fields), $fieldset);

          el.append($fieldset);
        });
      } else {
        this.renderFields(this.schema, el);
      }

      return this;
    },

    /**
     * Get a list of key and return the associated schemas
     */
    keysToSchema: function(keys) {
      var self = this,
          schema = {};

      _.each(keys, function(key) {
        schema[key] = self.schema[key];
      });

      return schema;
    },

    /**
     * Render a list of fields.
     */
    renderFields: function (fields, container, parent) {
      var container = container || $(this.el),
          self = this;

      _.each(fields, function(f_schema, key) {

        // Full key in case of nested fields
        var fullKey = (parent) ? parent+'.'+key : key,
            fullKeyClass = fullKey.replace(/\./g, '_');


        // Cleanup
        var type = (!f_schema.editor) ? 'Text' : (f_schema.editor.el) ? Helpers.getEditorType(f_schema.el) : f_schema.editor.type || f_schema.editor;
        f_schema.editor = f_schema.editor || {};


        // Pick the template if specified
        if(f_schema.template) {
          if(!self.templates)
            throw "No templates are defined.";
          else if(!self.templates[f_schema.template])
            throw "Template '"+f_schema.template+"' not found in templates";
          else if (typeof f_schema.template == 'string')
            f_schema.template = Helpers.createTemplate( self.templates[f_schema.template] );
        }

        // Define the model for the field
        self.collection.add({
          id          : fullKey,
          type        : (f_schema.schema) ? 'nested' : 'editor',
          existing    : (f_schema.editor.el && true) || false,
          el          : (f_schema.editor.el && f_schema.editor.el.parents( self.field_class ).get(0)) || null,
          attr        : {
            id        : f_schema.id,
            class     : self.fieldClass + ' ' + (f_schema.class || '') + ' ' + ( (f_schema.schema) ? 'nested-field ' : type.toLowerCase()+'-field ') + fullKeyClass
          },
          label       : f_schema.label || Helpers.keyToTitle(key),
          template    : f_schema.template || Helpers.createTemplate('<label for="{{e_id}}">{{label}}</label><div class="{{e_class}}"></div>'),
          append      : (f_schema.el || f_schema.append == false) ? false : true,
          validators  : f_schema.validators,
          editor: {
            type      : type,
            el        : f_schema.editor.el || null,
            value     : (f_schema.editor.model) ? f_schema.editor.model.get(key) : f_schema.editor.value || (self.data && self.data[fullKey]) || null,
            collection: f_schema.editor.collection,
            id        : self.prefix + (f_schema.id || fullKeyClass),
            attr      : f_schema.editor.attr,
            novalidate: f_schema.editor.novalidate || self.novalidate,
          },
          fields      : (f_schema.schema) ? _.keys(f_schema.schema) : null
        });

        self.fields[fullKey] = new Field({
          form   : self,
          model  : self.collection.get(fullKey)
        }).render(container);

        // render nested field
        if(f_schema.schema) {
          self.renderFields(f_schema.schema, $(self.fields[fullKey].el), fullKey);
        }
      });
    },


    /**
     * Validate the data
     */
    validate: function(key) {
      var model = this.model,
          results = {hasError: false};

      // Validate only one field ----------
      if(key && this.fields[key]) {
        results = this.fields[key].validate();
      } else if (key && this.fields[key]) {
        throw "Field '"+key+"' couldn't be validated as it doesn't exist";

      // Validate all the fields ----------
      } else {
        _.each(this.fields, function(field, key) {
          var error = field.validate();
          if(error.hasError) results.hasError = true;
          results[key] = error;
        });
      }

      // Model validation -----------------
      if (model && model.validate) {
        var modelErrors = model.validate(this.getValue());
        if (modelErrors) errors._nonFieldErrors = modelErrors;
      }

      return results;
    },



    /**
     * Update the model with all latest values.
     */
    commit: function() {
      var results = this.validate();

      if (results.hasError) {
        return results;
      } else {
        results = {};
      }

      _.each(this.fields, function(field) {
        var result = field.commit();
        if (result) results[field.key] = result;
      });

      return _.isEmpty(results) ? true : results;
    },



    /**
     * Get all the field values as an object.
     */
    getValue: function(key) {
      var fields = this.fields;

      if (key && fields[key]) {
        return fields[key].getValue();
      } else if (key && fields[key]) {
        throw "Field '"+key+"' couldn't be get as it doesn't exist";
      } else {
        var results = {};

        _.each(fields, function(field) {
          results[field.key] = field.getValue();
        });

        return results;
      }
    },



    /**
     * Update field values, referenced by key
     */
    setValue: function(data) {
      for (var key in data) {
        this.fields[key].setValue(data[key]);
      }
    },



    /**
     * Remove embedded views
     */
    remove: function() {
      var fields = this.fields;

      for (var key in fields) {
        fields[key].remove();
      }

      Backbone.View.prototype.remove.call(this);
    }

  });


  //Exports
  Formidable.Helpers    = Helpers;
  Formidable.Field      = Field;
  Formidable.Editors    = Editors;
  Formidable.Validators = Validators;
  Backbone.Formidable   = Formidable;

});