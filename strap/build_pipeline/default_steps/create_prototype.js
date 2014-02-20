Strap.getPipeline('build').__addPipelineStep({
    name: 'CreatePrototype',
    incomingEdges: ['CreateConstructorFunction'],
    outgoingEdges: ['AppendPrototypeFunctions'],
    process: function (baseTypeData, extendingTypeData) {
        extendingTypeData.proto = (
            baseTypeData &&
            baseTypeData.proto &&
            Object.create(baseTypeData.proto)
        ) || null;
    }
});