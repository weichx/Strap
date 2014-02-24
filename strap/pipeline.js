Pipeline = function (name) {
    this.name = name;
    this.steps = [];
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
