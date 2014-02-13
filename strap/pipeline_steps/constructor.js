TypeCompiler.defineExtension('Constructor', function () {

        this.attr('constructorFunction', null);
        this.fn('init', function(fn) {
            this.constructorFunction = fn;
        });

    }, function () {
        this.executeAfter('MergeBaseClassAttributes');
        this.executeBefore('CompileConstructorBody');

        this.pipelineStep(function (baseTypeData, extendingTypeData) {
            var constructorFunction = extendingTypeData.constructorFunction;
            if(constructorFunction) {
                var functionString = Object.toString.call(extendingTypeData.constructorFunction);
                var startIndex = functionString.indexOf('{') + 1;
                var endIndex = functionString.lastIndexOf('}');
                var body = functionString.slice(startIndex, endIndex);
                var argumentsStartIndex = functionString.indexOf('(') + 1;
                var argumentsEndIndex = functionString.indexOf(')');

                extendingTypeData.constructorArguments = functionString.slice(
                    argumentsStartIndex,
                    argumentsEndIndex
                );
                extendingTypeData.constructorBody = body;
            }
        });
    }
);
