


(function () {

    var TypeConstructor = function () {
        this.completedTypes = {};
        this.typeDataRegistry = {};
    };

    TypeCompiler.prototype.construct = function () {
        /*
         * Hooks
         * Before Process
         * Before Attrs
         * After Attrs
         * */
        var typeData = new TypeData();

        var fn = Function(compiledAttributes);
        fn.prototype = Object.create();

        var move = function () {
            typeData.beforeHooks(arguments);
            var res = method();
            res = afterHooks(res, arguments);
            return res;
        };

        //proxy to get/set, saves user from needing to call get/set
        //might be slower due to closures, but simpler
        Object.defineProperty(o, 'x', {
            get: function () {
                return this.get('x');
            },

            set: function (value) {
                return this.set('x', value);
            }
        });
    };

    var StrapInternals = {
        defineModule: function (module, fn) {
            //check that we aren't mid app
            if (Strap.initialized) { /*fail*/
            }
        }
    };

    StrapInternals.defineModule('Model', function () {

        Strap.Model = function () {

        };

        typeConstructor.propertyPipeline.insertAfter('attrs', 'hasMany');

    });

    //adds stuff to TypeData
    //since TypeData was redefined, we need to rebuild it while keeping the same
    //(but extended) TypeData object. only the final type template is rebuilt
    Strap.defineModule('ComputedProperty', function() {
        StrapInternals.reopenClass('TypeData', function() {
            this.attr('__strapComputedProperties', {});

            this.fn('computed', name, dependencies, function() {
                this.__strapComputedProperties[name] = {};
            });

            this.after('set', function(property, value) {
                //after set, mark all properties that this is a dependency on dirty
            });

            this.before('get', function(property) {
                //before getting the computed property, if property is dirty, recompute
            });
        });
    });



    Strap.reopenClass('TypeData', function() {
        this.fn('static', function(name, value) {
            //prototype value
        });
    });

    Strap.defineModule('BeforeAndAfter', function () {
        StrapInternals.reopenClass('TypeData', function () {
            this.attr('afterHooks', {});
            this.attr('beforeHooks', {});
            this.fn('after', function (methodName, fn) {
                var typeData = StrapInternals.typeConstructor.getTypeData('TypeData');
                if (!typeData.afterHooks[methodName]) {
                    typeData.afterHooks[methodName] = [];
                }
                typeData.afterHooks[methodName].push(fn);
            });

            this.fn('before', function (methodName, fn) {
                var typeData = StrapInternals.typeConstructor.getTypeData('TypeData');
                if (!typeData.beforeHooks[methodName]) {
                    typeData.beforeHooks[methodName] = [];
                }
                typeData.beforeHooks[methodName].push(fn);
            });
        });
    });

    Strap.defineModule('Model', function() {

    });

    Strap.defineModule('Model.RestAdapter', function () {

    });

    Model.defineModule('FirebaseAdapter', function () {

    });


    Strap.defineModule('stuff', function () {
        Strap.ensureModule('BeforeAndAfter');

        StrapInternals.reopenClass('TypeData', function () {
            this.fn('log', function (action, conditionFn, message) {

            });

            this.fn('debug').debug('before', '');

            this.beforeDebug('log', function(action, condition, message){
                //validate params or something
            });
        });

        StrapInternals.reopenClass('TypeData', function () {
            this.fn('break', when, action, conditionFn, message);
        });

        Strap.ensureModuleLoaded('Model');
        StrapInternals.reopenClass('TypeData', function () {
            this.fn('validate');
        });

        StrapInternals.reopenClass('TypeData', function () {
            this.attr('initializer', null);

            this.after('create', 'init');

            this.fn('init', function (fn) {
                this.initializer = fn;
            });
        });
    });

    Strap.initialize(); //creates all classes after loading all modules
})();

Strap.namespace('EducateOnline').defineClass('Student : Model', function () {
    this.attr('obj', {});
});

var student = new EducateOnline.Student() ;

Strap.defineModel('Student', function () {

});

var pilot = new Pilot();


//Steps to load Strap
//include strap.js
//define all modules or include compiled versions
//define all classes or include compiled versions
//call Strap.initialize();
