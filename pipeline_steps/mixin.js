TypeCompiler.defineExtension('Mixin', function () {
    this.attr('mixins', []);
    this.fn('mixin', function (mixinName) {
        this.mixins.push(mixinName);
    });
}, function () {
    this.executeBefore('MergeBaseClassAttributes');
    this.pipelineStep(function(baseTypeData, extendingTypeData){

    });
//    for(var i = 0, il = extendingTypeData.mixins.length; i < il; i++){
        //consider just parsing a namespace string here
//        var mixin = Strap.mixins[extendingTypeData.mixins[i]];
//        if(mixin) {
//            mixin.call(extendingTypeData);
//        } else {
//            throw new Error("Mixin: " + extendingTypeData.mixins[i] +
//                " does not exist! Cannot mixin to " + extendingTypeData.typeName);
//        }
//    }
});


//merge attrs
//flatten other -> bring all sub proto fns non on proto to proto
//merge functions