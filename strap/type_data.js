TypeData = function (typeName) {
    this.typeName = typeName;
    this.constructorBody = null;
    this.constructorObject = null;
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


TypeData.MetaData = {
    attrNames: [],
    attrValues: [],
    methodNames: [],
    methodBodies: [],
    attr: TypeData.prototype.attr,
    fn: TypeData.prototype.fn
};

var t = new TypeData();

for(var key in t) {
    if(t.hasOwnProperty(key)) {
        TypeData.MetaData.attrNames.push(key);
        TypeData.MetaData.attrValues.push(t[key]);
    }
}

for(key in TypeData.prototype) {
    if(TypeData.prototype.hasOwnProperty(key)){
        TypeData.MetaData.methodNames.push(key);
        TypeData.MetaData.methodBodies.push(TypeData.prototype[key]);
    }
}
//
//var fn = function() {
//    console.log(this.attr);
//};
//
//fn.call(TypeData.MetaData);
//console.log('done');