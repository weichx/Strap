Strap.getPipeline('build').__addPipelineStep({
    name: 'MergeAttributes',
    incomingEdges: [],
    outgoingEdges: ['CreateConstructorBody'],
    process: function(baseTypeData, typeData) {
        var baseNames = baseTypeData && baseTypeData.attrNames;
        var extendingNames = typeData.attrNames;
        var baseValues = baseTypeData && baseTypeData.attrValues;
        var extendingValues = typeData.attrValues;

        var names = (baseNames && baseNames.concat(extendingNames) ) || extendingNames;
        var values = (baseValues && baseValues.concat(extendingValues) ) || extendingValues;
        var finalNames = [];
        var finalValues = [];
        for (var i = names.length - 1; i >= 0; i--) {
            if (finalNames.indexOf(names[i]) === -1) {
                finalNames.push(names[i]);
                finalValues.push(values[i]);
            }
        }
        typeData.attrNames = finalNames;
        typeData.attrValues = finalValues;
    }
});