Strap.getPipeline('build').__addPipelineStep({
    name: 'CreateConstructorFunction',
    incomingEdges: ['CreateConstructorBody'],
    outgoingEdges: ['CreatePrototype'],
    process: function (baseTypeData, extendingTypeData) {
        //eval might be `evil`, but it is the only solution I could find for this.
        //Kindly let me know if you come up with a better solution.
        var str = "";
        if (extendingTypeData.constructorArguments && typeof extendingTypeData.constructorArguments === 'string') {
            var args = extendingTypeData.constructorArguments.split(',');
            if (args[0] !== '') {
                for (var i = 0, il = args.length; i < il; i++) {
                    str += '\'' + args[i] + '\', ';
                }
            }
        }
        var functionStr = "Function(" + str + "extendingTypeData.compiledConstructorBody)";
        extendingTypeData.constructorObject = eval(functionStr);
    }
});