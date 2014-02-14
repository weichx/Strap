//Add an option to pre compile the pipeline only
//todo name all functions so we don't get 'anonymous function' in logs
//todo require all extentions to declare what they do and which TypeData variables they manipulate.
//todo require all extensions to show which attrs and functions are added to TypeData(can this be inferred?)
//todo do not allow whitespace in attribute or function names -- causes vm crashes due to the way we are constructing functions -- call trim?
//todo test that before/after only moves functions around when calling on base class fron super class
/*
 * Extension Ideas
 *   before / after hooks
 *   before / after chain -> acts like a pipeline, each step in the chain receives the previous method's return value
 *   getter / setter
 *   Object.defineProperty w/ getter / setter
 *   eventing
 *   logging
 *   debugger statement
 *   static
 *   abstract
 *   interface -> might not be an extension
 *   debug mode
 *   debug mode param validation
 *   computedProperty
 *   mixin
 *   flatten -> bring all sub prototype methods to top level prototype, destroys prototype chain (and base TypeData?)
 *   parent
 *   standardMethods -> adds a set of methods to the top level prototype
 *
 *   //model
 *   hasOne
 *   hasMany
 *   validate
 *   error
 *
 *
 * */