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

var CompileConstructorBody = {
    name: 'CompileConstructorBody',
    incomingEdges: ['MergeBaseClassAttributes'],
    outgoingEdges: ['CreateConstructorObject'],
    process: function (baseTypeData, extendingTypeData) {
        var compiledAttributes = [];
        var attrNames = extendingTypeData.attrNames;
        var attrValues = extendingTypeData.attrValues;
        for (var i = 0, il = attrNames.length; i < il; i++) {
            compiledAttributes.push('\tthis.', attrNames[i], ' = ', JSON.stringify((attrValues && attrValues[i]) || null), ';\n');
        }
        extendingTypeData.compiledConstructorBody = compiledAttributes.join("") + (extendingTypeData.constructorBody || '');
    }
};

var CreateConstructorObject = {
    name: 'CreateConstructorObject',
    incomingEdges: ['CompileConstructorBody'],
    outgoingEdges: ['CreatePrototype'],
    process: function (baseTypeData, extendingTypeData) {
        //eval might be `evil`, but it is the only solution I could find for this.
        //Kindly let me know if you come up with a better solution.
        var str = "";
        if (extendingTypeData.constructorArguments && typeof extendingTypeData.constructorArguments === 'string') {
            var args = extendingTypeData.constructorArguments.split(',');
            if (args[0] !== '') {
                for (var i = 0, il = args.length; i < il; i++) {
                    str += '\'' + args[i] + '\', ';
                }
            }
        }
        var functionStr = "Function(" + str + "extendingTypeData.compiledConstructorBody)";
        extendingTypeData.constructorObject = eval(functionStr);
    }
};

var CreatePrototype = {
    name: 'CreatePrototype',
    incomingEdges: ['CreateConstructorObject'],
    outgoingEdges: ['AppendFunctions'],
    process: function (baseTypeData, extendingTypeData) {
        extendingTypeData.proto = (baseTypeData && baseTypeData.proto && Object.create(baseTypeData.proto)) || null;
        //actual prototype is used for appending top level methods so we dont have duplicated garbage on sub prototypes
        extendingTypeData.actualPrototype = (baseTypeData && baseTypeData.proto && Object.create(baseTypeData.proto)) || null;
    }
};

var AppendFunctions = {
    name: 'AppendPrototypeFunctions',
    incomingEdges: ['CreatePrototype'],
    outgoingEdges: ['AttachPrototype'],
    process: function (baseTypeData, extendingTypeData) {

        var methodNames = extendingTypeData.methodNames;
        var methodBodies = extendingTypeData.methodBodies;
        if (methodNames.length !== 0 && !extendingTypeData.proto) {
            extendingTypeData.proto = {};
            extendingTypeData.actualPrototype = {};
        }
        for (var i = 0, il = methodNames.length; i < il; i++) {
            extendingTypeData.proto[methodNames[i]] = methodBodies[i];
            extendingTypeData.actualPrototype[methodNames[i]] = methodBodies[i];
        }
    }
};

var AttachPrototype = {
    name: 'AttachPrototype',
    incomingEdges: ['AppendFunctions'],
    outgoingEdges: [],
    process: function (baseTypeData, extendingTypeData) {
        extendingTypeData.constructorObject.prototype = extendingTypeData.actualPrototype;
    }
};

TypeCompiler.addPipelineStep(CompileConstructorBody);
TypeCompiler.addPipelineStep(CreateConstructorObject);
TypeCompiler.addPipelineStep(AppendFunctions);
TypeCompiler.addPipelineStep(AttachPrototype);
TypeCompiler.addPipelineStep(MergeBaseClassAttributes);
TypeCompiler.addPipelineStep(CreatePrototype);

__StrapInternals.defineClass('PipelineStep', function () {
    this.attr('processFunction');
    this.attr('incomingEdges', []);
    this.attr('outgoingEdges', []);
    this.attr('helpers', {}); //I dont like how this is handled
    this.attr('mark', false);
    this.attr('tempMark', false);
    this.attr('name');

    this.fn('requires', function(pipelineStepName) {
        //todo implement this
    });

    this.fn('conflict', function(pipelineStepName){
       //todo implement
    });

    this.fn('pipelineStep', function (fn) {
        this.process = fn;
    });

    this.fn('executeAfter', function () {
        for (var i = 0, il = arguments.length; i < il; i++) {
            if (typeof arguments[i] === 'string') {
                this.incomingEdges.push(arguments[i]);
            }
        }
    });

    this.fn('executeBefore', function () {
        for (var i = 0, il = arguments.length; i < il; i++) {
            if (typeof arguments[i] === 'string') {
                this.outgoingEdges.push(arguments[i]);
            }
        }
    });

    this.fn('applyToMixins', function(bool) {
        this.appliesToMixins = bool;
    });

    this.fn('helper', function (fnName, fnBody) {
        this.helpers[fnName] = fnBody;          //I dont like how this is handled
    });
});


