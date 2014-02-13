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
    if(typeDataFunction && typeof typeDataFunction === 'function') {
        typeDataFunction.call(TypeData.MetaData);
        TypeData = this.buildClass(TypeData.MetaData);
    }
    if(pipelineFunction && typeof  pipelineFunction === 'function') {
        var pipelineData = new PipelineStep();
        pipelineData.name = extensionName;
        pipelineFunction.call(pipelineData);
        this.addPipelineStep(pipelineData);
    }
};

TypeCompiler.addPipelineStep = function (pipelineStep) {
    if(!pipelineStep || !pipelineStep.process || typeof pipelineStep.process !== 'function') {
        throw new Error("Pipeline steps must define a function `process`")
    }
    this.pipelineSteps[pipelineStep.name] = pipelineStep;
    this.pipeline.push(pipelineStep);
    console.log(this.pipeline);
    this.topologicalSortPipeline();
};

TypeCompiler.topologicalSortPipeline = function() {
    //build an adjacency list
    var buildAdjacencyList = function(pipeline) {
        for(var i = 0, il = pipeline.length; i < il; i ++) {
            var node = pipeline[i];
            node.adjIncoming = [];
            for(var item in node.incomingEdges) {
                if(TypeCompiler.pipelineSteps[item]) {
                    node.adjIncoming.push(item);
                }
            }
        }
    };
    var L = [];
    var S = [];
    for(var i = 0, il = this.pipeline.length; i < il; i++) {
        var node = this.pipeline[i];
        node.mark = false;
        node.tempMark = false;
        node.tempIncomingEdges = node.incomingEdges.concat([]);
        node.tempOutgoingEdges = node.outgoingEdges.concat([]);
    }

    while(S.length > 0) {
        var n = S.shift();
        L.push(n);
        for(i = 0, il = n.tempOutgoingEdges.length; i < il; i++){
            var m = TypeCompiler.pipelineSteps[n.tempOutgoingEdges[i]];
            m.tempIncomingEdges.shift();
            if(m.tempIncomingEdges.length === 0) {
                S.push(m);
            }
        }

    }


//
//    var visit = function(node) {
//        console.log('visit');
//        if(node.tempMark) {
//            throw new Error("There is a circular dependency in defined extensions. Ensure that the pipeline steps you are adding do not have cycles");
//        }
//        if(!node.mark) {
//            node.tempMark = true;
//            for(var i = 0, il = node.incomingEdges.length; i < il; i++) {
//                visit(TypeCompiler.pipelineSteps[node.incomingEdges[i]]);
//            }
//            node.mark = true;
//            unmarkedNodes--;
//            sortedList.unshift(node);
//            console.log('unshift');
//        }
//    };
//
//    while (unmarkedNodes != 0) {
//        console.log('unmarked');
//        for (var j = 0, jl = this.pipeline.length; j < jl; j++) {
//            if (this.pipeline[j].mark === false) {
//                visit(this.pipeline[j]);
//                break;
//            }
//        }
//    }
//    this.pipeline = sortedList;
//    console.log(sortedList);
};

