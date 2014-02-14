//"[Built in] this extension allows the declaration of static (class level) variables" +
//    "in a class. The syntax is trivial: `this.static(myPropertyName, myPropertyValue)`. The property" +
//    "can then be accessed via MyTypeName.myProperty."

TypeCompiler.defineExtension('Static', function () {
        this.attr('statics', {});
        this.fn('static', function (prop, val) {
            this.statics[prop] = val;
        });

    }, function () {
        this.executeAfter('CreateConstructorObject');
        this.executeBefore('CreatePrototype');

        this.pipelineStep(function (baseTypeData, extendingTypeData) {
            var statics = extendingTypeData.statics;
            for (var key in statics) {
                if (statics.hasOwnProperty(key)) {
                    extendingTypeData.constructorObject[key] = statics[key];
                }
            }
        });
    }
);