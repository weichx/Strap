TypeGenerator = {
    typeNodes: {},
    types: [],
    pipelines: {
        build: new Pipeline('build'),
        compile: new Pipeline('compile')
    }
};

TypeGenerator.generate = function () {
    //sort pipeline
    //sort types
    //build build pipeline
    //build compile pipeline
    //build typeData -> likely needs eval
    //build types

    var build = this.pipelines.build;
    var compile = this.pipelines.compile;
    build.steps = TopologicalSorter.sort(build.steps, 'name', 'incomingEdges', 'outgoingEdges');
    compile.steps = TopologicalSorter.sort(compile.steps, 'name', 'incomingEdges', 'outgoingEdges');
//    TopologicalSorter.sort(this.types);
};

TypeGenerator.getPipeline = function (pipelineName) {
    Strap.assert(this.pipelines[pipelineName], "Pipeline `" + pipelineName + "` does not exist!");
    return this.pipelines[pipelineName];
};

TypeGenerator.defineClass = function (className, classNamespace, baseClassName, baseClassNamespace, mixins, buildFunction) {

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

TypeGenerator.buildClass = function (baseTypeData, typeData) {
    this.pipelines.build.run(baseTypeData, typeData);
};

TypeGenerator.generateCode = function (baseTypeData, typeData) {
    this.pipelines.compile.run(baseTypeData, typeData);
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