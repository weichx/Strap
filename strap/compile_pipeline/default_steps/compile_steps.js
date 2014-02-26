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

Strap.defineClass('CompileStep : PipelineStep', function() {
    this.fn('attachProperties', function(attachPoint, names, values) {
        Strap.assert(names.length && values.length, 'expected an array');
        Strap.assert(names.length === values.length, 'expected equal length arrays');
        var retn = [];
        for(var i = 0, il = names.length; i < il; i++){
            retn.push(attachPoint, '.', names[i], ' = ', values[i], ';\n');
        }
        return retn.join("");
    });
});

Strap.pipeline('compile').defineExtension('OpenConstructor', function() {
    this.process(function(baseTypeData, typeData) {
        return typeData.namespace + '.' + 'MyType = function(' + typeData.constructorArgs + ') {';
    });
});

Strap.pipeline('compile').defineExtension('ConstructorAttrs', function() {
    this.executeAfter('OpenConstructor');
    this.executeBefore('CloseConstructor');
    this.process(function(baseTypeData, typeData) {
        return this.attachProperties('this', typeData.attrNames, typeData.attrValues);
    });
});

Strap.pipeline('compile').defineExtension('ConstructorMixinAttrs', function() {
    this.executeAfter('ConstructorAttrs');
    this.executeBefore('CloseConstructor');
    this.process(function(baseTypeData, typeData) {
        return this.attachProperties('this', typeData.mixinAttrNames, typeData.mixinAttrValues);
    });
});

Strap.pipeline('compile').defineExtension('InvokeBaseConstructor', function() {
    this.executeAfter('ConstructorAttrs');
    this.executeBefore('CloseConstructor');
    this.process(function(baseTypeData, typeData) {
        var baseConstructorArguments = 'ARGUMENTS_GO_HERE';
        return (baseTypeData && baseTypeData.fullPath + '.call(this,' + baseConstructorArguments + ');\n') || null;
    });
});

Strap.pipeline('compile').defineExtension('CloseConstructor', function() {
    this.executeAfter('OpenConstructor');
    this.process(function(baseTypeData, typeData) {
        return '};\n';
    });
});

Strap.pipeline('compile').defineExtension('InheritPrototype', function() {
    this.executeAfter('CloseConstructor');
    this.process(function(baseTypeData, typeData) {
        return baseTypeData && 'Strap.inheritPrototype(' + typeData.fullPath + ',' + baseTypeData.fullPath + ');\n';
    });
});

Strap.pipeline('compile').defineExtension('MixinFunctions', function() {
    this.executeAfter('CloseConstructor');
    this.executeBefore('InheritPrototype');
    this.process(function(baseTypeData, typeData) {
        var retn = [];
        for(var i = 0, il = typeData.mixins.length; i < il; i++){
            retn.push(typeData.mixinNames[i], '.call(', typeData.fullPath, '.prototype);');
        }
        return retn;
    });
});

Strap.pipeline('compile').defineExtension('AttachStatics', function() {
    this.executeAfter('CloseConstructor');
    this.process(function(baseTypeData, typeData) {
        return this.attachProperties(typeData.fullPath, typeData.staticNames, typeData.staticValues);
    });
});


