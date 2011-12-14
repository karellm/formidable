
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
            var fields = path.split("."),
                result = obj;

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
            fields: {},
    
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
                this.schema     = options.schema || (options.model ? options.model.schema : {}),
                this.model      = options.model;
                this.data       = options.data;
                this.fieldsets  = options.fieldsets;
                this.idPrefix   = options.idPrefix || '';
                this.templates  = options.templates;

                //R this.fieldsToRender = options.fields || _.keys(this.schema);
            },
    
            /**
             * Renders the form and all fields
             */
            render: function() {
                var el = $(this.el),
                    self = this;
    
                if (this.fieldsets) {
                    _.each(this.fieldsets, function (fs) {
                        if (_(fs).isArray()) {
                            fs = {'fields': fs};
                        }
    
                        var fieldset = $('<fieldset>');
    
                        if (fs.legend) {
                            fieldset.append($('<legend>').html(fs.legend));
                        }
                        self.renderFields(fs.fields, fieldset);
                        el.append(fieldset);
                    });
                } else {
                    var target = $('<ul>');
                    el.append(target);
                    this.renderFields(_.keys(this.schema), target);
                }
    
                return this;
            },
    
            /**
             * Render a list of fields. Returns the rendered Field object.
             */
            renderFields: function (fieldsToRender, el) {
                var el = el || $(this.el),
                    self = this;
                
                //Create form fields
                _.each(fieldsToRender, function(key) {
                    var itemSchema = getNestedSchema(self.schema, key);
    
                    if (!itemSchema) throw "Field '"+key+"' not found in schema";
    
                    var options = {
                        key       : key,
                        model     : self.model,
                        schema    : itemSchema,
                        value     : self.data[key] || null,
                        idPrefix  : self.idPrefix,
                    };

                    // Pick the good template
                    if(itemSchema.template) {
                        if(!self.templates) 
                            throw "No templates are defined.";
                        else if(!self.templates[itemSchema.template]) 
                            throw "Template '"+itemSchema.template+"' not found in templates";
                        else if (typeof itemSchema.template == 'string')
                            itemSchema.template = helpers.createTemplate( self.templates[itemSchema.template] );
                    }
    
                    var field = new Field(options).render(el);

                    //R
                    //Render the fields with editors, apart from Hidden fields
                    // if (itemSchema.type == 'Hidden') {
                    //     field.editor = Field.createEditor('Hidden', options);
                    // } else {
                    //     el.append(field.render().el);
                    // }
    
                    self.fields[key] = field;
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
    
                return _.isEmpty(errors) ? true : errors;
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
                    return this.fields[key].getValue();
                } else {
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