/*
 The output will look like so:
 Strap.MyClass = function(x,y) {
 //mixin attributes
 this.someMixinAttr = x + y;
 //type attributes
 this.x = x;
 this.y = y;
 //base class constructor
 Strap.MyBaseClass.call(this, x, y);
 //constructor body as defined by user
 }

 Strap.inheritPrototype(Strap.MyClass, Strap.MyBaseClass)

 Strap.MyClass.prototype.someMethod = function(){};

 Strap.MyClass.someStatic = 5;
 */
var attachProperties = function(attachPoint, names, values) {
    if(!names || !values) return '';
    Strap.assert(Array.isArray(names) && Array.isArray(values), 'expected an array');
    Strap.assert(names.length === values.length, 'expected equal length arrays');
    var retn = [];
    for (var i = 0, il = names.length; i < il; i++) {

        //todo when the value is an object, cant stringify since it may have functions
        var value = null;
        if(typeof values[i] === 'function') {
            value = values[i];
        } else{
            value = JSON.stringify(values[i]);
        }
        retn.push(attachPoint, '.', names[i], ' = ', value, ';\n');
    }
    return retn.join("");
};

Strap.getPipeline('compile').steps = [
    {
        name: 'ConstructorAttrs',
        incomingEdges: ['OpenConstructor'],
        outgoingEdges: ['CloseConstructor'],
        processFn: function(baseTypeData, typeData) {
            typeData.typeAsString +=  attachProperties('this', typeData.attrNames, typeData.attrValues);
        }
    }, {
        name: 'CloseConstructor',
        incomingEdges: ['OpenConstructor'],
        outgoingEdges: ['AttachPrototypeFunctions'],
        processFn: function(baseTypeData, typeData) {
            typeData.typeAsString +=  '};\n';
        }
    }, {
        name: 'AttachPrototypeFunctions',
        incomingEdges: ['CloseConstructor'],
        outgoingEdges: [],
        processFn: function(baseTypeData, typeData) {
            typeData.typeAsString +=  attachProperties(typeData.fullPath + '.prototype', typeData.methodNames, typeData.methodBodies);
        }
    }, {
        name: 'OpenConstructor',
        incomingEdges: [],
        outgoingEdges: ['ConstructorAttrs'],
        processFn: function(baseTypeData, typeData) {
            typeData.typeAsString =  typeData.fullPath + ' = function(' + (typeData.constructorArguments || '') + ') {\n';
        }
    }
];

TypeGenerator.defineExtension('BasicCompileSteps', {
    compileData: function () {
        this.fn('attachProperties', attachProperties);
    },

    compile: [
        function(){
            this.stepName('InvokeBaseConstructor');
            this.executeAfter('ConstructorAttrs');
            this.executeBefore('CloseConstructor');
            this.process(function(baseTypeData, typeData) {
                var baseConstructorArguments = baseTypeData && ',' + baseTypeData.constructorArguments;
                typeData.typeAsString += (baseTypeData && baseTypeData.fullPath + '.call(this' + baseConstructorArguments + ');\n') || '';
            });
        },

        function() {
            this.stepName('InheritPrototype');
            this.executeAfter('CloseConstructor');
            this.process(function(baseTypeData, typeData) {
                typeData.typeAsString += (baseTypeData && 'Strap.inheritPrototype(' + typeData.fullPath + ',' + baseTypeData.fullPath + ');\n') || '';
            });
        },

        function() {
            this.stepName('AttachStatics');
            this.executeAfter('CloseConstructor', 'AttachPrototypeFunctions');
            this.process(function(baseTypeData, typeData) {
                typeData.typeAsString += this.attachProperties(typeData.fullPath, typeData.staticNames, typeData.staticValues);
            });
        }
    ]
});

//        function() {
//            this.stepName('ConstructorMixinAttrs');
//            this.executeAfter('ConstructorAttrs');
//            this.executeBefore('CloseConstructor');
//            this.process(function(baseTypeData, typeData) {
//                return this.attachProperties('this', typeData.mixinAttrNames, typeData.mixinAttrValues);
//            });
//        },


//        function() {
//            this.stepName('MixinFunctions');
//            this.executeAfter('CloseConstructor');
//            this.executeBefore('InheritPrototype');
//            this.process(function(baseTypeData, typeData) {
//                var retn = [];
//                for(var i = 0, il = typeData.mixins.length; i < il; i++){
//                    retn.push(typeData.mixinNames[i], '.call(', typeData.fullPath, '.prototype);\n');
//                }
//                return retn.join("");
//            });
//        },