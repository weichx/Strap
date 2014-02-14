TypeCompiler.defineExtension('BeforeAndAfterHooks', function () {
    this.attr('beforeFunctions', {});
    this.attr('afterFunctions', {});

    this.fn('before', function (fnName, fnToExecute) {
        if (!this.beforeFunctions[fnName]) {
            this.beforeFunctions[fnName] = [];
        }
        this.beforeFunctions[fnName].push(fnToExecute);
    });

    this.fn('after', function (fnName, fnToExecute) {
        if (!this.afterFunctions[fnName]) {
            this.afterFunctions[fnName] = [];
        }
        this.afterFunctions[fnName].push(fnToExecute);
    });

}, function () {
    this.requires('Static');
    this.executeAfter('Static');
    this.executeBefore('AppendFunctions');

    //todo support string syntax for before / after in addition to function literal
    this.pipelineStep(function beforeAndAfterPipelineStep(baseTypeData, typeData) {
        var methodNames = typeData.methodNames;
        var methodBodies = typeData.methodBodies;
        var statics = typeData.statics;
        statics.__befores = {};
        statics.__afters = {};

        for (var key in typeData.beforeFunctions) {
            if (typeData.beforeFunctions.hasOwnProperty(key)) {
                statics.__befores[key] = [];
                var functionsToCall = typeData.beforeFunctions[key];
                for (var j = 0, jl = functionsToCall.length; j < jl; j++) {
                    statics.__befores[key].push(functionsToCall[j]);
                }
            }
        }

        for (key in typeData.afterFunctions) {
            if (typeData.afterFunctions.hasOwnProperty(key)) {
                statics.__afters[key] = [];
                functionsToCall = typeData.afterFunctions[key];
                for (j = 0, jl = functionsToCall.length; j < jl; j++) {
                    statics.__afters[key].push(functionsToCall[j]);
                }
            }
        }

        console.log('static befores', statics.__befores);
        console.log('static afters', statics.__afters);

        for (var i = 0, il = methodNames.length; i < il; i++) {
            var methodName = methodNames[i];
            var methodBody = methodBodies[i];
            var bodyString = "";
            var befores = statics.__befores[methodName];
            var afters = statics.__afters[methodName];
            var actuals = statics.__actuals = {};
            if (befores || afters) {

                if (befores) {
                    bodyString += 'var befores = ' + typeData.fullPath + '.__befores.' + methodName + ';';
                    for (var k = 0, kl = statics.__befores[methodName].length; k < kl; k++) {
                        bodyString += "befores[" + k + "].call(this);"
                    }
                }

                actuals[methodName] = methodBodies[i];
                bodyString += 'var retn = namespace.__actuals.' + methodName + '.call(this);';

                if (afters) {
                    bodyString += 'var afters = namespace.__afters.' + methodName + ';';
                    for (k = 0, kl = statics.__afters[methodName].length; k < kl; k++) {
                        bodyString += "afters[" + k + "].call(this);"
                    }
                }
                bodyString += '\treturn retn;';
                console.log(bodyString);
                methodBodies[i] = eval(bodyString);
            }
        }
    });
});