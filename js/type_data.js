(function () {
    var TypeDataTemplate = function () {
        this.attrNames = [];
        this.attrDefaults = [];
        this.methodNames = [];
        this.methodBodies = [];
        this.baseClassTypeName = null;
        this.basicPrototype = null;
    };

    TypeDataTemplate.prototype.attr = function (attrName, defaultValue) {
        //assert not function
        if (typeof defaultValue === 'function') {
            console.error('attr cannot be function');
            return;
        }
        this.attrNames.push(attrName);
        this.attrDefaults.push(defaultValue);
    };

    TypeDataTemplate.prototype.fn = function (fnName, fnBody) {
        if (typeof fnBody !== 'function') {
            console.error('must be function');
            return;
        }
        this.methodNames.push(fnName);
        this.methodBodies.push(fnBody);
    };

    //used for extending TypeData
    var TypeDataObject = new TypeDataTemplate();
    TypeDataObject.attrNames.push(
        'attrNames',
        'attrDefaults',
        'methodNames',
        'methodBodies',
        'baseClassTypeName',
        'basicPrototype'
    );

    TypeDataObject.attrDefaults.push(
        [], [], [], [], null, null
    );

    TypeDataObject.methodNames.push(
        'attr', 'fn'
    );

    TypeDataObject.methodBodies.push(
        TypeDataTemplate.prototype.attr, TypeDataTemplate.prototype.fn
    );

    StrapInternals.TypeDataTempate = TypeDataTemplate;
    StrapInternals.TypeDataObject = TypeDataObject;
})();