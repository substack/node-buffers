var test = require('tap').test;
var Buffers = require('../');

function create (xs, split) {
    var bufs = Buffers();
    var offset = 0;
    split.forEach(function (i) {
        bufs.push(new Buffer(xs.slice(offset, offset + i)));
        offset += i;
    });
    return bufs;
}

function deepEqual (t, xs, ys, msg) {
    t.deepEqual(
        Buffer.isBuffer(xs) ? [].slice.call(xs) : xs,
        Buffer.isBuffer(ys) ? [].slice.call(xs) : ys,
        msg
    );
}

test('slice', function (t) {
    var xs = [0,1,2,3,4,5,6,7,8,9];
    var splits = [ [4,2,3,1], [2,2,2,2,2], [1,6,3,1], [9,2], [10], [5,5] ];
    
    splits.forEach(function (split) {
        var bufs = create(xs, split);
        deepEqual(t, new Buffer(xs), bufs.slice(),
            '[' + xs.join(',') + ']'
                + ' != ' + 
            '[' + [].join.call(bufs.slice(), ',') + ']'
        );
        
        for (var i = 0; i < xs.length; i++) {
            for (var j = i; j < xs.length; j++) {
                var a = bufs.slice(i,j);
                var b = new Buffer(xs.slice(i,j));
                
                deepEqual(t, a, b,
                    '[' + [].join.call(a, ',') + ']'
                        + ' != ' + 
                    '[' + [].join.call(b, ',') + ']'
                );
            }
        }
    });
    t.end();
});

test('splice', function (t) {
    var xs = [0,1,2,3,4,5,6,7,8,9];
    var splits = [ [4,2,3,1], [2,2,2,2,2], [1,6,3,1], [9,2], [10], [5,5] ];
    
    splits.forEach(function (split) {
        for (var i = 0; i < xs.length; i++) {
            for (var j = i; j < xs.length; j++) {
                var bufs = create(xs, split);
                var xs_ = xs.slice();
                
                var a_ = bufs.splice(i,j);
                var a = [].slice.call(a_.slice());
                var b = xs_.splice(i,j);
                deepEqual(t, a, b,
                    '[' + a.join(',') + ']'
                        + ' != ' + 
                    '[' + b.join(',') + ']'
                );
                
                deepEqual(t, bufs.slice(), new Buffer(xs_),
                    '[' + [].join.call(bufs.slice(), ',') + ']'
                        + ' != ' + 
                    '[' + [].join.call(xs_, ',') + ']'
                );
            }
        }
    });
    t.end();
});

test('splice rep', function (t) {
    var xs = [0,1,2,3,4,5,6,7,8,9];
    var splits = [ [4,2,3,1], [2,2,2,2,2], [1,6,3,1], [9,2], [10], [5,5] ];
    var reps = [ [], [1], [5,6], [3,1,3,3,7], [9,8,7,6,5,4,3,2,1,2,3,4,5] ];
    
    splits.forEach(function (split) {
        reps.forEach(function (rep) {
            for (var i = 0; i < xs.length; i++) {
                for (var j = i; j < xs.length; j++) {
                    var bufs = create(xs, split);
                    var xs_ = xs.slice();
                    
                    var a_ = bufs.splice.apply(
                        bufs, [ i, j ].concat(new Buffer(rep))
                    );
                    var a = [].slice.call(a_.slice());
                    var b = xs_.splice.apply(xs_, [ i, j ].concat(rep));
                    
                    deepEqual(t, a, b,
                        '[' + a.join(',') + ']'
                            + ' != ' + 
                        '[' + b.join(',') + ']'
                    );
                    
                    deepEqual(t, bufs.slice(), new Buffer(xs_),
                        '[' + [].join.call(bufs.slice(), ',') + ']'
                            + ' != ' + 
                        '[' + [].join.call(xs_, ',') + ']'
                    );
                }
            }
        });
    });
    t.end();
}); 

test('copy', function (t) {
    var xs = [0,1,2,3,4,5,6,7,8,9];
    var splits = [ [4,2,3,1], [2,2,2,2,2], [1,6,3,1], [9,2], [10], [5,5] ];
    
    splits.forEach(function (split) {
        var bufs = create(xs, split);
        var buf = new Buffer(xs);
        
        for (var i = 0; i < xs.length; i++) {
            for (var j = i; j < xs.length; j++) {
                var t0 = new Buffer(j - i);
                var t1 = new Buffer(j - i);
                
                deepEqual(
                    t,
                    bufs.copy(t0, 0, i, j),
                    buf.copy(t1, 0, i, j)
                );
                
                deepEqual(t, t0, t1);
            }
        }
    });
    t.end();
});

test('push', function (t) {
    var bufs = Buffers();
    bufs.push(new Buffer([0]));
    bufs.push(new Buffer([1,2,3]));
    bufs.push(new Buffer([4,5]));
    bufs.push(new Buffer([6,7,8,9]));
    deepEqual(
        t,
        bufs.slice(),
        [0,1,2,3,4,5,6,7,8,9]
    );
    
    t.throws(function () {
        bufs.push(new Buffer([11,12]), 'moo');
    });
    t.equal(bufs.buffers.length, 4);
    t.end();
});

test('unshift', function (t) {
    var bufs = Buffers();
    bufs.unshift(new Buffer([6,7,8,9]));
    bufs.unshift(new Buffer([4,5]));
    bufs.unshift(new Buffer([1,2,3]));
    bufs.unshift(new Buffer([0]));
    deepEqual(
        t,
        bufs.slice(),
        [0,1,2,3,4,5,6,7,8,9]
    );
    t.throws(function () {
        bufs.unshift(new Buffer([-2,-1]), 'moo');
    });
    t.equal(bufs.buffers.length, 4);
    t.end();
});

test('get', function (t) {
    var bufs = Buffers();
    bufs.unshift(new Buffer([6,7,8,9]));
    bufs.unshift(new Buffer([4,5]));
    bufs.unshift(new Buffer([1,2,3]));
    bufs.unshift(new Buffer([0]));
    t.equal( bufs.get(0), 0 );
    t.equal( bufs.get(1), 1 );
    t.equal( bufs.get(2), 2 );
    t.equal( bufs.get(3), 3 );
    t.equal( bufs.get(4), 4 );
    t.equal( bufs.get(5), 5 );
    t.equal( bufs.get(6), 6 );
    t.equal( bufs.get(7), 7 );
    t.equal( bufs.get(8), 8 );
    t.equal( bufs.get(9), 9 );
    t.end();
});

test('set', function (t) {
    var bufs = Buffers();
    bufs.push(new Buffer("Hel"));
    bufs.push(new Buffer("lo"));
    bufs.push(new Buffer("!"));
    bufs.set(0, 'h'.charCodeAt(0) );
    bufs.set(3, 'L'.charCodeAt(0) );
    bufs.set(5, '.'.charCodeAt(0) );
    t.equal( bufs.slice(0).toString(), 'helLo.' );
    t.end();
});

test('indexOf', function (t) {
    var bufs = Buffers();
    bufs.push(new Buffer("Hel"));
    bufs.push(new Buffer("lo,"));
    bufs.push(new Buffer(" how are "));
    bufs.push(new Buffer("you"));
    bufs.push(new Buffer("?"));
    t.equal( bufs.indexOf("Hello"), 0 );
    t.equal( bufs.indexOf("Hello", 1), -1 );
    t.equal( bufs.indexOf("ello"), 1 );
    t.equal( bufs.indexOf("ello", 1), 1 );
    t.equal( bufs.indexOf("ello", 2), -1 );
    t.equal( bufs.indexOf("e"), 1 );
    t.equal( bufs.indexOf("e", 2), 13 );
    t.equal( bufs.indexOf("u?"), 17 );
    t.equal( bufs.indexOf("u?", 4), 17 );
    t.equal( bufs.indexOf("?"), 18 );
    t.equal( bufs.indexOf("?", 4), 18 );
    t.equal( bufs.indexOf(new Buffer([0x65]), 2), 13 );
    t.end();
});
