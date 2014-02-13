TypeData = function (typeName) {
    this.typeName = typeName;
    this.constructorArguments = '';
    this.constructorBody = null;
    this.constructorObject = null;
    this.compiledConstructorBody = null;
    this.proto = null;
    this.compiledType = null;
    this.baseTypeData = null;
    this.attrNames = [];
    this.attrValues = [];
    this.methodNames = [];
    this.methodBodies = [];
};

TypeData.prototype.attr = function(attrName, attrValue) {
    //ensure not overwritting?
    //ensure not function?
    this.attrNames.push(attrName);
    this.attrValues.push(attrValue);
};

TypeData.prototype.fn = function(fnName, fnBody) {
    //ensure fn?
    //ensure not overwriting?
    this.methodNames.push(fnName);
    this.methodBodies.push(fnBody);
};


TypeDataMetaData = {
    attrNames: [],
    attrValues: [],
    methodNames: [],
    methodBodies: [],
    constructorArguments: '',
    attr: TypeData.prototype.attr,
    fn: TypeData.prototype.fn
};

var t = new TypeData();

for(var key in t) {
    if(t.hasOwnProperty(key)) {
        TypeDataMetaData.attrNames.push(key);
        TypeDataMetaData.attrValues.push(t[key]);
    }
}

for(key in TypeData.prototype) {
    if(TypeData.prototype.hasOwnProperty(key)){
        TypeDataMetaData.methodNames.push(key);
        TypeDataMetaData.methodBodies.push(TypeData.prototype[key]);
    }
}
