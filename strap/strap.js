window.Strap = {};

Strap.assert = function(condition, message) {
    if(!condition) throw new Error(message);
};

(function() {

    var Namespace = function(parent, name) {
        this._name = name;
        this._typeAttachPoint = this;
        this._path = '' + (parent && parent.__path) || '' + '.' + this._name;
    };

    Namespace.prototype.namespace = function(subspace) {
        return this._typeAttachPoint[subspace] || (this._typeAttachPoint = new Namespace(this, subspace));
    };

    Namespace.prototype.getPath = function() {
        return this._path;
    };

    Namespace.prototype.defineClass = function(className, mixins, buildFunction) {
        Strap.assert(TypeGenerator, "You must include TypeCompiler in order to define classes.");

    };

    Namespace.call(Strap, null, 'Strap');
    Strap.getPath = Namespace.prototype.getPath;
    Strap.defineClass = Namespace.prototype.defineClass;
    Strap.namespace = Namespace.prototype.namespace;

})();

Strap.getPipeline = function(pipelineName) {
    return TypeGenerator.getPipeline(pipelineName);
};

Strap.initialize = function() {
    TypeGenerator.buildDefaultPipelines();
    //TypeGenerator.generate();
};

Strap.inheritPrototype = function(childObject, parentObject) {
    var copyOfParent = Object.create(parentObject.prototype);
    copyOfParent.constructor = childObject;
    childObject.prototype = copyOfParent;
};