
new Backbone.Form({
    data: { id: 123, name: 'Rod Kimble', password: 'cool beans' }, //Data to populate the form with
    schema: {
        // FIELD
        id: { 
          // type: 'Number'
          editor: {
            type: 'Number'
            schema: {
              
            }
          }
          // OR
          editor: 'Number'

          append: true, // default true, false if el is passed
          class
          id // id for the field
          title // title of the label
          el // el if there is an existing dom element
          validator // array of validators
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
    errorClass: 's-error', // default s-error. On validation gets added if the test fails
    successClass: '', // empty by default. On validation gets added if the test passes

    templates: {
      templatename: '<div></div>'
    }

    // fields
    // idPrefix
})