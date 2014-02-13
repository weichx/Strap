//Strap is just a namespace, if StrapCompiler is included, then strap is injected with more methods,
//ie defining classes / pipeline steps. If the compiler is not included, it is expected that all
//necessary types are either injected into the js environment or code is output as though each
//class (not pipeline step) was hand written.

window.Strap = null;
(function() {
    var Namespace = function(name) {
        this.name = name;
    };

    Namespace.prototype.namespace = function(subspace) {
        if(!this[subspace]) {
            this[subspace] = new Namespace(subspace);
        }
        return this[subspace];
    };
    Strap = new Namespace('Strap');
})();

