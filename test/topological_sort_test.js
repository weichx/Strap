module('TopSort');

test('Topsort works with only outgoing edges', function () {
    var nodes = [
        {name: 2, outgoing: [3], incoming: [], prop: 2},
        {name: 1, outgoing: [2], incoming: [], prop: 1},
        {name: 3, outgoing: [], incoming: [], prop: 3}
    ];

    var result = TopologicalSorter.sort(nodes, 'name', 'incoming', 'outgoing');
    var expected = [nodes[1], nodes[0], nodes[2]];
    for (var i = 0, il = result.length; i < il; i++) {
        equal(result[i], expected[i]);
    }
});

test('Topsort works with only incoming edges', function () {
    var nodes = [
        {name: 2, outgoing: [], incoming: [3], prop: 2},
        {name: 1, outgoing: [], incoming: [2], prop: 1},
        {name: 3, outgoing: [], incoming: [], prop: 3}
    ];

    var result = TopologicalSorter.sort(nodes, 'name', 'incoming', 'outgoing');
    var expected = [nodes[2], nodes[0], nodes[1]];
    for (var i = 0, il = result.length; i < il; i++) {
        equal(result[i], expected[i]);
    }
});

test('Topsort works with incoming and outgoing edges', function () {
    var nodes = [
        {name: 1, outgoing: [], incoming: [], prop: 1},
        {name: 2, outgoing: [1], incoming: [3], prop: 2},
        {name: 3, outgoing: [], incoming: [], prop: 3}
    ];
    var result = TopologicalSorter.sort(nodes, 'name', 'incoming', 'outgoing');
    var expected = [nodes[2], nodes[1], nodes[0]];
    for (var i = 0, il = result.length; i < il; i++) {
        equal(result[i], expected[i]);
    }
});

test('Topsort catches duplicates', function () {
    var nodes = [
        {name: 1, outgoing: [], incoming: [], prop: 1},
        {name: 1, outgoing: [], incoming: [], prop: 1},
        {name: 3, outgoing: [], incoming: [], prop: 3}
    ];
    throws(function () {
        TopologicalSorter.sort(nodes, 'name', 'incoming', 'outgoing');
    });
});

test('Topsort catches cycles', function () {
    var nodes = [
        {name: 1, outgoing: [1], incoming: [], prop: 1},
        {name: 2, outgoing: [], incoming: [], prop: 2},
        {name: 3, outgoing: [], incoming: [], prop: 3}
    ];

    throws(function () {
        TopologicalSorter.sort(nodes, 'name', 'incoming', 'outgoing');
    });
});