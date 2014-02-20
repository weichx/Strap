TypeCompiler.defineExtension('GetSet', function () {
    this.attr('beforeSetFunctions', {});
    this.attr('beforeGetFunctions', {});
    this.attr('afterSetFunctions', {});
    this.attr('afterGetFunctions', {});

    this.fn('beforeSet', function (property, fn) {
        if (!this.beforeSetFunctions[property]) {
            this.beforeSetFunctions[property] = [];
        }
        this.beforeSetFunctions[property].push(fn);
    });

    this.fn('afterSet', function (property, fn) {
        if (!this.afterSetFunctions[property]) {
            this.afterSetFunctions[property] = [];
        }
        this.afterSetFunctions[property].push(fn);
    });

    this.fn('beforeGet', function (property, fn) {
        if (!this.beforeGetFunctions[property]) {
            this.beforeGetFunctions[property] = [];
        }
        this.beforeGetFunctions[property].push(fn);
    });

    this.fn('afterGet', function (property, fn) {
        if (!this.afterGetFunctions[property]) {
            this.afterGetFunctions[property] = [];
        }
        this.afterGetFunctions[property].push(fn);
    });

}, function () {
    this.executeAfter('AppendPrototypeFunctions');
    this.executeBefore('AttachPrototype');
    this.pipelineStep(function GetSetPipelineStep(baseTypeData, typeData) {
        //todo maybe inject a basic, faster method for get/set if Type is not observable
        if (typeData.fullPath) {
            if (!typeData.actualPrototype) {
                typeData.actualPrototype = {};
            }

            var findMethod = function (methodName, typeDataToSearch, depth) {
                var methodNames = typeDataToSearch.methodNames;
                var methodBodies = typeDataToSearch.methodBodies;
                for (var i = 0, il = methodNames.length; i < il; i++) {
                    if (methodNames[i] === methodName) {
                        if (depth > 0) {
                            typeData.methodNames.push(methodName);
                            typeData.methodBodies.push(methodBodies[i]);
                        }
                        return methodBodies[i];
                    }
                }
                if (typeDataToSearch.baseTypeData) {
                    return findMethod(methodName, typeDataToSearch.baseTypeData, ++depth);
                } else {
                    //todo error message needs to include namespace
                    throw new Error("Unable to find method `" + methodName + "` on type " + typeData.fullPath + " or any of its base classes");
                }
            };

            var ensureValidMemberMethods = function (objectToSearch) {
                for (var key in typeData[objectToSearch]) {
                    if (typeData[objectToSearch].hasOwnProperty(key)) {
                        var functions = typeData[objectToSearch][key];
                        for (var i = 0, il = functions.length; i < il; i++) {
                            if (typeof functions[i] === 'string') {
                                functions[i] = findMethod(functions[i], typeData, 0);
                            }
                        }
                    }
                }
            };

            ensureValidMemberMethods('beforeSetFunctions');
            ensureValidMemberMethods('beforeGetFunctions');
            ensureValidMemberMethods('afterSetFunctions');
            ensureValidMemberMethods('afterGetFunctions');

            var getFn = function () {
                var functionList = REPLACE.beforeGetFunctions[property];
                var length = functionList && functionList.length || 0;
                for (var i = 0, il = length; i < il; i++) {
                    functionList[i].call(context);
                }
                var retn = context[property];
                functionList = REPLACE.afterGetFunctions[property];
                length = functionList && functionList.length || 0;
                for (i = 0, il = length; i < il; i++) {
                    functionList[i].call(context);
                }
                return retn;
            };

            var setFn = function () {
                var functionList = REPLACE.beforeSetFunctions[property];
                var length = functionList && functionList.length || 0;
                for (var i = 0, il = length; i < il; i++) {
                    functionList[i].call(context, value);
                }
                context[property] = value;
                functionList = REPLACE.afterSetFunctions[property];
                length = functionList && functionList.length || 0;
                for (i = 0, il = length; i < il; i++) {
                    functionList[i].call(context, value);
                }
            };

            var get = getFn.toString().replace(/REPLACE/mg, typeData.fullPath);
            var set = setFn.toString().replace(/REPLACE/mg, typeData.fullPath);

            get = get.slice(get.indexOf('{') + 1, get.lastIndexOf('}'));
            set = set.slice(set.indexOf('{') + 1, set.lastIndexOf('}'));

            typeData.constructorObject.get = Function('context', 'property', get);
            typeData.constructorObject.set = Function('context', 'property', 'value', set);

            typeData.actualPrototype.get = Function('property', 'return ' + typeData.fullPath + '.get(this, property);');
            typeData.actualPrototype.set = Function('property', 'value', typeData.fullPath + '.set(this, property, value);');

            var merge = function (base, extending) {
                if (base) {
                    for (var key in base) {
                        if (base.hasOwnProperty(key)) {
                            if (!extending[key]) {
                                extending[key] = base[key];
                            } else {
                                extending[key] = extending[key].concat(base[key]);
                            }
                        }
                    }
                }
                return extending;
            };

            typeData.constructorObject.beforeSetFunctions = merge(baseTypeData && baseTypeData.beforeSetFunctions, typeData.beforeSetFunctions);
            typeData.constructorObject.beforeGetFunctions = merge(baseTypeData && baseTypeData.beforeGetFunctions, typeData.beforeGetFunctions);
            typeData.constructorObject.afterSetFunctions = merge(baseTypeData && baseTypeData.afterSetFunctions, typeData.afterSetFunctions);
            typeData.constructorObject.afterGetFunctions = merge(baseTypeData && baseTypeData.afterGetFunctions, typeData.afterGetFunctions);
        }
    });
});