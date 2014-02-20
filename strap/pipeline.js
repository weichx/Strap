Pipeline = function (name) {
    this.name = name;
    this.steps = [];
    this.stepRegistry = {};
};

Pipeline.prototype.run = function(baseTypeDate, typeData) {
    for(var i = 0, il = this.steps.length; i < il; i++){
        this.steps[i].process(baseTypeDate, typeData);
    }
};

Pipeline.prototype.defineExtension = function(extensionName, typeDataFunction, pipelineFunction) {
    if(typeDataFunction && typeof typeDataFunction === 'function') {
        typeDataFunction.call(TypeDataMetaData);
        TypeData = TypeGenerator.buildClass(null, TypeDataMetaData);
    }
    if(pipelineFunction && typeof pipelineFunction === 'function') {
        var step = new PipelineStep(extensionName);
        pipelineFunction.call(step);
        this.__addPipelineStep(step);
    }
};

//this is used only for default pipeline steps
Pipeline.prototype.__addPipelineStep = function(step) {
    this.steps.push(step);
};

Pipeline.prototype.showPipelineSteps = function() {
    for (var i = 0, il = this.steps.length; i < il; i++) {
        console.log(this.steps[i].name);
    }
};

Pipeline.prototype.sortByDependencies = function () {
    this.__buildAdjacencyLists();
    var sorted = [], n;
    for (var i = 0, il = this.steps.length; i < il; i++) {
        var node = this.steps[i];
        node.__mark = false;
        node.__tempMark = true;
    }

    while (n = this.__getUnmarkedNode()) {
        this.__visit(sorted, n);
    }
    this.steps = sorted;
};

Pipeline.prototype.__buildAdjacencyLists = function () {
    var steps = this.steps;
    for (var i = 0, il = steps.length; i < il; i++) {
        steps[i].adjList = [];
    }

    for (i = 0, il = steps.length; i < il; i++) {
        var node = steps[i];
        for (var j = 0, jl = node.incomingEdges.length; j < jl; j++) {
            var name = node.incomingEdges[j];
            var step = this.stepRegistry[name];
            if (step && !this.__hasEdge(step.adjList, node.name)) {
                step.adjList.push(node.name);
            }
        }

        for (j = 0, jl = node.outgoingEdges.length; j < jl; j++) {
            name = node.outgoingEdges[j];
            step = this.stepRegistry[name];
            if (step && !this.__hasEdge(node.adjList, name)) {
                node.adjList.push(name);
            }
        }
    }
};

Pipeline.prototype.__hasEdge = function (list, edge) {
    for (var z = 0, zl = list.length; z < zl; z++) {
        if (list[z] === edge) {
            return true;
        }
    }
    return false;
};

Pipeline.prototype.__visit = function (sorted, node) {
    if (node.__tempMark) {
        throw new Error("Cycle found in the pipeline, ensure your declared build pipeline" +
            " extensions do not contain a cycle");
    }
    if (node.__mark === false) {
        node.__tempMark = true;
        for (var k = 0, kl = node.adjList.length; k < kl; k++) {
            this.__visit(TypeCompiler.pipelineSteps[node.adjList[k]]);
        }
        node.__mark = true;
        node.__tempMark = false;
        sorted.unshift(node);
    }
};

Pipeline.prototype.__getUnmarkedNode = function () {
    var nodes = this.steps;
    for (var i = 0, il = nodes.length; i < il; i++) {
        if (nodes[i].__mark === false) {
            return nodes[i];
        }
    }
    return null;
};