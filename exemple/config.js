new Backbone.Form({

    // <FORM> config -------------------
    // ---------------------------------
    className     : '',       // <form> 'class' attribute
    id            : '',       // <form> 'id' attribute
    action        : '',       // <form> 'action' attribute
    method        : 'post',   // <form> 'method' attribute


    // Fields data ---------------------
    // ---------------------------------
    data: {                   // Set the value attribute of elements
      id          : 123,
      name        : 'Pif Paf',
      password    : 'qwe'
    },

    // Fields schema / model -----------
    // ---------------------------------
    schema: {                  // Schema defines form fields
      id: {

      // Field editor -------
        editor: {
          type      : 'Number', // Default 'Text'
          el        : $('input[name="id"]'),
          value     : '',
          novalidate    : true, // optional, take the global config value by default
          options: {         // Collection for the editor
            value: 'label'
          },
          plugins: {            // Plugins for the editor

          },
          attr      : {}        // HTML attributes to add to the editor itself (select, input...)
        },
        // shorthand version
        editor: 'Number',

      // Field html ----------
        schema        : {}        // Nested schema

      // Field html ----------
        el            : $(''),    // jQuery element if it exists
        class         : '',       // field 'class' attribute
        id            : '',       // field 'id' attribute


        label         : '',       // Text in the field label


        validators: {
            required: true,
            minLength: 3,
            maxLength: 10,
            url: true, // true or a regex
        },
        append: true,           // default true, false if el is passed

        template: 'templatename' // reference one of the templates
      },
    }
    // or as a model
    collection: Backbone.Collection.extend({}),



    // fieldsets -----------------------
    // ---------------------------------
    fieldsets: [{
      legend: 'Legend',
      className: 'bla',
      fields: ['firstname', 'lastname']
    },{
      legend: 'Another Legend',
      fields: ['password', 'password_repeat']
    }],
    // or without legends
    fieldsets: [
      ['firstname', 'lastname'],
      ['password', 'password_repeat']
    ],


    // validation ----------------------
    // ---------------------------------
    validationTrigger: {
      select     : 'change',
      radio      : 'change',
      checkbox   : 'change',
      text       : 'blur',
      number     : 'blur',
    },


    // templates -----------------------
    // ---------------------------------
    templates: {
      templateName: '<div></div>'
    },




    novalidate    : true,          // skip HTML5 validation on fields
    messages???
    prefix         : ''            // prefix id, for and name attributes of all form fields
    fieldClass    : 'field',
    editorClass   : 'editor',

});