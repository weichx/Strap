TypeCompiler = {
    pipeline: [],
    pipelineSteps: {},
    mixins: {},
    pipelineNeedsRebuilding: false
};

TypeCompiler.defineClass = function (namespaceObject, className, baseClassNamespace, baseClassName, buildFunction) {
    //if typeData is dirty, rebuild it?
    var typeData = new TypeData(className);
    typeData.baseTypeData = (
        baseClassNamespace &&
        baseClassNamespace[baseClassName] &&
        baseClassNamespace[baseClassName].typeData
    );
    typeData.fullPath = namespaceObject.getPath() + '.' + className;
    buildFunction.call(typeData);
    namespaceObject._typeAttachPoint[className] = this.buildClass(typeData);
    namespaceObject._typeAttachPoint[className].typeData = typeData;
};

TypeCompiler.defineMixin = function(mixinName, mixinBaseType, mixinMixins, buildFunction) {
    //remove any mixins from mixinMixins that are mixed into the mixin's base class
    //for each mixin mixed into mixin
        //mixin[i] = this.buildMixin(mixin[i], mixin[i + 1]);
    //
};

TypeCompiler.buildClass = function (typeData, mixins) {
    for (var i = 0, il = this.pipeline.length; i < il; i++) {
        this.pipeline[i].process(typeData.baseTypeData, typeData);
    }
    typeData.compiledType = typeData.constructorObject;
    return typeData.compiledType;
};

TypeCompiler.buildMixin = function(mixin1, mixin2) {
    for(var i = 0, il = this.pipeline.length; i < il; i++){
        if(this.pipeline[i].processMixin) {
            this.pipeline[i].processMixin(mixin1, mixin2);
        }
    }
    return mixin1;
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

TypeCompiler.showPipelineSteps = function() {
    for(var i = 0, il = this.pipeline.length; i < il; i++){
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
            if(step) {
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

    var getUnmarkedNode = function(nodes) {
        for(var i = 0, il = nodes.length; i < il; i++){
            if(nodes[i].mark === false) {
                return nodes[i];
            }
        }
        return null;
    };

    var visit = function(node) {
        if(node.tempMark) {
            throw new Error("Cycle found in the pipeline, ensure your declared build pipeline" +
                " extensions do not contain a cycle");
        }
        if(node.mark === false) {
            node.tempMark = true;
            for(var k = 0, kl = node.adjList.length; k < kl; k++) {
                visit(TypeCompiler.pipelineSteps[node.adjList[k]]);
            }
            node.mark = true;
            node.tempMark = false;
            sorted.unshift(node);
        }
    };

    while( n = getUnmarkedNode(this.pipeline)) {
        visit(n);
    }
    this.pipeline = sorted;
};

TypeCompiler.injectTypeFunctions = function(target) {
    target.prototype.defineClass = function(className, buildFunction) {
        if(typeof className !== 'string') throw new Error('first parameter must be string');
        if(typeof buildFunction !== 'function') throw new Error('second parameter must be a function');
        var split = className.split(':');
        if(split.length > 2) throw new Error("Invalid type declaration");

        className = split[0] && split[0].trim();
        var baseClassName = split[1] && split[1].trim();
        var baseClassNamespace = null;

        if(baseClassName) {
            var splitBaseClass = baseClassName.split('.');
            if(splitBaseClass.length === 1) {
                //no namespace given, use this one.
                //todo make sure its here
                if(this[baseClassName]) {
                    baseClassNamespace = this;
                } else {
                    throw new Error("The type `" + baseClassName + "` was found on namespace: " + this.getPath());
                }
            } else {
                baseClassNamespace = window;
                for(var i = 0, il = splitBaseClass.length - 1; i < il; i++) {
                    //todo error check
                    baseClassNamespace = baseClassNamespace[splitBaseClass[i]];
                }
            }
        }
        TypeCompiler.defineClass(this, className, baseClassNamespace, baseClassName, buildFunction);
    };

    target.prototype.defineMixin = function(mixinName, buildFunction) {
        if(typeof mixinName !== 'string') throw new Error('first parameter must be string');
        if(typeof buildFunction !== 'function') throw new Error('second parameter must be a function');
        var split = mixinName.split(':');
        if(split.length > 2) throw new Error("Invalid type declaration");

        mixinName = split[0] && split[0].trim();
        var mixinBaseName = split[1] && split[1].trim();


        TypeCompiler.defineMixin(mixinName, mixinBaseName, buildFunction);
    };
};