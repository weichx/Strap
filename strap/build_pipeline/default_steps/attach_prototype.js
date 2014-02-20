Strap.getPipeline('build').__addPipelineStep({
    name: 'AttachPrototype',
    incomingEdges: ['AppendPrototypeFunctions'],
    outgoingEdges: [],
    process: function (baseTypeData, extendingTypeData) {
        extendingTypeData.constructorObject.prototype = extendingTypeData.proto;
    }
});