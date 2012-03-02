new Backbone.Form({
    data: {                       // Data to populate the form with
      id: 123,
      name: 'Rod Kimble',
      password: 'cool beans'
    },
    schema: {                     // Fields of the form
        id: {                     // Field id
          // type: 'Number'
          editor: {
            type: 'Number'
            el:
            schema: {

            }
          },
          OR
          editor: 'Number'

          append: true,           // default true, false if el is passed
          class
          id                      // id for the field
          title                   // title of the label
          el                      // el if there is an existing dom element
          validators: {
              required: true,
              minLength: 3,
              maxLength: 10,
              url: true, // true or a regex
            }
          idPrefix // prefix id to use for the fields and label
          template: 'templatename' // reference one of the templates
        },

        // FIELD
        name:       {},

        // FIELD
        password:   { type: 'Password' }
    }
    model
    fieldsets: [
      ['id'],
      ['name', 'password']
    ]
    // OR
    fieldsets: {
      legend: 'Legend',
      fields: [
        ['id'],
        ['name', 'password']
      ]
    },
     messages???
    templates: {
      templatename: '<div></div>'
    }

    // fields
    // idPrefix
});