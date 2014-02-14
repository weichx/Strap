TypeCompiler.defineExtension('Parent', null, function () {
        this.executeBefore('AppendFunctions');
        this.pipelineStep(function (baseClassTypeData, extendingTypeData) {
            if(baseClassTypeData) {
                extendingTypeData.methodNames.push('parent');
                extendingTypeData.methodBodies.push(this.helpers.parentFunction);
            }
        });

        this.helper('parentFunction', function () {
            var parent = Object.getPrototypeOf(Object.getPrototypeOf(this));
            if(parent) {
                return parent;
            } else {
                throw new Error("Unable to call `parent` because this object does not have a parent");
            }

        });
    }
);

