//Strap is just a namespace, if StrapCompiler is included, then strap is injected with more methods,
//ie defining classes / pipeline steps. If the compiler is not included, it is expected that all
//necessary types are either injected into the js environment or code is output as though each
//class (not pipeline step) was hand written.

window.Strap = null;

(function() {

    var Namespace = function(parent, name) {
        this._name = name;
        this._typeAttachPoint = this;
        if(parent) {
            this._path = parent._path + '.' + this._name;
        } else {
            this._path = this._name;
        }
    };

    Namespace.prototype.namespace = function(subspace) {
        if(!this._typeAttachPoint[subspace]) {
            this._typeAttachPoint[subspace] = new Namespace(this, subspace);
        }
        return this._typeAttachPoint[subspace];
    };

    Namespace.prototype.getPath = function() {
        return this._path;
    };

    Namespace.prototype.defineClass = function(className, buildFunction) {
        throw new Error("You must include TypeCompiler in order to define classes.");
    };

    if(TypeCompiler) {
        TypeCompiler.injectTypeFunctions(Namespace);
    }
    Strap = new Namespace(null, 'Strap');
    Strap._typeAttachPoint = Strap;

    __StrapInternals = new Namespace(null, '__StrapInternals');

    //options:
    //ignoreStrapNamespace => objects are created on window instead of Strap
    //declutter => non user functions are pushed onto the Type and invoked with call. slightly less efficient
    //aggressiveInline => where possible, inline function calls. depending on the code being run this may mess with
                         //input variables and cause naming conflicts. no effort will be made to fix this.
    Strap.configure = function(obj) {
        if(obj && obj.ignoreStrapNamespace) {
            this._typeAttachPoint = window;
        }
    };
})();

