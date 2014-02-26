PrimitiveMeta = function(namespace, name) {
    this.name = name;
    this.namespace = namespace;
    this.fullPath = namespace.getPath() + '.' + name;
    this.attrNames = [];
    this.attrValues = [];
    this.methodNames = [];
    this.methodBodies = [];
};

PrimitiveMeta.prototype.attr = function(attrName, attrValue) {
    this.attrNames.push(attrName);
    this.attrValues.push(attrValue || null);
};

PrimitiveMeta.prototype.fn = function(fnName, fnBody) {
    this.methodNames.push(fnName);
    this.methodBodies.push(fnBody);
};

TypeData = function(namespace, name) {
    PrimitiveMeta.call(this, namespace, name);
    this.constructorArguments = null;
    this.staticNames = [];
    this.staticValues = [];
    //consider removing these
    this.mixins = [];
    this.mixinNames = [];
    this.mixinValues = [];
};

Strap.inheritPrototype(TypeData, PrimitiveMeta);

var step = function() {
    this.attr('incomingEdges', []);
    this.attr('outgoingEdges', []);

    this.fn('process', function(fn) {
        this.processFn = fn;
    });

    this.fn('executeBefore', function() {
        for (var i = 0, il = arguments.length; i < il; i++) {
            if (typeof arguments[i] === 'string') {
                this.outgoingEdges.push(arguments[i]);
            }
        }
    });

    this.fn('executeAfter', function() {
        for (var i = 0, il = arguments.length; i < il; i++) {
            if (typeof arguments[i] === 'string') {
                this.incomingEdges.push(arguments[i]);
            }
        }
    });

    this.fn('stepName', function(name) {
        this.name = name;
    });
};

var primitive = new PrimitiveMeta(Strap, 'PipelineStep');
step.call(primitive);
