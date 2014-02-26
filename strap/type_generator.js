TypeGenerator = {
    types: [],
    uncompiledTypeData: new TypeData(Strap, 'TypeData'),
    pipelines: {
        build: new Pipeline('build'),
        compile: new Pipeline('compile')
    }
};

TypeGenerator.buildPipelines = function() {
    //build all internal types, TypeData and 1 type per pipeline
    var build   = this.pipelines.build;
    var compile = this.pipelines.compile;
  //  build.sortSteps();
    compile.sortSteps();

   // build.run(null, build.typeMeta);
    compile.run(null, primitive);
    console.dir(primitive);
    new Function(primitive.typeAsString)();

   // compile.buildSteps();
};

TypeGenerator.generate = function () {
    var build   = this.pipelines.build;
    var compile = this.pipelines.compile;
    build.steps   = TopologicalSorter.sort(build.steps, 'name', 'incomingEdges', 'outgoingEdges');
    compile.steps = TopologicalSorter.sort(compile.steps, 'name', 'incomingEdges', 'outgoingEdges');
    this.types    = TopologicalSorter.sort(this.types, 'fullPath');

    var compiledTypes = [];
    for(var i = 0, il = this.types.length; i < il; i++) {
        this.pipelines.build.run(this.types[i]);
        this.pipelines.compile.run(this.types[i]);
        compiledTypes.push(this.types[i]);
    }
    return compiledTypes;
};

TypeGenerator.getPipeline = function (pipelineName) {
    Strap.assert(this.pipelines[pipelineName], "Pipeline `" + pipelineName + "` does not exist!");
    return this.pipelines[pipelineName];
};

TypeGenerator.defineClass = function (className, classNamespace, baseClassName, baseClassNamespace, mixins, buildFunction) {
    this.types.push(className);
};

//this should call any extension functions per pipeline on the meta data object for that pipeline
TypeGenerator.defineExtension = function(extensionName, extensionObject) {
    if(extensionObject.typeData) {
        extensionObject.typeData.call(this.uncompiledTypeData);
    }
    for(var key in this.pipelines) {
        if(this.pipelines.hasOwnProperty(key)) {
            if(extensionObject[key]) {
                //queue for later if function
                //todo handle validating these
                if(Array.isArray(extensionObject[key])) {
                    for(var i = 0, il = extensionObject[key].length; i < il; i++){
                        this.pipelines[key].queueStep(extensionObject[key][i]);
                    }
                } else {
                    this.pipelines[key].queueStep(extensionObject[key]);
                }
            }
            if(extensionObject[key + 'Data']) {
                extensionObject[key + 'Data'].call(primitive);//this.pipelines[key].typeMeta);
            }
        }
    }
};

TypeGenerator.buildTypes = function () {
    for (var i = 0, il = sorted.length; i < il; i++) {
        var typeNode = sorted[i];
        var typeData = new TypeData(typeNode.fullPath);
        var baseTypeData = typeNode.baseClassPath && this.types[typeNode.baseClassPath];
        typeNode.buildFunction.call(typeData);
        this.buildClass(baseTypeData, typeData);
        this.generateCode(typeData);
    }
};

TypeGenerator.ensureUniqueMixins = function (baseTypeData, typeData) {
    if (baseTypeData) {
        var baseMixins = baseTypeData.mixins;
        var concatMixins = baseMixins.concat(typeData.mixins);
        var finalMixinList = [];
        for (var i = concatMixins.length - 1; i >= 0; i--) {
            if (finalMixinList.indexOf(concatMixins[i]) === -1) {
                finalMixinList.push(concatMixins[i]);
            }
        }
        return finalMixinList;
    }
    return typeData.mixins;
};


