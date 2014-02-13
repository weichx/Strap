(function() {
    window.StrapNamespace = function(name) {
        this.name = name;
        this.subNamespaces = {};
    };

    StrapNamespace.prototype.namespace = function(name) {
        if(!this.subNamespaces[name]) {
            this.subNamespaces[name] = new Namespace(this.name + '/' + name);
        }
        return this.subNamespaces[name];
    };

    StrapNamespace.prototype.defineClass = function(typeName, fn) {
        var typeNames = typeName.split(':');
        if(typeNames.length > 2) {
            console.error("Invalid type name: " + typeName);
        }
        var className = typeNames[0] && typeNames[0].trim();
        var baseClassName = typeNames[1] && typeNames[1].trim();
        var baseClassNamespace = this.name;
        StrapTypeConstructor.defineClass(this.name, className, baseClassName, baseClassNamespace, fn);
    };

    StrapNamespace.prototype.reopenClass = function(className, fn) {
        StrapTypeConstructor.reopenClass(this.name, className, fn);
    };
})();