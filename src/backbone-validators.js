
define([
  "underscore",
  "backbone",
  "./backbone-helpers",
], function(_, Backbone, helpers) {

    return (function(helpers) {

        var validators = {};
    
        validators.required = function (value) {
            var exists = (value === 0 || !!value);
            if (!exists) {
                return 'This field is required';
            }
        };

        validators.in = function (value) {
            
        };

        return validators;



// "required" : function(attributeName, model, valueToSet) {
//         var currentValue = model.get(attributeName);
//         var isNotAlreadySet = _.isUndefined(currentValue);
//         var isNotBeingSet = _.isUndefined(valueToSet);
//         if (_.isNull(valueToSet) || valueToSet === "" || (isNotBeingSet && isNotAlreadySet)) {
//           return "required";
//         } else {
//           return false;
//         }
//       },
    
//       "in" : function(whitelist, attributeName, model, valueToSet) {
//         return _.include(whitelist, valueToSet) ? undefined : "in";
//       },
    
//       "email" : function(type, attributeName, model, valueToSet) {
//         var emailRegex = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
      
//         if (_.isString(valueToSet) && !valueToSet.match(emailRegex)) {
//           return "email";
//         }
//       },
    
//       "url" : function(type, attributeName, model, valueToSet) {
//         // taken from jQuery UI validation
//         var urlRegex = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
//         if (_.isString(valueToSet) && !valueToSet.match(urlRegex)) {
//           return "url";
//         }
//       },

//       "ip" : function(type, attributeName, model, valueToSet) {
//         // taken from jQuery UI validation
//         var urlRegex = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/i;
//         if (_.isString(valueToSet) && !valueToSet.match(urlRegex)) {
//           return "url";
//         }
//       },
    
//       "number" : function(type, attributeName, model, valueToSet) {
//         return isNaN(valueToSet) ? 'number' : undefined;
//       },
    
//       "pattern" : function(pattern, attributeName, model, valueToSet) {
//         if (_.isString(valueToSet)) {
//           if (valueToSet.match(pattern)) {
//             return false;
//           } else {
//             return "pattern";
//           }
//         }
//       },
    
//       "min" : function(minimumValue, attributeName, model, valueToSet) {
//         if (valueToSet < minimumValue) {
//           return "min";
//         }
//       },
    
//       "max" : function(maximumValue, attributeName, model, valueToSet) {
//         if (valueToSet > maximumValue) {
//           return "max";
//         }
//       },
    
//       "minlength" : function(minlength, attributeName, model, valueToSet) {
//         if (_.isString(valueToSet)) {
//           if (valueToSet.length < minlength) { return "minlength"; }
//         }
//       },
    
//       "maxlength" : function(maxlength, attributeName, model, valueToSet) {
//         if (_.isString(valueToSet)) {
//           if (valueToSet.length > maxlength) { return "maxlength"; }
//         }
//       }





    
    })(helpers);

});