test('get set', function () {
//
//    Strap.defineMixin('Observable', function() {
//        this.attr('__ObservableMixinListeners', {});
//
//        this.before('set', function(prop, value){
//
//        });
//
//        this.after('set', function(prop, value) {
//
//        });
//    });

//    Strap.defineClass('Vector3 : Point', /*['Observable'],*/ function () {
//        this.attr('x', 0);
//        this.attr('y', 0);
//        this.attr('z', 0);
//
//        this.cached('normal', ['x', 'y', 'z'], function () {
//            return Math.sqrt(this.x);
//        });
//
//    });

//    Strap.defineClass('Player', function() {
//        this.cached('orientation', ['forward', 'right', 'up'], function() {
//
//        });
//
//        this.listen('App.x', function() { console.log("forward changed")});
//
//
//        this.onChange('forward.x', function() {
//            //before set forward, delete old listener
//            //after set forward, create listener
//        });
//
//        this.beforeSet(function(prop, value) {
//            //for each listener
//                //call change prop
//        });
//    });
//
//    var beforeSetX = function() {
//        this._cached['orientation'] = false;
//    };
//
//    var orientation = function() {
//        if(this._cached['orientation']) {
//            return this._cached['orientationCache']
//        } else {
//            this._cached['orientationCache'] = Vector3.__cacheFunctions['orientation'].call(this);
//            return this._cached['orientationCache'];
//        }
//    };
//
//    var vec = new Vector3();
//    vec.set('x', 5);
//    vec.get('normal');

//    var start = window.performance.now();
//    for(var i = 0; i < 900000; i++) {
//    }
//
//    console.log(window.performance.now() - start);
//    start = window.performance.now();
//
//    for(var i = 0; i < 900000; i++){
//    }
//    console.log(window.performance.now() - start);

    expect(0);
});