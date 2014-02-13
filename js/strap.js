var PipelineData = function () {
    this.attrNames = [];
    this.methodNames = [];
    this.methodBodies = [];
    this.processFunction = null;
};

PipelineData.prototype.process = function (fn) {
    if (typeof fn !== 'function') {
        console.log('error');
    }
    this.processFunction = fn;
};

PipelineData.prototype.fn = function (methodName, methodBody) {
    this.methodNames.push(methodName);
    this.methodBodies.push(methodBody);
};

var StrapPipelineConstructor = function () {

};


StrapPipelineConstructor.definePipelineStep = function (stepName, buildFn) {
    var pipelineData = new PipelineData();
    buildFn.call(pipelineData);

};

StrapPipelineConstructor.buildPipeline = function () {
    //build the pipeline builder
    //then for each other pipeline, build it
    for (var k = 0, kl = this.pipelineSteps.length; k < kl; k++) {
        this.buildPipelineStepData(pipeSteps[k]);
    }

    for (var i = 0, il = this.pipelines.length; i < il; i++) {
        var pipeline = this.pipelines[i];
        pipeline.orderSteps();

    }
};

(function () {
    StrapInternals.definePipelineStep = function (stepName, buildFn) {
        StrapPipelineConstructor.definePipelineStep(stepName, buildFn);
    };

    StrapInternals.pipelineSteps = {};
    StrapInternals.pipelines = {'Class': new StrapPipeline()};

    StrapInternals.getPipeline = function (pipelineName) {
        return this.pipelines[pipelineName];
    };

})();


StrapInternals.definePrimitive('PipelineData : TypeData', function () {

    this.fn('process', function (fn) {
        this.processFunction = fn;
    });

});

StrapInternals.defineType('Box : Rectangle', function () {

});

Strap.createType('Mixin', 'TypeData', function () {
    Strap.mixins = {};

    this.attr('mixins');
    this.fn('mixin', function (name) {

    });

    this.pipelineStep('Mixin', function (base, ext) {
        ext.mixins.each(function (mixin) {
            ext.attrNames.concat(mixin.attrNames);
            ext.methodBodies.concat(mixin.methodBodies);
        });
    });
});

StrapInternals.defineMixin('static', function () {
    this.attr('statics', {});
    this.fn('static', function (property, value) {
        this.statics[property] = value;
    });

    this.pipelineStep('Static', 'after:attr', function (baseTypeData, extendingTypeData) {

    });
});

StrapInternals.createType('Model', 'ModelData : TypeData', function () {
    this.mixin('static');
    this.mixin('beforeAndAfter');
    this.mixin('validation');
    this.mixin('modelMethods');

    this.requirePipelineStep('BeforeAndAfter');
    this.pipelineStep('Static');
    //creates entry on namespace
    //creates a default pipeline for it
    //creates a default data type, if extension syntax is used then bring forward all properties

    //methods here show up on ModelData's prototype.
    this.fn('save', function () {

    });
});


StrapInternals.createPipelineStep('Attributes', function () {
    this.process(function (baseTypeData, extendingTypeData) {

    });

    this.fn('combineAttributes', function () {

    });
});

StrapInternals.definePipelineStep('Functions', function () {

});

(function () {
    Strap.initialize = function () {
        StrapInternals.buildPipeline();
        StrapInternals.buildTypes();
    }
})();

Strap.defineExtension('BeforeAndAfterHooks', function () {
    this.attr('beforeHooks', {});
    this.attr('afterHooks', {});

    this.fn('before', function(beforeMethod, invokedMethod) {
        if (!this.beforeHooks[beforeMethod]) {
            this.beforeHooks[beforeMethod] = [];
        }

        this.beforeHooks[beforeMethod].push(invokedMethod);
    });

    this.fn('after', function() {

    });

}, function () {
    this.executeAfter('Static');
    this.assertAttributes('beforeHooks', 'afterHooks', 'statics');

    this.process(function(baseTypeData, extendingTypeData) {
        for(var key in extendingTypeData.beforeHooks) {
        }
    });
});