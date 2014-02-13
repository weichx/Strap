TypeCompiler = {
    pipeline: [],
    pipelineSteps: {}
};

TypeCompiler.defineClass = function (namespaceObject, className, baseClassName, baseClassNamespace, buildFunction) {
    //if typeData is dirty, rebuild it?
    var typeData = new TypeData();
    typeData.baseTypeData = baseClassNamespace && baseClassNamespace[baseClassName];
    buildFunction.call(typeData);
    namespaceObject[className] = this.buildClass(typeData);
};

TypeCompiler.buildClass = function (typeData) {
    for (var i = 0, il = this.pipeline.length; i < il; i++) {
        this.pipeline[i].process(typeData.baseTypeData, typeData);
    }
    typeData.compiledType = typeData.constructorObject;
    return typeData.compiledType;
};

TypeCompiler.defineExtension = function (extensionName, typeDataFunction, pipelineFunction) {
    if (typeDataFunction && typeof typeDataFunction === 'function') {
        typeDataFunction.call(TypeData.MetaData);
        TypeData = this.buildClass(TypeData.MetaData);
    }
    if (pipelineFunction && typeof  pipelineFunction === 'function') {
        var pipelineData = new PipelineStep();
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
    this.buildAdjacencyLists();
    this.sortPipeline();
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

