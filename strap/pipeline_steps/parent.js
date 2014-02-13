TypeCompiler.defineExtension('Parent', null, function () {

        this.executeBefore('AppendFunctions');
        this.pipelineStep(function (baseClassTypeData, extendingTypeData) {
            extendingTypeData.methodNames.push('parent');
            extendingTypeData.methodBodies.push(this.helpers.parentFunction);
        });

        this.fn('parentFunction', function () {
            return Object.getPrototypeOf(Object.getPrototypeOf(this));
        })
    }
);