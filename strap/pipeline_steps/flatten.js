TypeCompiler.defineExtension('Flatten', function () {
    this.attr('shouldFlatten', false);
    this.fn('flatten', function () {
        this.shouldFlatten = true;
    });
}, function () {
    this.executeBefore('AppendFunctions');
    this.pipelineStep(function (baseTypeData, extendingTypeData) {
        if(extendingTypeData.shouldFlatten) {

        }
    });
});