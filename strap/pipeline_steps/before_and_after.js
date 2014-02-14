TypeCompiler.defineExtension('BeforeAndAfterHooks', function () {
    this.attr('beforeFunctions', {});
    this.attr('afterFunctions', {});
    this.attr('beforeAndAfter', {});

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
    this.executeAfter('CreateConstructorObject');
    this.executeBefore('AppendFunctions');

    //todo support string syntax for before / after in addition to function literal
    this.pipelineStep(function beforeAndAfterPipelineStep(baseTypeData, typeData) {
        var methodNames = typeData.methodNames;
        var methodBodies = typeData.methodBodies;

        //attach some properties to the type's constructor object.
        //these will be available when the type is complete as MyType.__befores etc
        typeData.constructorObject.__befores = {};
        typeData.constructorObject.__afters = {};
        typeData.constructorObject.__actuals = {};
        var statics = typeData.constructorObject;

        //collect all the function names that were declared to have some function
        //invoked before or after them, store their names in an array on the
        //constructor object for later processing.
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

        //for every method on this object (NOT IT'S BASE CLASS!), determine if that method
        //has any before or after functionality. If it has either, we redefine the function
        //so that all of the before methods are called, then the actual function, then all
        //the after functions. The final call body would like this for a type like Strap.Book
        //and a method like read.
        //function(arg0, arg1) {
        //  Strap.Book.__befores[0].call(this, arg0, arg1);
        //  var retn = Strap.Book.__actuals.read(arg0, arg1);
        //  Strap.Book.__afters[0].call(this, arg0, arg1);
        //  Strap.Book.__afters[1].call(this, arg0, arg1);
        //  return retn;
        //}
        //Note that all functions that have a hand in either before or after
        //are relocated to the Type itself rather than remaining on its
        //prototype like other functions. This is so we do not crowd the
        //prototype with garbage looking values upon inspection.
        for (var i = 0, il = methodNames.length; i < il; i++) {
            var methodName = methodNames[i];
            var methodBody = methodBodies[i];
            var befores = statics.__befores[methodName];
            var afters = statics.__afters[methodName];
            var actuals = statics.__actuals;

            if (befores || afters) {

                var methodBodyString = Object.toString.call(methodBody);
                var bodyString = '';    //contains the `compiled` body of the function
                var argumentStart = methodBodyString.indexOf('(') + 1;
                var argumentEnd = methodBodyString.indexOf(')');
                var argumentString = methodBodyString.slice(argumentStart, argumentEnd); //gets the functions' arguments
                var splitArguments = argumentString.split(','); //we need this for parameters to Function constructor
                var seperatedArguments = "";

                //surround arguments with single quotes
                if (splitArguments[0] !== '') {
                    for (var z = 0, zl = splitArguments.length; z < zl; z++) {
                        seperatedArguments += '\'' + splitArguments[z] + '\', ';
                    }
                }

                //if we have arguments, prepend a comma
                if (argumentString !== '') {
                    argumentString = ', ' + argumentString;
                }

                //for each before declaration for a type, construct a function call site
                var callString = '.call(this' + argumentString + ');';
                if (befores) {
                    bodyString += 'var befores = ' + typeData.fullPath + '.__befores.' + methodName + ';';
                    for (var k = 0, kl = statics.__befores[methodName].length; k < kl; k++) {
                        bodyString += "befores[" + k + "]" + callString;
                    }
                }
                //invoke the original function and store its return value for later
                actuals[methodName] = methodBodies[i];
                bodyString += 'var retn = ' + typeData.fullPath + '.__actuals.' + methodName + callString;

                //for each after declaration for a type, construct a function call site
                //todo -- consider passing in the original functions return value to after calls as the first parameter
                if (afters) {
                    bodyString += 'var afters = ' + typeData.fullPath + '.__afters.' + methodName + ';';
                    for (k = 0, kl = statics.__afters[methodName].length; k < kl; k++) {
                        bodyString += "afters[" + k + "]" + callString;
                    }
                }
                bodyString += 'return retn;';
                //construct the actual function using eval, this is the only way I know of
                //to get dynamic arguments into a function.
                var functionStr = "Function(" + seperatedArguments + "bodyString)";
                methodBodies[i] = eval(functionStr);
            }
        }
    });
});