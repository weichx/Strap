TypeCompiler.defineExtension('Flatten', function () {
    this.attr('shouldFlatten', false);
    this.fn('flatten', function () {
        this.shouldFlatten = true;
    });
}, function () {
    this.executeBefore('AppendFunctions');
    this.pipelineStep(function (baseTypeData, extendingTypeData) {
        if(extendingTypeData.shouldFlatten) {

        }
    });
});

/**
 *  for each mixin
 *      if mixin has a base class, make sure we dont double mix
 *      if mixin is already mixed (to anything in the baseclasses or the current type or another in use mixin), skip
 *      otherwise, do a mixin only run of build pipeline
 *      then merge the result with the built typedata
 *      then do the whole pipeline + add the type's base class if one exists
 *
 *      typeData = typeData.merge(mixin[0].merge(mixin[1]));
 */

