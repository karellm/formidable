define(['jquery', 'underscore', 'backbone', './backbone.editors'], function ($, _, Backbone, Editors) {

  return Backbone.View.extend({

    tagName: 'div',

    initialize: function() {
      this.form = this.options.form || null;
      this.type = this.model.get('type');

      // Set the element if it already exists
      if(this.model.get('existing')) this.el = this.model.get('el');
    },



    render: function(container) {
      var el = $(this.el);

      // Render the element if it doesn't exist
      if(!this.model.get('existing')) {
        var attr = this.model.get('attr'),
            editor = this.model.get('editor'),
            label = this.model.get('label');

        if(attr.id) el.attr('id', attr.id);
        if(attr.class) el.addClass(attr.class);
        if(container && this.model.get('append')) container.append(el);

        if(label) el.append('<label for="'+editor.id+'">'+label+'</label>');
        if(this.type == 'editor' ) el.append('<div class="'+this.form.editorClass+'">');
      }

      // Create the editor
      if(this.type == 'editor') {
        this.editor = this.createEditor(editor.type, { field: this, model: this.model });
        this.editor.render( this.$('.'+this.form.editorClass) );
      } else {

        // render nested form
      }

      return this;
    },


    /**
     * Return the editor constructor for a given schema 'type'.
     */
    createEditor: function(editorType, options) {
      var constructorFn = (_.isString(editorType)) ? Editors[editorType] : editorType;
      return new constructorFn(options);
    },

    /**
     * Validate the value from the editor
     */
    validate: function() {
      return (this.type === 'editor') ? this.editor.validate() : null;
    },

    /**
     * Update the model with the new value from the editor
     */
    commit: function() {
      return (this.type === 'editor') ? this.editor.commit() : null;
    },

    /**
     * Get the value from the editor
     * @return {Mixed}
     */
    getValue: function() {
      return (this.type === 'editor') ? this.editor.getValue() : null;
    },

    /**
     * Set/change the value of the editor
     */
    setValue: function(value) {
      return (this.type === 'editor') ? this.editor.setValue(value) : null;
    },

    remove: function() {
      this.editor.remove();

      Backbone.View.prototype.remove.call(this);
    }

  });

});