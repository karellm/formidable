
define([
  "underscore",
  "backbone",
  "./backbone-helpers",
  "./backbone-editors",
], function(_, Backbone, helpers, editors) {

  return (function(helpers, editors) {

    var Field = Backbone.View.extend({
  
      tagName: 'div',
      className: 'field-container',
      
  
      /**
       * @param {Object} Options
       *   Required:
       *     key   {String} : The model attribute key
       *   Optional:
       *     schema {Object} : Schema for the field
       *     value    {Mixed} : Pass value when not using a model. Use getValue() to get out value
       *     model    {Backbone.Model} : Use instead of value, and use commit().
       *     idPrefix  {String} : Prefix to add to the editor DOM element's ID
       */
      initialize: function() {
        var options = this.options,
            schema = options.schema || {};

        // set defaults for the schema       
        schema.editor     = schema.editor || this.getEditorType(schema.el) || 'Text';
        schema.title      = schema.title || helpers.keyToTitle(options.key);
        schema.append     = (schema.el || schema.render == false) ? false : true;
        this.schema       = schema;

        this.key          = options.key;
        this.model        = options.model;
        this.value        = options.value;
        this.idPrefix     = options.idPrefix || '';
        this.template     = schema.template || Field.template;
        this.fieldClass   = 'editor ' + (options.schema.fieldClass || this.setFieldClass(schema.editor.type || schema.editor));
      },
  
      render: function(container) {
        var schema = this.schema,
            el = $(this.el),
            editorType = _.isString( schema.editor ) ? schema.editor : schema.editor.type,
            editorHTML;

        // Append the field to the DOM
        if(container && schema.append) container.append(this.el);

        // Create the editor
        this.editor = this.createEditor(editorType, {
          key       : this.key,
          el        : schema.el,
          value     : this.value,
          model     : this.model,
          validators: schema.validators,
          schema    : schema.editor.schema,
          idPrefix  : this.idPrefix,
        });

        if ( schema.el && schema.el.length ) {

          // Set the schema key on the fiel itself
          schema.el.attr('key', this.key);

          // Set class and id on the field div
          if(schema.class && !el.hasClass(schema.class)) el.addClass(schema.class);
          if(schema.id && el.attr('id') != schema.id) el.attr('id', schema.id);

        } else {

          // generate the field
          el.html(this.template({
            key          : this.key,
            id           : schema.id,
            title        : schema.title,
            fieldClass   : this.fieldClass,
            type         : editorType,
            errorClass   : this.errorClass,
            successClass : this.successClass
          }));

          // Add the editor
          editor = $(this.editor.render(this.$('.editor')).el);
          editor.attr('key', this.key);
        }
  
        return this;
      },

      /**
       * Return the best editor for an existing dom element
       */
      getEditorType: function(el) {
        if(!el || !el.length) return 'Text';

        var tagname = el.get(0).nodeName.toLowerCase();

        switch(tagname) {
          case 'textarea':
            return 'Textarea'; break;

          case 'select':
            return 'Select'; break;

          case 'input':
            var type = el.attr('type').toLowerCase();
            return type.charAt(0).toUpperCase() + type.slice(1);
            break;

          default:
            return 'Text';
        }
      },


      /**
       * Return the editor constructor for a given schema 'type'.
       */
      createEditor: function(editorType, options) {
        var constructorFn = (_.isString(editorType)) ? editors[editorType] : editorType;
        return new constructorFn(options);
      },


      setFieldClass: function(type) {
        if(!type) return null;
        switch(type) {
          case 'File':
            return 'field file-field'; break;
          case 'Select':
            return 'field select-field'; break;
          case 'Checkbox':
          case 'Radio':
            return 'field option-field'; break;
          default:
            return 'field text-field'; break;
        }
      },

  
      /**
       * Validate the value from the editor
       */
      validate: function() {
        return this.editor.validate();
      },
  
      /**
       * Update the model with the new value from the editor
       */
      commit: function() {
        return this.editor.commit();
      },
  
      /**
       * Get the value from the editor
       * @return {Mixed}
       */
      getValue: function() {
        return this.editor.getValue();
      },
      
      /**
       * Set/change the value of the editor
       */
      setValue: function(value) {
        this.editor.setValue(value);
      },
  
      remove: function() {
        this.editor.remove();
  
        Backbone.View.prototype.remove.call(this);
      }
  
    }, {
      
      //Static
      template: helpers.createTemplate('\
         <label for="{{id}}">{{title}}</label>\
         <div class="{{fieldClass}}"></div>\
      ')
      
    });

    return Field;
  
  })(helpers, editors);

});