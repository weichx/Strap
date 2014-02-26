TypeGenerator = {
    types: [],
    pipelines: {
        build: new Pipeline('build'),
        compile: new Pipeline('compile')
    }
};

TypeGenerator.buildDefaultPipelines = function() {
    var build   = this.pipelines.build;
    var compile = this.pipelines.compile;
    build.steps   = TopologicalSorter.sort(build.steps, 'name', 'incomingEdges', 'outgoingEdges');
    //compile.steps = TopologicalSorter.sort(compile.steps, 'name', 'incomingEdges', 'outgoingEdges');
    var primitiveTypeData = new PrimitiveMeta();
    console.log(build.steps);
    this.pipelines.build.run(null, primitiveTypeData);
    debugger;
    //this.pipelines.compile.run(null, TypeDataMeta);
   // TypeData = eval(TypeData.__compiledType);
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
    if(extensionObject.buildData) {
        extensionObject.buildData.call(buildDataMeta);
    }
    if(extensionObject.typeData) {
        extensionObject.typeData.call(typeDataMeta);
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


