StrapInternals.reopenClass('TypeData', function() {
    this.attr('statics', {});
    this.fn('static', function(property, value) {
        this.statics[property] = value;
    });
});

StrapInternals.definePipelineStep('Statics', function() {
    this.requirePipelineStep('');
    this.beforeStepComplete('');

    this.fn('process', function() {

    });
});


StrapInternals.getPipeline('Class').addStep('Statics');

var StaticPipelineStep = function(baseTypeData, extendingTypeData) {
    var statics = extendingTypeData.statics;
    for(var key in statics) {
        if(statics.hasOwnProperty(key)) {
            extendingTypeData.typeConstructor[key] = statics[key];
        }
    }
};


StrapInternals.reopenClass('TypeData', function () {
    this.attr('afterHooks', {});
    this.attr('beforeHooks', {});

    this.fn('after', function (methodName, fn) {
        if (!this.afterHooks[methodName]) {
            this.afterHooks[methodName] = [];
        }
        this.afterHooks[methodName].push(fn);
    });

    this.fn('before', function (methodName, fn) {
        if (!this.beforeHooks[methodName]) {
            this.beforeHooks[methodName] = [];
        }
        this.beforeHooks[methodName].push(fn);
    });

});

Strap.defineType('Model : Strap.Class', function() {
    //takes all of class's shit

});

Strap.defineType('Model', 'ModelData : TypeData', function() {

});

Strap.defineClass('Person', function() {
    this.attr('firstName');
    this.static('school', 'Pomfret');

    this.before('something', function() {
        console.log('it works!');
    })
});

Strap.defineClass('Matt : Person', function() {
    this.attr('lastName');

    this.fn('code', function() {
        console.log('coding');
    });

//    this.before('code', function() {
//       console.log('calling code!');
//    });
});
//


Strap.initialize();
