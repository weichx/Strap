StrapInternals.PipelineStep = function() {
    this.process = null;
};

//this whole file is a todo
StrapInternals.definePipelineStep('BeforeAndAfter', function() {
    this.fn('process', function(baseTypeData, extendingTypeData) {
        //if parent function is being invoked, consider bringing it
        //forward (copying not moving) onto this level prototype
        var methodNames = extendingTypeData.methodNames;
        var methodBodies = extendingTypeData.methodBodies;
        var pathToStaticType = 'Strap.Person';
        for(var i = 0, il = methodNames.length; i < il; i++){

            var fn = function() {

            }
        }
    });
});

StrapTypeConstructor.registerPipelineStep('name', step);
StrapTypeConstructor.getPipeline('default').insertStep(StrapPipeline.Statics, 'before', 'BeforeAndAfter');
/*
* var move = function() {
*   var fns = Strap.Person.staticFns;
*   fns['before0'].apply(this, arguments);
*   var retn = fns['move'].apply(this, arguments);
*   fns['after0'].apply(this, arguments);
*   return retn;
* }
*
* */


