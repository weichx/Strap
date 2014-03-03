Pipeline = function (name) {
    this.name = name;
    this.steps = [];
    this.queuedSteps = [];
    var typeMetaName = name.charAt(0).toUpperCase() + name.slice(1, name.length) + 'PipelineData';
    //this.typeMeta = new PipelineStep(Strap, typeMetaName);
    //console.dir(this.typeMeta);
};

Pipeline.prototype.run = function(baseTypeDate, typeData) {
    for(var i = 0, il = this.steps.length; i < il; i++){
        this.steps[i].processFn(baseTypeDate, typeData);
    }
};

Pipeline.prototype.buildSteps = function() {
    for(var i = 0, il = this.queuedSteps.length; i < il; i++) {
        var pipelineStep = new Strap[this.typeMeta.name]();
        this.queuedSteps[i].call(pipelineStep);
        this.steps.push(pipelineStep);
    }
    this.sortSteps();
};

Pipeline.prototype.sortSteps = function() {
    this.steps = TopologicalSorter.sort(this.steps, 'name', 'incomingEdges', 'outgoingEdges');
};

Pipeline.prototype.queueStep = function(stepFn) {
    this.queuedSteps.push(stepFn);
};

Pipeline.prototype.showPipelineSteps = function() {
    for (var i = 0, il = this.steps.length; i < il; i++) {
        console.log(this.steps[i].name);
    }
};
