Strap.getPipeline('build').__addPipelineStep({
    name: 'AttachPrototype',
    incomingEdges: ['AppendPrototypeFunctions'],
    outgoingEdges: [],
    process: function (baseTypeData, extendingTypeData) {
        extendingTypeData.constructorObject.prototype = extendingTypeData.proto;
    }
});

Strap.defineExtension('BeforeAfter', {
    typeData: function() {
        this.attr('beforeCalls', {});
        this.fn('before', function() {

        });
    },

    build: function() {
        this.executeBefore('something');
        this.process(function(baseBuildData, buildData) {

        });
    },

    compile: function() {

    }

});