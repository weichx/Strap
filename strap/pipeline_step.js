var MergeBaseClassAttributes = {
    name: 'MergeBaseClassAttributes',
    incomingEdges: [],
    outgoingEdges: ['CreateConstructorBody'],
    process: function (baseTypeData, extendingTypeData) {
        var baseNames = baseTypeData && baseTypeData.attrNames;
        var extendingNames = extendingTypeData.attrNames;
        var baseValues = baseTypeData && baseTypeData.attrValues;
        var extendingValues = extendingTypeData.attrValues;

        var names = (baseNames && baseNames.concat(extendingNames) ) || extendingNames;
        var values = (baseValues && baseValues.concat(extendingValues) ) || extendingValues;
        var finalNames = [];
        var finalValues = [];
        for (var i = names.length - 1; i >= 0; i--) {
            if (finalNames.indexOf(names[i]) === -1) {
                finalNames.push(names[i]);
                finalValues.push(values[i]);
            }
        }
        extendingTypeData.attrNames = finalNames;
        extendingTypeData.attrValues = finalValues;
    }
};

var CreateConstructorBody = {
    name: 'CreateConstructorBody',
    incomingEdges: ['MergeBaseClassAttributes'],
    outgoingEdges: ['CreateConstructorObject'],
    process: function (baseTypeData, extendingTypeData) {
        var compiledAttributes = [];
        var attrNames = extendingTypeData.attrNames;
        var attrValues = extendingTypeData.attrValues;
        for (var i = 0, il = attrNames.length - 1; i < il; i++) {
            compiledAttributes.push('\tthis.', attrNames[i], ' = ', JSON.stringify((attrValues && attrValues[i]) || null), ';\n');
        }
        compiledAttributes.push('\tthis.', attrNames[attrNames.length - 1], ' = ', JSON.stringify((attrValues && attrValues[attrValues.length - 1]) || null), ';');
        extendingTypeData.constructorBody = compiledAttributes.join("");
    }
};

var CreateConstructorObject = {
    name: 'CreateConstructorObject',
    incomingEdges: ['CreateConstructorBody'],
    outgoingEdges: ['CreatePrototype'],
    process: function (baseTypeData, extendingTypeData) {
        //todo inject constructor arguments
        extendingTypeData.constructorObject = Function(extendingTypeData.constructorBody);
    }
};

var CreatePrototype = {
    name: 'CreatePrototype',
    incomingEdges: ['CreateConstructorObject'],
    outgoingEdges: ['AppendFunctions'],
    process: function (baseTypeData, extendingTypeData) {
        extendingTypeData.proto = (baseTypeData && Object.create(baseTypeData.proto)) || {};
    }
};

var AppendFunctions = {
    name: 'AppendFunctions',
    incomingEdges: ['CreatePrototype'],
    outgoingEdges: ['AttachPrototype'],
    process: function (baseTypeData, extendingTypeData) {
        if (extendingTypeData.proto) {
            var methodNames = extendingTypeData.methodNames;
            var methodBodies = extendingTypeData.methodBodies;
            for (var i = 0, il = methodNames.length; i < il; i++) {
                extendingTypeData.proto[methodNames[i]] = methodBodies[i];
            }
        }
    }
};

var AttachPrototype = {
    name: 'AttachPrototype',
    incomingEdges: ['AppendFunctions'],
    outgoingEdges: [],
    process: function (baseTypeData, extendingTypeData) {
        extendingTypeData.constructorObject.prototype = extendingTypeData.proto;
    }
};

TypeCompiler.addPipelineStep(MergeBaseClassAttributes);
TypeCompiler.addPipelineStep(CreateConstructorBody);
TypeCompiler.addPipelineStep(CreateConstructorObject);
TypeCompiler.addPipelineStep(CreatePrototype);
TypeCompiler.addPipelineStep(AppendFunctions);
TypeCompiler.addPipelineStep(AttachPrototype);

TypeCompiler.defineClass(window, 'PipelineStep', null, null, function () {
    this.attr('processFunction');
    this.attr('incomingEdges', []);
    this.attr('outgoingEdges', []);
    this.attr('mark', false);
    this.attr('tempMark', false);
    this.attr('name');

    this.fn('pipelineStep', function (fn) {
        this.process = fn;
    });

    this.fn('executeAfter', function (afterStepName) {
        this.incomingEdges.push(TypeCompiler.pipelineSteps[afterStepName]);
    });

    this.fn('executeBefore', function (beforeStepName) {
        this.outgoingEdges.push(TypeCompiler.pipelineSteps[beforeStepName]);
    });
});

TypeCompiler.defineExtension('Static', function () {

    this.attr('statics', {});
    this.fn('static', function(prop, val) {
        this.statics[prop] = val;
    });

}, function () {
    this.executeAfter('CreateConstructorObject');
    this.executeBefore('CreatePrototype');

    this.pipelineStep(function (baseTypeData, extendingTypeData) {
        var statics = extendingTypeData.statics;
        for(var key in statics) {
            if(statics.hasOwnProperty(key)){
                extendingTypeData.constructorObject[key] = statics[key];
            }
        }
    });
});

TypeCompiler.defineClass(window, 'Book', null, null, function() {
    this.attr('mmk');
    this.static('somethingStatic', 'FUCKING WORKS!');
});