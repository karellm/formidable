
define([
  "underscore",
  "backbone",
  "./backbone-validators",
  "./backbone-helpers",
  "./backbone-field",
  "./backbone-editors",
], function(_, Backbone, validators, helpers, Field, editors) {

    (function(validators, helpers, Field, editors) {
        
        //Support paths for nested attributes e.g. 'user.name'
        function getNested(obj, path) {
            var fields = path.split(".");
            var result = obj;
            for (var i = 0, n = fields.length; i < n; i++) {
                result = result[fields[i]];
            }
            return result;
        }
        
        function getNestedSchema(obj, path) {
            path = path.replace(/\./g, '.subSchema.');
            return getNested(obj, path);
        }
        
    
        var Form = Backbone.View.extend({
            
            //Field views
            fields: null,
    
            tagName: 'fieldset',
            
            className: 'bbf-form',
    
            /**
             * @param {Object}  Options
             *      Required:
             *          schema  {Array}
             *      Optional:
             *          model   {Backbone.Model} : Use instead of data, and use commit().
             *          data    {Array} : Pass this when not using a model. Use getValue() to get out value
             *          fields  {Array} : Keys of fields to include in the form, in display order (default: all fields)
             */
            initialize: function(options) {
                this.schema = options.schema || (options.model ? options.model.schema : {}),
                this.model = options.model;
                this.data = options.data;
                this.fieldsToRender = options.fields || _.keys(this.schema);
                this.fieldsets = options.fieldsets;
                this.idPrefix = options.idPrefix || '';
    
                //Stores all Field views
                this.fields = {};
            },
    
            /**
             * Renders the form and all fields
             */
            render: function() {
                var fieldsToRender = this.fieldsToRender,
                    fieldsets = this.fieldsets,
                    el = $(this.el),
                    self = this;
    
                if (fieldsets) {
                    _.each(fieldsets, function (fs) {
                        if (_(fs).isArray()) {
                            fs = {'fields': fs};
                        }
    
                        var fieldset = $('<fieldset><ul>');
    
                        if (fs.legend) {
                            fieldset.append($('<legend>').html(fs.legend));
                        }
                        self.renderFields(fs.fields, fieldset.find('ul'));
                        el.append(fieldset);
                    });
                } else {
                    var target = $('<ul>');
                    el.append(target)
                    this.renderFields(fieldsToRender, target);
                }
    
                return this;
            },
    
            /**
             * Render a list of fields. Returns the rendered Field object.
             */
            renderFields: function (fieldsToRender, el) {
                var schema = this.schema,
                    model = this.model,
                    data = this.data,
                    fields = this.fields,
                    el = el || $(this.el),
                    self = this;
                
                //Create form fields
                _.each(fieldsToRender, function(key) {
                    var itemSchema = getNestedSchema(schema, key);
    
                    if (!itemSchema) throw "Field '"+key+"' not found in schema";
    
                    var options = {
                        key: key,
                        schema: itemSchema,
                        idPrefix: self.idPrefix
                    };
    
                    if (model) {
                        options.model = model;
                    } else if (data) {
                        options.value = data[key];
                    } else {
                        options.value = null;
                    }
    
                    var field = new Field(options);
    
                    //Render the fields with editors, apart from Hidden fields
                    if (itemSchema.type == 'Hidden') {
                        field.editor = Field.createEditor('Hidden', options);
                    } else {
                        el.append(field.render().el);
                    }
    
                    fields[key] = field;
                });
            },
    
            /**
             * Validate the data
             *
             * @return {Object} Validation errors
             */
            validate: function() {
                var fields = this.fields,
                    model = this.model,
                    errors = {};
    
                _.each(fields, function(field) {
                    var error = field.validate();
                    if (error) {
                        errors[field.key] = error;
                    }
                });
    
                if (model && model.validate) {
                    var modelErrors = model.validate(this.getValue());
                    if (modelErrors) errors._nonFieldErrors = modelErrors;
                }
    
                return _.isEmpty(errors) ? null : errors;
            },
    
            /**
             * Update the model with all latest values.
             *
             * @return {Object}  Validation errors
             */
            commit: function() {
                var fields = this.fields;
    
                var errors = this.validate();
    
                if (errors) {
                    return errors;
                }
    
                _.each(fields, function(field) {
                    var error = field.commit();
                    if (error) errors[field.key] = error;
                });
    
                return _.isEmpty(errors) ? null : errors;
            },
    
            /**
             * Get all the field values as an object.
             * Use this method when passing data instead of objects
             * 
             * @param {String}  To get a specific field value pass the key name
             */
            getValue: function(key) {
                if (key) {
                    //Return given key only
                    return this.fields[key].getValue();
                } else {
                    //Return entire form data
                    var schema = this.schema,
                        fields = this.fields
                        obj = {};
    
                    _.each(fields, function(field) {
                        obj[field.key] = field.getValue();
                    });
    
                    return obj;
                }
            },
            
            /**
             * Update field values, referenced by key
             * @param {Object}  New values to set
             */
            setValue: function(data) {
                for (var key in data) {
                    this.fields[key].setValue(data[key]);
                }
            },
    
            /**
             * Override default remove function in order to remove embedded views
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
        Form.helpers = helpers;
        Form.Field = Field;
        Form.editors = editors;
        Form.validators = validators;
        Backbone.Form = Form;
    
    })(validators, helpers, Field, editors);

});