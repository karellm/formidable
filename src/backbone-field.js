
define([
  "underscore",
  "backbone",
  "./backbone-helpers",
  "./backbone-editors",
], function(_, Backbone, helpers, editors) {

  return (function(helpers, editors) {

    var Field = Backbone.View.extend({
  
      tagName: 'div',
  
      events: {
        'click label': 'logValue'
      },
  
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
      initialize: function(options) {
        var schema = options.schema || {};

        // set defaults for the schema       
        this.schema     = schema;
        schema.editor   = schema.editor || (schema.el) ? this.getEditorType(schema.el) : 'Text';
        schema.title    = schema.title || helpers.keyToTitle(options.key);
        schema.append   = (schema.el || schema.render == false) ? false : true;

        this.key        = options.key;
        this.model      = options.model;
        this.value      = options.value;
        this.idPrefix   = options.idPrefix || '';
        this.template   = (schema.template) ? schema.template : Field.template;
        this.className  = options.schema.class || this.setClass();
      },
  
      render: function(target) {
        var schema = this.schema,
            el = $(this.el),
            editorType = _.isString( schema.editor ) ? schema.editor : schema.editor.type,
            editorHTML;

        //Decide on the editor to use
        this.editor = this.createEditor(editorType, {
          key       : this.key,
          el        : schema.el,
          value     : this.value,
          model     : this.model,
          schema    : schema,
          idPrefix  : this.idPrefix,
        });

        if ( schema.el.length ) {
          // Set class and id on the field
          if(schema.class && !el.hasClass(schema.class)) el.addClass(schema.class);
          if(schema.id && el.attr('id') != schema.id) el.attr('id', schema.id);
        } else {
          // get the HTML of the editor for the templating engine
          editorHTML = $("<div />").append( $(this.editor.render().el).clone() ).html();
  
          el.html(this.template({
            key          : this.key,
            id           : schema.id,
            fieldClass   : schema.class,
            title        : schema.title,
            editor       : editorHTML,
            type         : editorType,
            errorClass   : this.errorClass,
            successClass : this.successClass,
          }));

          // Append the field to the DOM
          if(target && schema.append) el.appendTo(target);
        }
  
        return this;
      },

      /**
       * Return the best editor for an existing dom element
       */
      getEditorType: function(el) {
        if(!el.length) return 'Text';

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


      setClass: function() {
        if(this.schema && this.schema.type) {
          switch(this.schema.type) {
            
          }
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
  
      logValue: function() {
        console.log(this.getValue());
      },
  
      remove: function() {
        this.editor.remove();
  
        Backbone.View.prototype.remove.call(this);
      }
  
    }, {
      
      //Static
      template: helpers.createTemplate('\
         <label for="{{id}}">{{title}}</label>\
         <div class="bbf-editor bbf-editor{{type}}">{{editor}}</div>\
      ')
      
    });

    return Field;
  
  })(helpers, editors);

});