
define([
  "underscore",
  "backbone",
  "./backbone-helpers",
  "./backbone-editors",
], function(_, Backbone, helpers, editors) {

  return (function(helpers, editors) {

    var Field = Backbone.View.extend({
  
      tagName: 'li',
  
      className: 'bbf-field',
  
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
        this.key = options.key;
        this.schema = options.schema || {};
        this.value = options.value;
        this.model = options.model;
        this.idPrefix = options.idPrefix || '';
  
        //Set schema defaults
        var schema = this.schema;
        if (!schema.type) schema.type = 'Text';
        if (!schema.title) schema.title = helpers.keyToTitle(this.key);
      },
  
      render: function() {
        var schema = this.schema,
          el = $(this.el);
  
        el.addClass('bbf-field' + schema.type);
  
        //Standard options that will go to all editors
        var options = {
          key: this.key,
          schema: schema,
          idPrefix: this.idPrefix,
          id: this.idPrefix + this.key
        };
  
        //Decide on data delivery type to pass to editors
        if (this.model)
          options.model = this.model;
        else
          options.value = this.value;
  
        //Decide on the editor to use
        var editor = this.createEditor(schema.type, options);
  
        el.html(Field.template({
          key: this.key,
          title: schema.title,
          id: editor.id,
          type: schema.type
        }));
  
        //Add the editor
        $('.bbf-editor', el).html(editor.render().el);
  
        this.editor = editor;
  
        return this;
      },

      /**
       * Return the editor constructor for a given schema 'type'.
       */
      createEditor: function(schemaType, options) {
        var constructorFn = (_.isString(schemaType)) ? editors[schemaType] : schemaType;
        return new constructorFn(options);
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
         <div class="bbf-editor bbf-editor{{type}}"></div>\
      ')
      
    });

    return Field;
  
  })(helpers, editors);

});