
define([
  "underscore",
  "backbone",
  // "./backbone-validators",
], function(_, Backbone, validators) {

  // return (function(validators) {

    var helpers = {};
    
    /**
     * This function is used to transform the key from a schema into the title used in a label.
     * (If a specific title is provided it will be used instead).
     * 
     * By default this converts a camelCase string into words, i.e. Camel Case
     * If you have a different naming convention for schema keys, replace this function.
     * 
     * @param {String}  Key
     * @return {String} Title
     */
    helpers.keyToTitle = function(str) {
        //Add spaces
        str = str.replace(/([A-Z])/g, ' $1');
    
        //Uppercase first character
        str = str.replace(/^./, function(str) { return str.toUpperCase(); });
    
        return str;
    };
    
    /**
     * Helper to create a template with the {{mustache}} style tags. Template settings are reset
     * to user's settings when done to avoid conflicts.
     * @param {String}      Template string
     * @return {Template}   Compiled template
     */
    helpers.createTemplate = function(str) {
        //Store user's template options 
        var _interpolateBackup = _.templateSettings.interpolate;
    
        //Set custom template settings
        _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;
    
        var template = _.template(str);
    
        //Reset to users' template settings
        _.templateSettings.interpolate = _interpolateBackup;
    
        return template;
    };
    
    
    /**
     * Return the editor constructor for a given schema 'type'.
     * Accepts strings for the default editors, or the reference to the constructor function
     * for custom editors
     * 
     * @param {String|Function} The schema type e.g. 'Text', 'Select', or the editor constructor e.g. editors.Date
     * @param {Object}          Options to pass to editor, including required 'key', 'schema'
     * @return {Mixed}          An instance of the mapped editor
     */
    // helpers.createEditor = function(schemaType, options) {
    //     var constructorFn;
    
    //     if (_.isString(schemaType))
    //         constructorFn = editors[schemaType];
    //     else
    //         constructorFn = schemaType;
    
    //     return new constructorFn(options);
    // };
    
    /**
     * Triggers an event that can be cancelled. Requires the user to invoke a callback. If false
     * is passed to the callback, the action does not run.
     * 
     * @param {Mixed}       Instance of Backbone model, view, collection to trigger event on
     * @param {String}      Event name
     * @param {Array}       Arguments to pass to the event handlers
     * @param {Function}    Callback to run after the event handler has run.
     *                      If any of them passed false or error, this callback won't run
     */ 
    helpers.triggerCancellableEvent = function(subject, event, args, callback) {
        var eventHandlers = subject._callbacks[event] || [];
        
        if (!eventHandlers.length) return callback();
        
        var fn = eventHandlers[0][0],
            context = eventHandlers[0][1] || this;
        
        //Add the callback that will be used when done
        args.push(callback);
        
        fn.apply(context, args);
    }
    
    // helpers.getValidator = function(validator) {
    //     var isRegExp = _(validator).isRegExp();
    //     if (isRegExp || validator['RegExp']) {
    //         if (!isRegExp) {
    //             validator = new RegExp(validator['RegExp']);
    //         }
    //         return function (value) {
    //             if (!validator.test(value)) {
    //                 return 'Value '+value+' does not pass validation against regular expression '+validator;
    //             }
    //         };
    //     } else if (_(validator).isString()) {
    //         if (validators[validator]) {
    //             return validators[validator];
    //         } else {
    //             throw 'Validator "'+validator+'" not found';
    //         }
    //     } else if (_(validator).isFunction()) {
    //         return validator;
    //     } else {
    //         throw 'Could not process validator' + validator;
    //     }
    // };

    return helpers;
  
  // })(validators);

});