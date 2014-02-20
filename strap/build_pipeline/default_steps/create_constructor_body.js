Strap.getPipeline('build').__addPipelineStep({
    name: 'CreateConstructorBody',
    incomingEdges: ['MergeAttributes'],
    outgoingEdges: ['CreateConstructorFunction'],
    process: function (baseTypeData, extendingTypeData) {
        var compiledAttributes = [];
        var attrNames = extendingTypeData.attrNames;
        var attrValues = extendingTypeData.attrValues;
        for (var i = 0, il = attrNames.length; i < il; i++) {
            compiledAttributes.push('\tthis.', attrNames[i], ' = ', JSON.stringify((attrValues && attrValues[i]) || null), ';\n');
        }
        extendingTypeData.compiledConstructorBody = compiledAttributes.join("") + (extendingTypeData.constructorBody || '');
    }
});
