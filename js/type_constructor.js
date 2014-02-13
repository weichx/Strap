window.StrapTypeConstructor = {
    buildPipeline: ['processAttributes', 'processFunctions' /*,'addStandardFunctions'*/],
    typesToBuild: [],
    typeTemplateRegistry: {},
    typeDataRegistry: {},
    internalTypeDataRegistry: {
        'TypeData' : StrapInternals.TypeDataObject
    },
    internalTypeTemplateRegistry: {
        'StrapInternals/TypeData' : StrapInternals.TypeDataTempate
    }
};

StrapTypeConstructor.defineClass = function (namespace, className, baseClassName, baseClassNamespace, buildFn) {

    //todo: instead of rebuilding type templates on every reopen, only rebuild the 'dirty' ones when we define a class

    var typeData = new this.internalTypeTemplateRegistry['StrapInternals/TypeData']();
    typeData.baseClassTypeName = baseClassNamespace + '/' + baseClassName;
    var fullTypeName = namespace + '/' + className;
    this.typeDataRegistry[fullTypeName] = typeData;
    buildFn.call(typeData);
    this.typesToBuild.push(fullTypeName);
};

StrapTypeConstructor.reopenInternalClass = function (className, reopenFunction) {
    var typeData = this.internalTypeDataRegistry[className]; //not newed or reassigned
    reopenFunction.call(typeData);
    StrapTypeConstructor.buildInternalType(className); //rebuild the TYPE TEMPLATE here
    console.log(typeData);
};

StrapTypeConstructor.buildInternalType = function(className) {
    var typeData = this.internalTypeDataRegistry[className]; //bag o properties
    var baseClassTypeData = null;
    var finalBodyList = [];

    //for now just use 1 pipeline
    for(var i = 0, il = this.buildPipeline.length; i < il; i++){
        var output = this[this.buildPipeline[i]](baseClassTypeData, typeData);
        if(typeof output === 'string') {
            finalBodyList.push(output);
        }
    }

    var finalBodyString = finalBodyList.join("");
    var finalType = Function(finalBodyString);
    finalType.prototype = typeData.basicPrototype;
    this.internalTypeTemplateRegistry['StrapInternals/' + className] = finalType;
    console.log(this.internalTypeTemplateRegistry);
    //maybe attach to window object?
};

StrapTypeConstructor.reopenClass = function (namespace, className, reopenFunction) {
    var typePath = namespace + '/' + className;
    var typeData = this.typeDataRegistry[typePath];
    if (typeData) {
        reopenFunction.call(typeData);
    } else {
        console.error('no class ' + typePath + ' exists. cannot reopen');
    }
};

StrapTypeConstructor.buildTypes = function () {
    //for now process in the order they are found
    for (var i = 0, il = this.typesToBuild.length; i < il; i++) {
        var typeName = this.typesToBuild[i];
        var typeData = this.typeDataRegistry[typeName];

        var baseClassTypeName = typeData.baseClassTypeName;
        var baseClassTypeData = this.typeDataRegistry[baseClassTypeName];
        var finalBodyList = [];
        for (var pipe = 0, totalPipelineLength = this.buildPipeline.length; pipe < totalPipelineLength; pipe++) {
            //if output returns a string, it will become part of the constructor of the type.
            var output = this[this.buildPipeline[pipe]](baseClassTypeData, typeData);
            if (typeof output === "string") {
                finalBodyList.push(output);
            }
        }
        var finalBodyString = finalBodyList.join("");
        var finalType = Function(finalBodyString);
        finalType.prototype = typeData.basicPrototype;
        this.typeTemplateRegistry[typeName] = finalType;
        //maybe attach to window object?
        console.log(typeName, new finalType());
    }
};

//temp
StrapTypeConstructor.create = function (path) {
    return new this.typeTemplateRegistry[path]();
};



















StrapTypeConstructor.processAttributes = function (baseClassTypeData, extendingClassTypeData) {
    var output = StrapTypeConstructor.combineAttributes(
        baseClassTypeData && baseClassTypeData.attrNames,
        extendingClassTypeData.attrNames,
        baseClassTypeData && baseClassTypeData.attrDefaults,
        extendingClassTypeData.attrDefaults
    );

    extendingClassTypeData.attrNames = output.combinedNames;
    extendingClassTypeData.attrDefaults = output.combinedValues;
    return output.attrAsString;
};

StrapTypeConstructor.combineAttributes = function (baseNames, extendingNames, baseValues, extendingValues) {
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
    var attrString = [];
    for (var j = 0, jl = finalNames.length; j < jl; j++) {
        attrString.push('this.', finalNames[j], '=', JSON.stringify((finalValues && finalValues[j]) || null), ';');
    }
    return {
        combinedNames: finalNames,
        combinedValues: finalValues,
        attrAsString: attrString.join("")
    }
};

StrapTypeConstructor.processFunctions = function (baseClassTypeData, extendingClassTypeData) {
    if (baseClassTypeData && baseClassTypeData.basicPrototype) {
        extendingClassTypeData.basicPrototype = Object.create(baseClassTypeData.basicPrototype);
    } else {
        extendingClassTypeData.basicPrototype = {};
    }

    var methodNames = extendingClassTypeData.methodNames;
    var methodBodies = extendingClassTypeData.methodBodies;

    for (var i = 0, il = methodNames.length; i < il; i++) {
        extendingClassTypeData.basicPrototype[methodNames[i]] = methodBodies[i];
    }
};

StrapPipeline = function() {
    this.steps = [];
};

StrapPipeline.prototype.insertStep = function(step, stepLocation, relativeStep) {
    var index = -1;
    for(var i = 0, il = this.steps.length; i < il; i++){
        if(this.steps[i].name === relativeStep) {
            index = i;
            break;
        }
    }
    if(index === -1) {
        console.error('Failed to locate pipeline step: ' + relativeStep);
    }
    stepLocation = stepLocation.trim();
    if(stepLocation === 'before') {
        index--;
    } else if(stepLocation === 'after') {
        index++;
    } else {
        console.error(stepLocation + ' is not a valid location. Valid locations are `before` and `after`');
    }
    this.steps.splice(index, 0, step);
};





















