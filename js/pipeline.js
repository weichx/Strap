var StrapPipeline = function() {
    this.steps = [];
    this.addStep('Attributes');
    this.addStep('Functions');
};

StrapPipeline.prototype.addStep = function(stepName) {
    var step = StrapInternals.PipelineSteps[stepName];
};