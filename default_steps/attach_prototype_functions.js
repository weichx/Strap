Strap.getPipeline('build').__addPipelineStep({
    name: 'AppendPrototypeFunctions',
    incomingEdges: ['CreatePrototype'],
    outgoingEdges: ['AttachPrototype'],
    process: function (baseTypeData, extendingTypeData) {

        var methodNames = extendingTypeData.methodNames;
        var methodBodies = extendingTypeData.methodBodies;
        if (methodNames.length !== 0 && !extendingTypeData.proto) {
            extendingTypeData.proto = {};
        }
        for (var i = 0, il = methodNames.length; i < il; i++) {
            extendingTypeData.proto[methodNames[i]] = methodBodies[i];
        }
    }
});