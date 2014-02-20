TypeCompiler = {
    pipeline: [],
    pipelineSteps: {},
    mixins: {}
};

TypeCompiler.defineClass = function (namespaceObject, className, baseClassNamespace, baseClassName, mixins, buildFunction) {
    var typeData = new TypeData(className);
    typeData.baseTypeData = (
        baseClassNamespace &&
            baseClassNamespace[baseClassName] &&
            baseClassNamespace[baseClassName].typeData
        );
    typeData.fullPath = namespaceObject.getPath() + '.' + className;
    buildFunction.call(typeData);
    var mixinTypeDataArray = [];
    for (var i = 0, il = mixins.length; i < il; i++) {
        var mixinName = mixins[i];
        if (this.mixins[mixinName]) {
            mixinTypeDataArray.push(this.mixins[mixinName]);
        }
    }
    namespaceObject._typeAttachPoint[className] = this.buildClass(typeData, mixinTypeDataArray);
    namespaceObject._typeAttachPoint[className].typeData = typeData;
};

//for the moment, mixins cannot mixin other mixins or extend base classes.
//when I get around to this, I can use topological sort to sift through dependencies
TypeCompiler.defineMixin = function (mixinName, buildFunction) {
    if (this.mixins[mixinName]) {
        throw new Error("Mixin `" + mixinName + "` already exists!");
    }
    var typeData = new TypeData('Mixin:' + mixinName);
    typeData.fullPath = mixinName;
    buildFunction.call(typeData);
    this.mixins[mixinName] = typeData;
};

TypeCompiler.buildClass = function (typeData, mixins) {
    mixins = mixins || [];
    typeData.mixins = this.computeMixinsForType(typeData, mixins);
    for (var i = 0, il = mixins.length; i < il; i++) {
        for (var j = 0, jl = this.pipeline.length; j < jl; j++) {
            this.pipeline[j].processMixin && this.pipeline[j].processMixin(mixins[i], typeData);
        }
    }
    for (i = 0, il = this.pipeline.length; i < il; i++) {
        this.pipeline[i].process(typeData.baseTypeData, typeData);
    }

    typeData.compiledType = typeData.constructorObject;
    return typeData.compiledType;
};

//todo this needs work
TypeCompiler.computeMixinsForType = function (typeData, mixins) {
    if(typeData.baseTypeData) {
        var retn = [];
        //compare mixins to base class mixins
        //take all mixins ! in base class, add to retn []
        return retn;
    } else {
        return mixins;
    }
};

TypeCompiler.defineExtension = function (extensionName, typeDataFunction, pipelineFunction) {
    if (typeDataFunction && typeof typeDataFunction === 'function') {
        typeDataFunction.call(TypeDataMetaData);
        TypeData = this.buildClass(TypeDataMetaData);
    }
    if (pipelineFunction && typeof  pipelineFunction === 'function') {
        var pipelineData = new __StrapInternals.PipelineStep();
        pipelineData.name = extensionName;
        pipelineFunction.call(pipelineData);
        this.addPipelineStep(pipelineData);
    }
};

TypeCompiler.addPipelineStep = function (pipelineStep) {
    if (!pipelineStep || !pipelineStep.process || typeof pipelineStep.process !== 'function') {
        throw new Error("Pipeline steps must define a function `process`")
    }
    this.pipelineSteps[pipelineStep.name] = pipelineStep;
    this.pipeline.push(pipelineStep);
    this.sortPipeline();
};

TypeCompiler.showPipelineSteps = function () {
    for (var i = 0, il = this.pipeline.length; i < il; i++) {
        console.log(this.pipeline[i].name);
    }
};

//builds the adjacency list for the topological sort executed in sortPipeline
TypeCompiler.buildAdjacencyLists = function () {
    var pipeline = this.pipeline;
    for (var i = 0, il = pipeline.length; i < il; i++) {
        pipeline[i].adjList = [];
    }

    var hasEdge = function (list, edge) {
        for (var z = 0, zl = list.length; z < zl; z++) {
            if (list[z] === edge) {
                return true;
            }
        }
        return false;
    };

    for (i = 0, il = pipeline.length; i < il; i++) {
        var node = pipeline[i];
        for (var j = 0, jl = node.incomingEdges.length; j < jl; j++) {
            var name = node.incomingEdges[j];
            var step = this.pipelineSteps[name];
            if (step) {
                if (!hasEdge(step.adjList, node.name)) {
                    step.adjList.push(node.name);
                }
            }
        }

        for (j = 0, jl = node.outgoingEdges.length; j < jl; j++) {
            name = node.outgoingEdges[j];
            step = this.pipelineSteps[name];
            if (step) {
                if (!hasEdge(node.adjList, name)) {
                    node.adjList.push(name);
                }
            }
        }
    }
};


//Performs a topological sort on the build pipeline to ensure steps are executed in the proper
//order and that no cycles exist in the pipeline
TypeCompiler.sortPipeline = function () {
    this.buildAdjacencyLists();
    var sorted = [];
    var n;

    for (var i = 0, il = this.pipeline.length; i < il; i++) {
        var node = this.pipeline[i];
        node.mark = false;
        node.tempMark = false;
    }

    var getUnmarkedNode = function (nodes) {
        for (var i = 0, il = nodes.length; i < il; i++) {
            if (nodes[i].mark === false) {
                return nodes[i];
            }
        }
        return null;
    };

    var visit = function (node) {
        if (node.tempMark) {
            throw new Error("Cycle found in the pipeline, ensure your declared build pipeline" +
                " extensions do not contain a cycle");
        }
        if (node.mark === false) {
            node.tempMark = true;
            for (var k = 0, kl = node.adjList.length; k < kl; k++) {
                visit(TypeCompiler.pipelineSteps[node.adjList[k]]);
            }
            node.mark = true;
            node.tempMark = false;
            sorted.unshift(node);
        }
    };

    while (n = getUnmarkedNode(this.pipeline)) {
        visit(n);
    }
    this.pipeline = sorted;
};

TypeCompiler.injectTypeFunctions = function (target) {
    target.prototype.defineClass = function (className, mixins, buildFunction) {
        if (mixins !== undefined && buildFunction === undefined) {
            buildFunction = mixins;
        }
        //todo check that mixins is a string or array (if string convert to array)
        if (typeof className !== 'string') throw new Error('first parameter must be string');
        if (typeof buildFunction !== 'function') throw new Error('second parameter must be a function');
        var split = className.split(':');
        if (split.length > 2) throw new Error("Invalid type declaration");

        className = split[0] && split[0].trim();
        var baseClassName = split[1] && split[1].trim();
        var baseClassNamespace = null;

        if (baseClassName) {
            var splitBaseClass = baseClassName.split('.');
            if (splitBaseClass.length === 1) {
                //no namespace given, use this one.
                //todo make sure its here
                if (this[baseClassName]) {
                    baseClassNamespace = this;
                } else {
                    throw new Error("The type `" + baseClassName + "` was found on namespace: " + this.getPath());
                }
            } else {
                baseClassNamespace = window;
                for (var i = 0, il = splitBaseClass.length - 1; i < il; i++) {
                    //todo error check
                    baseClassNamespace = baseClassNamespace[splitBaseClass[i]];
                }
            }
        }
        TypeCompiler.defineClass(this, className, baseClassNamespace, baseClassName, mixins, buildFunction);
    };

    target.prototype.defineMixin = function (mixinName, buildFunction) {
//        if (typeof mixinName !== 'string') throw new Error('first parameter must be string');
//        if (typeof buildFunction !== 'function') throw new Error('second parameter must be a function');
//        var split = mixinName.split(':');
//        if (split.length > 2) throw new Error("Invalid type declaration");
//
//        mixinName = split[0] && split[0].trim();
//        var mixinBaseName = split[1] && split[1].trim();
        //todo have mixins able to extend each other and mixin other mixins?
        mixinName = mixinName.trim();
        TypeCompiler.defineMixin(mixinName, buildFunction);
    };
};

//var inheritPrototype = function(childObject, parentObject) {
//    var copyOfParent = Object.create(parentObject.prototype);
//    copyOfParent.constructor = childObject;
//    childObject.prototype = copyOfParent;
//};