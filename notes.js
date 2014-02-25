//Add an option to pre compile the pipeline only
//todo name all functions so we don't get 'anonymous function' in logs
//todo require all extensions to declare what they do and which TypeData variables they manipulate.
//todo require all extensions to show which attrs and functions are added to TypeData(can this be inferred?)
//todo do not allow whitespace in attribute or function names -- causes vm crashes due to the way we are constructing functions -- call trim?
//todo test that before/after only moves functions around when calling on base class fron super class
//todo when comipiling, remove all code between /*#debugStart*/ /*#debugEnd*/ statements
/*
 * Extension Ideas
 *   DONE before / after hooks
 *   before / after chain -> acts like a pipeline, each step in the chain receives the previous method's return value
 *   DONE getter / setter
 *   Object.defineProperty w/ getter / setter
 *   eventing
 *   logging
 *   debugger statement
 *   DONE static
 *   abstract
 *   interface -> might not be an extension
 *   debug mode
 *   debug mode param validation
 *   computedProperty
 *   mixin
 *   flatten -> bring all sub prototype methods to top level prototype, destroys prototype chain (and base TypeData?)
 *   DONE parent
 *   standardMethods -> adds a set of methods to the top level prototype
 *   reference -> reference to a Strap type, enables observing and type checking
 *   referenceList -> array of references, enables observing, type checking
 *
 *   //model
 *   hasOne
 *   hasMany
 *   validate
 *   error
 **/

//Strap.defineClass('Vector3', function() {
//    this.cached('normal', ['x', 'y', 'z'], function() {
//        return Math.sqrt(this.x);
//    });
//    this.listen('camera', 'change');
//
//    this.reference('camera', 'Camera');
//    this.referenceList('players', 'Player', [new MyThing(), newMyThing()]);
//
//    this.observe('players', 'property', 'whatToDo');
//    this.observe('someReference', 'optional property', 'whatToDo');
//});


/*
4 attachment locations
    instance (this.x = 1)
    mixin (this.z = 1, this.something = function(){})
    prototype (this.method = fn)
    constructor (Strap.MyType.blah = 'blah')

output of build pipeline
    {
        instance variableName: [],
        instance variableValue: [],
        mixin variableName: [],
        mixin variableValue: [],
        mixin methodName: [],
        mixin methodValue: [],
        prototype variableName: [],
        prototype variableValue: [],
        constructor variableName: [],
        constructor variableValue: []
    }

output of compile pipeline

MyClass = function(constructor arguments) {
    //mixin attributes
    //attribute declarations: merged from base class?
    //myMixin.attributes.call(this);
    MyBaseClass.constructor.call(this, arguments);
    //constructor body
}

//inherit prototype
//mixins -> myMixin.functions.call(MyClass.prototype)

MyClass.prototype.somefn = function() {};

 */
