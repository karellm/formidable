define(['jquery', 'underscore', 'backbone', './backbone.editors'], function ($, _, Backbone, Editors) {

  return Backbone.View.extend({

    tagName: 'div',

    initialize: function() {
      this.form = this.options.form || null;

      // Set the element if it already exists
      if(this.model.get('existing')) this.el = this.model.get('el');
    },



    render: function(container) {
      var el = $(this.el);

      // Render the element if it doesn't exist
      if(!this.model.get('existing')) {
        var attr = this.model.get('attr'),
            editor = this.model.get('editor');

        if(attr.id) el.attr('id', attr.id);
        if(attr.class) el.addClass(attr.class);
        if(container && this.model.get('append')) container.append(el);

        el.html(this.model.get('template')({
          label        : this.model.get('label'),
          e_id         : editor.id,
          e_class      : this.form.editorClass
        }));
      }

      // Create the editor
      if(this.model.get('type') == 'editor') {
        this.editor = this.createEditor(editor.type, { model: this.model });
        $(this.editor.render(this.$('.'+this.form.editorClass)).el);
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

  });

});