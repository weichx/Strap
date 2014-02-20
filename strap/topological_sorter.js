TopologicalSorter = {
    UNMARKED: 0,
    TEMP_MARK: 1,
    PERM_MARK: 2
};

TopologicalSorter.sort = function(toSortList, referenceNameProperty, incomingPropertyName, outgoingPropertyName ) {
    var sorted = [], lookUp = {}, n;
    this.setup(toSortList, referenceNameProperty, lookUp);
    this.buildAdjacencyLists(toSortList, lookUp, referenceNameProperty, incomingPropertyName, outgoingPropertyName);

    while (n = this.getUnmarkedNode(toSortList)) {
        this.visit(sorted, n);
    }
    return sorted;
};

TopologicalSorter.buildAdjacencyLists = function(toSortList, lookUp, referenceNameProperty, incomingPropertyName, outgoingPropertyName) {
    for(var i = 0, il = toSortList.length; i < il; i++){
        var node = toSortList[i];
        for(var j = 0, jl = node[incomingPropertyName].length; j < jl; j++){
            var name = node[incomingPropertyName][j];
            var reference = lookUp[name];
            Strap.assert(reference, "TopSort: Looked for " + name +
                " as an edge of " + node[referenceNameProperty] + " but it was not found.");
            if(reference.adjList.indexOf(node[referenceNameProperty]) !== -1){
                reference.adjList.push(node);
            }
        }

        for(j = 0, jl = node[outgoingPropertyName].length; j < jl; j++){
            name = node[outgoingPropertyName][j];
            reference = lookUp[name];
            Strap.assert(reference, "TopSort: Looked for " + name +
                " as an edge of " + node[referenceNameProperty] + " but it was not found.");
            if(reference.adjList.indexOf(name) === -1) {
                node.adjList.push(reference);
            }
        }
    }
};

TopologicalSorter.setup = function(toSortList, nameProperty, lookUp) {
    for(var i = 0, il = toSortList.length; i < il; i++){
        var ref = toSortList[i];
        var name = ref[nameProperty];
        ref.adjList = [];
        ref.mark = this.UNMARKED;
        lookUp[name] = ref;
    }
};

TopologicalSorter.visit = function(sorted, node) {
    Strap.assert(node.mark !== this.TEMP_MARK, "You have a cycle!");
    if(node.mark === this.UNMARKED) {
        node.mark = this.TEMP_MARK;
        for(var i = 0, il = node.adjList.length; i < il; i++){
            this.visit(sorted, node.adjList[i]);
        }
        node.mark = this.PERM_MARK;
        sorted.unshift(node);
    }
};

TopologicalSorter.getUnmarkedNode = function(nodes) {
    for(var i = 0, il = nodes.length; i < il; i++){
        if(nodes[i].mark !== this.PERM_MARK){
            return nodes[i];
        }
    }
    return null;
};