;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var domv = require('../')
var Vec2 = require('vec2')
var h    = require('hyperscript')
var o    = require('observable')

var mouse = MOUSE = domv.mouse()

//this should be a module.
function drag (move) {
  var start = new Vec2(mouse.x, mouse.y)
  var diff = new Vec2(0, 0)
  var onMove
  mouse.change(onMove = function () {
    //can easily disable the other axi
    //for draging in only one dimention.
    move(diff.set(mouse.x, mouse.y).subtract(start)) 
  })
  window.addEventListener('mouseup', function () {
    mouse.ignore(onMove)
    diff.dropped = true
    move(diff)
  })
  move(diff.set(mouse.x, mouse.y).subtract(start)) 
}

var div
document.body.appendChild(
h('div', {style: {width: '100%', position: 'relative'}},
  h('div', {style: 
      {
//        background: 'fixed url(./example/grid.jpg)',
        'background-attachment': 'none',
//        'background-repeat':'no-repeat',
        width     : '400px',
        height    : '400px',
        margin    : 'auto',
        top       : '50%',
        position  : 'relative',
        //'margin-top' : '200px',
        overflow  : 'scroll',
        'box-shadow': 'inset 0 0 40px black',
        'border-radius': '10px',
        border: 'solid 1px black'

      }
    },
      h('div', {style: {
        width: '600px', height: '600px'
      }},
        h('img', {src:'./example/grid.jpg'},{style: {
          position: 'absolute'
        }}),
        div = h('div',
          {style:
            {position: 'absolute'}
          },
          h('h1','DRAGME', {
            style:{border: 'solid 4px red', position: 'relative'},
            onmousedown: function () {
              var abs = domv.absolute(div, true) //true means bound.
              var start = new Vec2(abs.x, abs.y)
              drag(function (move) {
                if(move.end) return
                abs.set(start.add(move, true))
              })
            }
          })
        )
      )
    )
  )
)

function dim (vec, dim) {
  var v = o()
  vec.change(function (e) {
    v(vec[dim])
  })
  v(vec[dim])
  return v
}

var invisible = {
  style: { 
    background: 'hsla(0,0%,0%,0)', 
    'pointer-events': 'none',
     'z-index': 1000,
  } }

var fixed = {
  style: {
    position: 'fixed',
    left    : '0px',
    top     : '0px'
  } }

var vert = h('div', invisible, fixed, {
  style: {
    height  : '100%',
    'border-right'   :'1px solid black',
  }
}) 

var horz = h('div', invisible, fixed, {
  style: {
    width   : '100%',
    'border-bottom'   :'1px solid black',
  }
}) 

mouse.change(function () {
//  console.log(mouse.x, mouse.y)
  vert.style.width = mouse.x + 'px'
  horz.style.height = mouse.y + 'px'
})

document.body.appendChild(horz);
document.body.appendChild(vert);

var container
document.body.appendChild(
  container= h('div',  {style: {
        width: '300px',
        border: '1px solid black',
        background: 'white',
        'box-shadow': '3px 3px 10px hsla(0, 30%, 30%, 0.5)'
      }
    },
    h('div', 
      {style: {
        background: 'red',
    }},
    //note, the outer div is only draggable
    //by it's title.
      h('h1', 'draggable', {style: {margin: '0px'}}),
      {onmousedown: function () {
        var abs = domv.absolute(container, true) //true means bound.
        var start = new Vec2(abs.x, abs.y)
        drag(function (move) {
          if(move.end) return
          abs.set(start.add(move, true))
        })

      }}
    ),
    h('p', 'Contents....')
  )
)

var tvert = h('div', invisible, fixed, {
  style: {
    height  : '100%',
    'border-right'   :'1px solid black',
  }
}) 

var thorz = h('div', invisible, fixed, {
  style: {
    width   : '100%',
    'border-bottom'   :'1px solid black',
  }
}) 
var touch = domv.touch()

touch.change(function () {
//  console.log(mouse.x, mouse.y)
  tvert.style.width = mouse.x + 'px'
  thorz.style.height = mouse.y + 'px'
})



},{"../":2,"vec2":3,"hyperscript":4,"observable":5}],3:[function(require,module,exports){
;(function inject(clean, precision, undef) {

  function Vec2(x, y) {
    if (!(this instanceof Vec2)) {
      return new Vec2(x, y);
    }
    this.set(x || 0, y || 0);
  };

  Vec2.prototype = {
    change : function(fn) {
      if (fn) {
        if (this.observers) {
          this.observers.push(fn);
        } else {
          this.observers = [fn];
        }
      } else if (this.observers) {
        for (var i=this.observers.length-1; i>=0; i--) {
          this.observers[i](this);
        }
      }

      return this;
    },

    ignore : function(fn) {
      this.observers = this.observers.filter(function(cb) {
        return cb !== fn;
      });

      return this;
    },

    dirty : function() {
      var cacheKeys = ['__cachedLength', '__cachedLengthSquared'];
      for (var i=0, l=cacheKeys.length; i<l; i++) {
        this[cacheKeys[i]] = null;
      }
    },

    // set x and y
    set: function(x, y, silent) {
      if(x && 'object' === typeof x) {
        silent = y;
        y = x.y;
        x = x.x;
      }
      x = Vec2.clean(x)
      y = Vec2.clean(y)
      if(this.x === x && this.y === y)
        return this;
      this.x = x;
      this.y = y;
      this.dirty();
      if(silent !== false)
        return this.change();
    },

    // reset x and y to zero
    zero : function() {
      return this.set(0, 0);
    },

    // return a new vector with the same component values
    // as this one
    clone : function() {
      return new Vec2(this.x, this.y);
    },

    // negate the values of this vector
    negate : function(returnNew) {
      if (returnNew) {
        return new Vec2(-this.x, -this.y);
      } else {
        return this.set(-this.x, -this.y);
      }
    },

    // Add the incoming `vec2` vector to this vector
    add : function(vec2, returnNew) {
      if (!returnNew) {
        return this.set(this.x + vec2.x, this.y + vec2.y);
      } else {
        // Return a new vector if `returnNew` is truthy
        return new Vec2(
          this.x + vec2.x,
          this.y + vec2.y
        );
      }
    },

    // Subtract the incoming `vec2` from this vector
    subtract : function(vec2, returnNew) {
      if (!returnNew) {
        return this.set(this.x - vec2.x, this.y - vec2.y)
      } else {
        // Return a new vector if `returnNew` is truthy
        return new Vec2(
          this.x - vec2.x,
          this.y - vec2.y
        );
      }
    },

    // Multiply this vector by the incoming `vec2`
    multiply : function(vec2, returnNew) {
      var x,y;
      if (vec2.x !== undef) {
        x = vec2.x;
        y = vec2.y;

      // Handle incoming scalars
      } else {
        x = y = vec2;
      }

      if (!returnNew) {
        return this.set(this.x * x, this.y * y);
      } else {
        return new Vec2(
          this.x * x,
          this.y * y
        );
      }
    },

    // Rotate this vector. Accepts a `Rotation` or angle in radians.
    //
    // Passing a truthy `inverse` will cause the rotation to
    // be reversed.
    //
    // If `returnNew` is truthy, a new
    // `Vec2` will be created with the values resulting from
    // the rotation. Otherwise the rotation will be applied
    // to this vector directly, and this vector will be returned.
    rotate : function(r, inverse, returnNew) {
      var
      x = this.x,
      y = this.y,
      cos = Math.cos(r),
      sin = Math.sin(r),
      rx, ry;

      inverse = (inverse) ? -1 : 1;

      rx = cos * x - (inverse * sin) * y;
      ry = (inverse * sin) * x + cos * y;

      if (returnNew) {
        return new Vec2(rx, ry);
      } else {
        return this.set(rx, ry);
      }
    },

    // Calculate the length of this vector
    __cachedLength : null,
    length : function() {
      if (this.__cachedLength === null) {
        var x = this.x, y = this.y;
        this.__cachedLength = Math.sqrt(x * x + y * y);
      }
      return this.__cachedLength
    },

    // Get the length squared. For performance, use this instead of `Vec2#length` (if possible).
    __cachedLengthSquared : null,
    lengthSquared : function() {
      if (this.__cachedLengthSquared === null) {
        var x = this.x, y = this.y;
        this.__cachedLengthSquared = Vec2.clean(x * x + y * y);
      }
      return this.__cachedLengthSquared;
    },

    // Return the distance betwen this `Vec2` and the incoming vec2 vector
    // and return a scalar
    distance : function(vec2) {
      return this.subtract(vec2, true).length();
    },

    // Convert this vector into a unit vector.
    // Returns the length.
    normalize : function(returnNew) {
      var length = this.length();

      // Collect a ratio to shrink the x and y coords
      var invertedLength = (length < Number.MIN_VALUE) ? 0 : 1/length;

      if (!returnNew) {
        // Convert the coords to be greater than zero
        // but smaller than or equal to 1.0
        return this.set(this.x * invertedLength, this.y * invertedLength);
      } else {
        return new Vec2(this.x * invertedLength, this.y * invertedLength)
      }
    },

    // Determine if another `Vec2`'s components match this one's
    // also accepts 2 scalars
    equal : function(v, w) {
      if (w === undef) {
        return (
          this.x === v.x &&
          this.y == v.y
        );
      } else {
        return (
          this.x === v &&
          this.y === w
        )
      }
    },

    // Return a new `Vec2` that contains the absolute value of
    // each of this vector's parts
    abs : function(returnNew) {
      var x = Math.abs(this.x), y = Math.abs(this.y);

      if (returnNew) {
        return new Vec2(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Return a new `Vec2` consisting of the smallest values
    // from this vector and the incoming
    //
    // When returnNew is truthy, a new `Vec2` will be returned
    // otherwise the minimum values in either this or `v` will
    // be applied to this vector.
    min : function(v, returnNew) {
      var
      tx = this.x,
      ty = this.y,
      vx = v.x,
      vy = v.y,
      x = tx < vx ? tx : vx,
      y = ty < vy ? ty : vy;

      if (returnNew) {
        return new Vec2(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Return a new `Vec2` consisting of the largest values
    // from this vector and the incoming
    //
    // When returnNew is truthy, a new `Vec2` will be returned
    // otherwise the minimum values in either this or `v` will
    // be applied to this vector.
    max : function(v, returnNew) {
      var
      tx = this.x,
      ty = this.y,
      vx = v.x,
      vy = v.y,
      x = tx > vx ? tx : vx,
      y = ty > vy ? ty : vy;

      if (returnNew) {
        return new Vec2(x, y);
      } else {
        return this.set(x, y);
      }
    },

    // Clamp values into a range.
    // If this vector's values are lower than the `low`'s
    // values, then raise them.  If they are higher than
    // `high`'s then lower them.
    //
    // Passing returnNew as true will cause a new Vec2 to be
    // returned.  Otherwise, this vector's values will be clamped
    clamp : function(low, high, returnNew) {
      var ret = this.min(high, true).max(low)
      if (returnNew) {
        return ret;
      } else {
        return this.set(ret.x, ret.y);
      }
    },

    // Perform linear interpolation between two vectors
    // amount is a decimal between 0 and 1
    lerp : function(vec, amount) {
      return this.add(vec.subtract(this, true).multiply(amount), true);
    },

    // Get the skew vector such that dot(skew_vec, other) == cross(vec, other)
    skew : function() {
      // Returns a new vector.
      return new Vec2(-this.y, this.x)
    },

    // calculate the dot product between
    // this vector and the incoming
    dot : function(b) {
      return Vec2.clean(this.x * b.x + b.y * this.y);
    },

    // calculate the perpendicular dot product between
    // this vector and the incoming
    perpDot : function(b) {
      return Vec2.clean(this.x * b.y - this.y * b.x)
    },

    // Determine the angle between two vec2s
    angleTo : function(vec) {
      return Math.atan2(this.perpDot(vec), this.dot(vec));
    },

    // Divide this vector's components by a scalar
    divide : function(scalar, returnNew) {
      if (scalar === 0 || isNaN(scalar)) {
        throw new Error('division by zero')
      }

      if (returnNew) {
        return new Vec2(this.x/scalar, this.y/scalar);
      }

      return this.set(this.x / scalar, this.y / scalar);
    },

    toArray: function() {
      return [this.x, this.y];
    },

    fromArray: function(array) {
      return this.set(array[0], array[1]);
    },
    toJSON: function () {
      return {x: this.x, y: this.y}
    }
  };

  Vec2.fromArray = function(array) {
    return new Vec2(array[0], array[1]);
  };

  // Floating point stability
  Vec2.precision = precision || 8;
  var p = Math.pow(10, Vec2.precision)

  Vec2.clean = clean || function(val) {
    if (isNaN(val)) {
      throw new Error('NaN detected')
    }

    if (!isFinite(val)) {
      throw new Error('Infinity detected');
    }

    if(Math.round(val) === val) {
      return val;
    }

    return Math.round(val * p)/p;
  };
  Vec2.inject = inject;

  // Expose, but also allow creating a fresh Vec2 subclass.
  if (typeof module !== 'undefined' && typeof module.exports == 'object') {
    module.exports = Vec2;
  } else {
    window.Vec2 = window.Vec2 || Vec2;
  }
  return Vec2
})();



},{}],5:[function(require,module,exports){
;(function () {

// bind a to b -- One Way Binding
function bind1(a, b) {
  a(b()); b(a)
}
//bind a to b and b to a -- Two Way Binding
function bind2(a, b) {
  b(a()); a(b); b(a);
}

//---util-funtions------

//check if this call is a get.
function isGet(val) {
  return undefined === val
}

//check if this call is a set, else, it's a listen
function isSet(val) {
  return 'function' !== typeof val
}

//trigger all listeners
function all(ary, val) {
  for(var k in ary)
    ary[k](val)
}

//remove a listener
function remove(ary, item) {
  delete ary[ary.indexOf(item)]
}

//register a listener
function on(emitter, event, listener) {
  (emitter.on || emitter.addEventListener)
    .call(emitter, event, listener, false)
}

function off(emitter, event, listener) {
  (emitter.removeListener || emitter.removeEventListener || emitter.off)
    .call(emitter, event, listener, false)
}

//An observable that stores a value.

function value () {
  var _val, listeners = []
  return function (val) {
    return (
      isGet(val) ? _val
    : isSet(val) ? all(listeners, _val = val)
    : (listeners.push(val), val(_val), function () {
        remove(listeners, val)
      })
  )}}
  //^ if written in this style, always ends )}}

/*
##property
observe a property of an object, works with scuttlebutt.
could change this to work with backbone Model - but it would become ugly.
*/

function property (model, key) {
  return function (val) {
    return (
      isGet(val) ? model.get(key) :
      isSet(val) ? model.set(key, val) :
      (on(model, 'change:'+key, val), val(model.get(key)), function () {
        off(model, 'change:'+key, val)
      })
    )}}

/*
note the use of the elvis operator `?:` in chained else-if formation,
and also the comma operator `,` which evaluates each part and then
returns the last value.

only 8 lines! that isn't much for what this baby can do!
*/

function transform (observable, down, up) {
  if('function' !== typeof observable)
    throw new Error('transform expects an observable')
  return function (val) {
    return (
      isGet(val) ? down(observable())
    : isSet(val) ? observable((up || down)(val))
    : observable(function (_val) { val(down(_val)) })
    )}}

function not(observable) {
  return transform(observable, function (v) { return !v })
}

function listen (element, event, attr, listener) {
  function onEvent () {
    listener('function' === typeof attr ? attr() : element[attr])
  }
  on(element, event, onEvent)
  onEvent()
  return function () {
    off(element, event, onEvent)
  }
}

//observe html element - aliased as `input`
function attribute(element, attr, event) {
  attr = attr || 'value'; event = event || 'input'
  return function (val) {
    return (
      isGet(val) ? element[attr]
    : isSet(val) ? element[attr] = val
    : listen(element, event, attr, val)
    )}
}

// observe a select element
function select(element) {
  function _attr () {
      return element[element.selectedIndex].value;
  }
  function _set(val) {
    for(var i=0; i < element.options.length; i++) {
      if(element.options[i].value == val) element.selectedIndex = i;
    }
  }
  return function (val) {
    return (
      isGet(val) ? element.options[element.selectedIndex].value
    : isSet(val) ? _set(val)
    : listen(element, 'change', _attr, val)
    )}
}

//toggle based on an event, like mouseover, mouseout
function toggle (el, up, down) {
  var i = false
  return function (val) {
    function onUp() {
      i || val(i = true)
    }
    function onDown () {
      i && val(i = false)
    }
    return (
      isGet(val) ? i
    : isSet(val) ? undefined //read only
    : (on(el, up, onUp), on(el, down || up, onDown), val(i), function () {
      off(el, up, onUp); off(el, down || up, onDown)
    })
  )}}

function error (message) {
  throw new Error(message)
}

function compute (observables, compute) {
  function getAll() {
    console.log('getAll')
    return compute.apply(null, observables.map(function (e) {return e()}))
  }

  var cur = [], init = true

  var v = value()

  observables.forEach(function (f, i) {
    console.log('init')
    f(function (val) {
      cur[i] = val
      if(init) return
      v(compute.apply(null, cur))
    })
  })
  init = false
  v(function () {
    console.log('comput')
    compute.apply(null, cur)
  })

  return v
/*  
  return function (val) {
    return (
      isGet(val) ? getAll()
    : isSet(val) ? error('read-only')
    : observables.forEach(function (obs) {
        //not very good
        obs(function () { val(getAll()) })
      })
    )}*/
}

function boolean (observable, truthy, falsey) {
  return transform(observable, function (val) {
      return val ? truthy : falsey
    }, function (val) {
      return val == truthy ? true : false
    })
  }

var exports = value
exports.bind1     = bind1
exports.bind2     = bind2
exports.value     = value
exports.not       = not
exports.property  = property
exports.input     =
exports.attribute = attribute
exports.select    = select
exports.compute   = compute
exports.transform = transform
exports.boolean   = boolean
exports.toggle    = toggle
exports.hover     = function (e) { return toggle(e, 'mouseover', 'mouseout')}
exports.focus     = function (e) { return toggle(e, 'focus', 'blur')}

if('object' === typeof module) module.exports = exports
else                           this.observable = exports
})()

},{}],2:[function(require,module,exports){
var Vec2 = require('vec2')
var Rec2 = require('rec2')

var mouse, scroll, screen, size

var element =
exports.element = function (el, bind) {
  var rec = el.getBoundingClientRect()    
  var rec2 = new Rec2
  
  var style = getComputedStyle(el)

  rec2.set(rec.left - parseFloat(style['margin-left'])
    , rec.top - parseFloat(style['margin-top']))
  //check if it's actually a Rec2 - if it's a vec2
  //skip this step.
  if(rec2.size)
    rec2.size.set(rec.width, rec.height)

  if(bind) {
    rec2.size.change(function (size) {
      console.log('wh', size.x, size.y)
      el.style.width  = size.x + 'px'
      el.style.height = size.y + 'px'
    })
  }

  return rec2
}

exports.mouseEvent = mouseEvent

//function (ev) {
//  return new Vec2(ev.clientX, ev.clientY)
//}

//var style = getComputedStyle(el)
// + parseFloat(style['margin-top'])
// + parseFloat(style['margin-left'])

var elementRec2 = function (el) {
  var rec = el.getBoundingClientRect()    
  var style = getComputedStyle(el)
  return new Rec2(
    rec.left - parseFloat(style.left),
    rec.top - parseFloat(style.top),
    rec.width, rec.height
  )
}

function mouseEvent (ev) {
  var vec = new Vec2()
  return vec.set(ev.clientX, ev.clientY)
}

exports.mouse = function () {
  if(mouse) return mouse
  mouse = new Vec2()
  window.addEventListener('mousemove', function (e) {
    mouse.set(e.clientX, e.clientY)
  })
  return mouse
}

exports.scroll = function () {
  if(scroll) return scroll
  scroll = new Vec2()
  scroll.set(e.clientX, e.clientY)
  window.addEventListener('scroll', function (e) {
    scroll.set(window.scrollX, window.scrollY)
  })
}

exports.screenSize = function () {
  if(size) return size
  size = new Vec2()
  window.addEventListener('resize', function (e) {
    size.set(window.innerWidth, window.innerHeight)
  })
  size.set(window.innerWidth, window.innerHeight)
  return size
}


//if bind=true this will make the element
//track the position of the Vec2,
//and will work around the DOM qwerk that

exports.absolute = function (el, bind) {
  var absolute =
    element(el).subtract(element(el.parentElement))

  if(bind) {
    el.style.position = 'absolute'
    function place () {
      el.style.left = absolute.x + 'px'
      el.style.top  = absolute.y + 'px'
    }
    absolute.change(place)
    el.style.bottom = ''
    el.style.right  = ''
  }
  return absolute
}


},{"vec2":3,"rec2":6}],7:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":8}],4:[function(require,module,exports){
var split = require('browser-split')
var ClassList = require('class-list')
var DataSet = require('data-set')

module.exports = h

function h() {
  var args = [].slice.call(arguments), e = null
  function item (l) {
    var r
    function parseClass (string) {
      var m = split(string, /([\.#]?[a-zA-Z0-9_-]+)/)
      forEach(m, function (v) {
        var s = v.substring(1,v.length)
        if(!v) return
        if(!e)
          e = document.createElement(v)
        else if (v[0] === '.')
          ClassList(e).add(s)
        else if (v[0] === '#')
          e.setAttribute('id', s)
      })
    }

    if(l == null)
      ;
    else if('string' === typeof l) {
      if(!e)
        parseClass(l)
      else
        e.appendChild(r = document.createTextNode(l))
    }
    else if('number' === typeof l
      || 'boolean' === typeof l
      || l instanceof Date
      || l instanceof RegExp ) {
        e.appendChild(r = document.createTextNode(l.toString()))
    }
    //there might be a better way to handle this...
    else if (isArray(l))
      forEach(l, item)
    else if(isNode(l))
      e.appendChild(r = l)
    else if(l instanceof Text)
      e.appendChild(r = l)
    else if ('object' === typeof l) {
      for (var k in l) {
        if('function' === typeof l[k]) {
          if(/^on\w+/.test(k)) {
            e.addEventListener
              ? e.addEventListener(k.substring(2), l[k])
              : e.attachEvent(k, l[k])
          } else {
            e[k] = l[k]()
            l[k](function (v) {
              e[k] = v
            })
          }
        }
        else if(k === 'style') {
          for (var s in l[k]) (function(s, v) {
            if('function' === typeof v) {
              e.style.setProperty(s, v())
              v(function (val) {
                e.style.setProperty(s, val)
              })
            } else
              e.style.setProperty(s, l[k][s])
          })(s, l[k][s])
        } else if (k.substr(0, 5) === "data-") {
          DataSet(e)[k.substr(5)] = l[k]
        } else {
          e[k] = l[k]
        }
      }
    } else if ('function' === typeof l) {
      //assume it's an observable!
      var v = l()
      e.appendChild(r = isNode(v) ? v : document.createTextNode(v))

      l(function (v) {
        if(isNode(v) && r.parentElement)
          r.parentElement.replaceChild(v, r), r = v
        else
          r.textContent = v
      })

    }

    return r
  }
  while(args.length)
    item(args.shift())

  return e
}

function isNode (el) {
  return el.nodeName && el.nodeType
}

function forEach (arr, fn) {
  if (arr.forEach) return arr.forEach(fn)
  for (var i = 0; i < arr.length; i++) fn(arr[i], i)
}

function isArray (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]'
}

},{"data-set":9,"browser-split":10,"class-list":11}],10:[function(require,module,exports){
(function(){/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

})()
},{}],12:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],8:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":12}],11:[function(require,module,exports){
// contains, add, remove, toggle

module.exports = ClassList

function ClassList(elem) {
    var cl = elem.classList

    if (cl) {
        return cl
    }

    var classList = {
        add: add
        , remove: remove
        , contains: contains
        , toggle: toggle
        , toString: $toString
        , length: 0
        , item: item
    }

    return classList

    function add(token) {
        var list = getTokens()
        if (list.indexOf(token) > -1) {
            return
        }
        list.push(token)
        setTokens(list)
    }

    function remove(token) {
        var list = getTokens()
            , index = list.indexOf(token)

        if (index === -1) {
            return
        }

        list.splice(index, 1)
        setTokens(list)
    }

    function contains(token) {
        return getTokens().indexOf(token) > -1
    }

    function toggle(token) {
        if (contains(token)) {
            remove(token)
            return false
        } else {
            add(token)
            return true
        }
    }

    function $toString() {
        return elem.className
    }

    function item(index) {
        var tokens = getTokens()
        return tokens[index] || null
    }

    function getTokens() {
        var className = elem.className

        return filter(className.split(" "), isTruthy)
    }

    function setTokens(list) {
        var length = list.length

        elem.className = list.join(" ")
        classList.length = length

        for (var i = 0; i < list.length; i++) {
            classList[i] = list[i]
        }

        delete list[length]
    }
}

function filter (arr, fn) {
    var ret = []
    for (var i = 0; i < arr.length; i++) {
        if (fn(arr[i])) ret.push(arr[i])
    }
    return ret
}

function isTruthy(value) {
    return !!value
}

},{}],6:[function(require,module,exports){
var Vec2 = require('vec2')

var inherits = require('util').inherits

inherits(Rec2, Vec2)

module.exports = Rec2

function Rec2 (x, y, w, h) {
  if(!(this instanceof Rec2)) return new Rec2(x, y, w, h)
  x = x || 0
  y = y || 0
  w = w || 0
  h = h || 0
  console.log(x, y, w, h)
  this.set(0, 0)
  var self = this
  var size = this.size = new Vec2(w, h)
  var bound = this.bound = new Vec2(x + w)
  size.change(function (x, y) {
    bound.set(self.x + size.x, self.y + size.y)
  })
  bound.change(function (x, y) {
    size.set(bound.x - self.x, bound.y - self.y)
  })

}

var R = Rec2.prototype

R.contained = function (point) {
  return (
    this.x <= point.x && point.x <= this.bound.x 
  &&
    this.y <= point.y && point.y <= this.bound.y   
  )
}

R.collide = function (box) {
  return (
      (this.x <= box.x       && box.x       <= this.bound.x
    || this.x <= box.bound.x && box.bound.x <= this.bound.x)
    &&(this.y <= box.y       &&       box.y <= this.bound.y
    || this.y <= box.bound.y && box.bound.y <= this.bound.y)
  )
}

},{"util":7,"vec2":3}],9:[function(require,module,exports){
var Weakmap = require("weakmap")
var Individual = require("individual")

var datasetMap = Individual("__DATA_SET_WEAKMAP", Weakmap())

module.exports = DataSet

function DataSet(elem) {
    if (elem.dataset) {
        return elem.dataset
    }

    var hash = datasetMap.get(elem)

    if (!hash) {
        hash = createHash(elem)
        datasetMap.set(elem, hash)
    }

    return hash
}

function createHash(elem) {
    var attributes = elem.attributes
    var hash = {}

    if (attributes === null || attributes === undefined) {
        return hash
    }

    for (var i = 0; i < attributes.length; i++) {
        var attr = attributes[i]

        if (attr.name.substr(0,5) !== "data-") {
            continue
        }

        hash[attr.name.substr(5)] = attr.value
    }

    return hash
}

},{"weakmap":13,"individual":14}],13:[function(require,module,exports){
(function(){/* (The MIT License)
 *
 * Copyright (c) 2012 Brandon Benvie <http://bbenvie.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the 'Software'), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included with all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY  CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Original WeakMap implementation by Gozala @ https://gist.github.com/1269991
// Updated and bugfixed by Raynos @ https://gist.github.com/1638059
// Expanded by Benvie @ https://github.com/Benvie/harmony-collections

void function(global, undefined_, undefined){
  var getProps = Object.getOwnPropertyNames,
      defProp  = Object.defineProperty,
      toSource = Function.prototype.toString,
      create   = Object.create,
      hasOwn   = Object.prototype.hasOwnProperty,
      funcName = /^\n?function\s?(\w*)?_?\(/;


  function define(object, key, value){
    if (typeof key === 'function') {
      value = key;
      key = nameOf(value).replace(/_$/, '');
    }
    return defProp(object, key, { configurable: true, writable: true, value: value });
  }

  function nameOf(func){
    return typeof func !== 'function'
          ? '' : 'name' in func
          ? func.name : toSource.call(func).match(funcName)[1];
  }

  // ############
  // ### Data ###
  // ############

  var Data = (function(){
    var dataDesc = { value: { writable: true, value: undefined } },
        datalock = 'return function(k){if(k===s)return l}',
        uids     = create(null),

        createUID = function(){
          var key = Math.random().toString(36).slice(2);
          return key in uids ? createUID() : uids[key] = key;
        },

        globalID = createUID(),

        storage = function(obj){
          if (hasOwn.call(obj, globalID))
            return obj[globalID];

          if (!Object.isExtensible(obj))
            throw new TypeError("Object must be extensible");

          var store = create(null);
          defProp(obj, globalID, { value: store });
          return store;
        };

    // common per-object storage area made visible by patching getOwnPropertyNames'
    define(Object, function getOwnPropertyNames(obj){
      var props = getProps(obj);
      if (hasOwn.call(obj, globalID))
        props.splice(props.indexOf(globalID), 1);
      return props;
    });

    function Data(){
      var puid = createUID(),
          secret = {};

      this.unlock = function(obj){
        var store = storage(obj);
        if (hasOwn.call(store, puid))
          return store[puid](secret);

        var data = create(null, dataDesc);
        defProp(store, puid, {
          value: new Function('s', 'l', datalock)(secret, data)
        });
        return data;
      }
    }

    define(Data.prototype, function get(o){ return this.unlock(o).value });
    define(Data.prototype, function set(o, v){ this.unlock(o).value = v });

    return Data;
  }());


  var WM = (function(data){
    var validate = function(key){
      if (key == null || typeof key !== 'object' && typeof key !== 'function')
        throw new TypeError("Invalid WeakMap key");
    }

    var wrap = function(collection, value){
      var store = data.unlock(collection);
      if (store.value)
        throw new TypeError("Object is already a WeakMap");
      store.value = value;
    }

    var unwrap = function(collection){
      var storage = data.unlock(collection).value;
      if (!storage)
        throw new TypeError("WeakMap is not generic");
      return storage;
    }

    var initialize = function(weakmap, iterable){
      if (iterable !== null && typeof iterable === 'object' && typeof iterable.forEach === 'function') {
        iterable.forEach(function(item, i){
          if (item instanceof Array && item.length === 2)
            set.call(weakmap, iterable[i][0], iterable[i][1]);
        });
      }
    }


    function WeakMap(iterable){
      if (this === global || this == null || this === WeakMap.prototype)
        return new WeakMap(iterable);

      wrap(this, new Data);
      initialize(this, iterable);
    }

    function get(key){
      validate(key);
      var value = unwrap(this).get(key);
      return value === undefined_ ? undefined : value;
    }

    function set(key, value){
      validate(key);
      // store a token for explicit undefined so that "has" works correctly
      unwrap(this).set(key, value === undefined ? undefined_ : value);
    }

    function has(key){
      validate(key);
      return unwrap(this).get(key) !== undefined;
    }

    function delete_(key){
      validate(key);
      var data = unwrap(this),
          had = data.get(key) !== undefined;
      data.set(key, undefined);
      return had;
    }

    function toString(){
      unwrap(this);
      return '[object WeakMap]';
    }

    try {
      var src = ('return '+delete_).replace('e_', '\\u0065'),
          del = new Function('unwrap', 'validate', src)(unwrap, validate);
    } catch (e) {
      var del = delete_;
    }

    var src = (''+Object).split('Object');
    var stringifier = function toString(){
      return src[0] + nameOf(this) + src[1];
    };

    define(stringifier, stringifier);

    var prep = { __proto__: [] } instanceof Array
      ? function(f){ f.__proto__ = stringifier }
      : function(f){ define(f, stringifier) };

    prep(WeakMap);

    [toString, get, set, has, del].forEach(function(method){
      define(WeakMap.prototype, method);
      prep(method);
    });

    return WeakMap;
  }(new Data));

  var defaultCreator = Object.create
    ? function(){ return Object.create(null) }
    : function(){ return {} };

  function createStorage(creator){
    var weakmap = new WM;
    creator || (creator = defaultCreator);

    function storage(object, value){
      if (value || arguments.length === 2) {
        weakmap.set(object, value);
      } else {
        value = weakmap.get(object);
        if (value === undefined) {
          value = creator(object);
          weakmap.set(object, value);
        }
      }
      return value;
    }

    return storage;
  }


  if (typeof module !== 'undefined') {
    module.exports = WM;
  } else if (typeof exports !== 'undefined') {
    exports.WeakMap = WM;
  } else if (!('WeakMap' in global)) {
    global.WeakMap = WM;
  }

  WM.createStorage = createStorage;
  if (global.WeakMap)
    global.WeakMap.createStorage = createStorage;
}((0, eval)('this'));

})()
},{}],14:[function(require,module,exports){
(function(){var root = require("global")

module.exports = Individual

function Individual(key, value) {
    if (root[key]) {
        return root[key]
    }

    Object.defineProperty(root, key, {
        value: value
        , configurable: true
    })

    return value
}

})()
},{"global":15}],15:[function(require,module,exports){
(function(global){/*global window, global*/
if (typeof global !== "undefined") {
    module.exports = global
} else if (typeof window !== "undefined") {
    module.exports = window
}

})(window)
},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZWMyLWRvbS9leGFtcGxlL2V4YW1wbGUuanMiLCIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZWMyLWRvbS9ub2RlX21vZHVsZXMvdmVjMi9saWIvdmVjMi5qcyIsIi9Vc2Vycy9kb21pbmljdGFyci9jL3ZlYzItZG9tL25vZGVfbW9kdWxlcy9vYnNlcnZhYmxlL2luZGV4LmpzIiwiL1VzZXJzL2RvbWluaWN0YXJyL2MvdmVjMi1kb20vaW5kZXguanMiLCIvVXNlcnMvZG9taW5pY3RhcnIvLm5hdmUvaW5zdGFsbGVkLzAuMTAuMTAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vdXRpbC5qcyIsIi9Vc2Vycy9kb21pbmljdGFyci9jL3ZlYzItZG9tL25vZGVfbW9kdWxlcy9oeXBlcnNjcmlwdC9pbmRleC5qcyIsIi9Vc2Vycy9kb21pbmljdGFyci9jL3ZlYzItZG9tL25vZGVfbW9kdWxlcy9oeXBlcnNjcmlwdC9ub2RlX21vZHVsZXMvYnJvd3Nlci1zcGxpdC9pbmRleC5qcyIsIi9Vc2Vycy9kb21pbmljdGFyci8ubmF2ZS9pbnN0YWxsZWQvMC4xMC4xMC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL2RvbWluaWN0YXJyLy5uYXZlL2luc3RhbGxlZC8wLjEwLjEwL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL2V2ZW50cy5qcyIsIi9Vc2Vycy9kb21pbmljdGFyci9jL3ZlYzItZG9tL25vZGVfbW9kdWxlcy9oeXBlcnNjcmlwdC9ub2RlX21vZHVsZXMvY2xhc3MtbGlzdC9pbmRleC5qcyIsIi9Vc2Vycy9kb21pbmljdGFyci9jL3ZlYzItZG9tL25vZGVfbW9kdWxlcy9yZWMyL2luZGV4LmpzIiwiL1VzZXJzL2RvbWluaWN0YXJyL2MvdmVjMi1kb20vbm9kZV9tb2R1bGVzL2h5cGVyc2NyaXB0L25vZGVfbW9kdWxlcy9kYXRhLXNldC9pbmRleC5qcyIsIi9Vc2Vycy9kb21pbmljdGFyci9jL3ZlYzItZG9tL25vZGVfbW9kdWxlcy9oeXBlcnNjcmlwdC9ub2RlX21vZHVsZXMvZGF0YS1zZXQvbm9kZV9tb2R1bGVzL3dlYWttYXAvd2Vha21hcC5qcyIsIi9Vc2Vycy9kb21pbmljdGFyci9jL3ZlYzItZG9tL25vZGVfbW9kdWxlcy9oeXBlcnNjcmlwdC9ub2RlX21vZHVsZXMvZGF0YS1zZXQvbm9kZV9tb2R1bGVzL2luZGl2aWR1YWwvaW5kZXguanMiLCIvVXNlcnMvZG9taW5pY3RhcnIvYy92ZWMyLWRvbS9ub2RlX21vZHVsZXMvaHlwZXJzY3JpcHQvbm9kZV9tb2R1bGVzL2RhdGEtc2V0L25vZGVfbW9kdWxlcy9pbmRpdmlkdWFsL25vZGVfbW9kdWxlcy9nbG9iYWwvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGRvbXYgPSByZXF1aXJlKCcuLi8nKVxudmFyIFZlYzIgPSByZXF1aXJlKCd2ZWMyJylcbnZhciBoICAgID0gcmVxdWlyZSgnaHlwZXJzY3JpcHQnKVxudmFyIG8gICAgPSByZXF1aXJlKCdvYnNlcnZhYmxlJylcblxudmFyIG1vdXNlID0gTU9VU0UgPSBkb212Lm1vdXNlKClcblxuLy90aGlzIHNob3VsZCBiZSBhIG1vZHVsZS5cbmZ1bmN0aW9uIGRyYWcgKG1vdmUpIHtcbiAgdmFyIHN0YXJ0ID0gbmV3IFZlYzIobW91c2UueCwgbW91c2UueSlcbiAgdmFyIGRpZmYgPSBuZXcgVmVjMigwLCAwKVxuICB2YXIgb25Nb3ZlXG4gIG1vdXNlLmNoYW5nZShvbk1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy9jYW4gZWFzaWx5IGRpc2FibGUgdGhlIG90aGVyIGF4aVxuICAgIC8vZm9yIGRyYWdpbmcgaW4gb25seSBvbmUgZGltZW50aW9uLlxuICAgIG1vdmUoZGlmZi5zZXQobW91c2UueCwgbW91c2UueSkuc3VidHJhY3Qoc3RhcnQpKSBcbiAgfSlcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgbW91c2UuaWdub3JlKG9uTW92ZSlcbiAgICBkaWZmLmRyb3BwZWQgPSB0cnVlXG4gICAgbW92ZShkaWZmKVxuICB9KVxuICBtb3ZlKGRpZmYuc2V0KG1vdXNlLngsIG1vdXNlLnkpLnN1YnRyYWN0KHN0YXJ0KSkgXG59XG5cbnZhciBkaXZcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoXG5oKCdkaXYnLCB7c3R5bGU6IHt3aWR0aDogJzEwMCUnLCBwb3NpdGlvbjogJ3JlbGF0aXZlJ319LFxuICBoKCdkaXYnLCB7c3R5bGU6IFxuICAgICAge1xuLy8gICAgICAgIGJhY2tncm91bmQ6ICdmaXhlZCB1cmwoLi9leGFtcGxlL2dyaWQuanBnKScsXG4gICAgICAgICdiYWNrZ3JvdW5kLWF0dGFjaG1lbnQnOiAnbm9uZScsXG4vLyAgICAgICAgJ2JhY2tncm91bmQtcmVwZWF0Jzonbm8tcmVwZWF0JyxcbiAgICAgICAgd2lkdGggICAgIDogJzQwMHB4JyxcbiAgICAgICAgaGVpZ2h0ICAgIDogJzQwMHB4JyxcbiAgICAgICAgbWFyZ2luICAgIDogJ2F1dG8nLFxuICAgICAgICB0b3AgICAgICAgOiAnNTAlJyxcbiAgICAgICAgcG9zaXRpb24gIDogJ3JlbGF0aXZlJyxcbiAgICAgICAgLy8nbWFyZ2luLXRvcCcgOiAnMjAwcHgnLFxuICAgICAgICBvdmVyZmxvdyAgOiAnc2Nyb2xsJyxcbiAgICAgICAgJ2JveC1zaGFkb3cnOiAnaW5zZXQgMCAwIDQwcHggYmxhY2snLFxuICAgICAgICAnYm9yZGVyLXJhZGl1cyc6ICcxMHB4JyxcbiAgICAgICAgYm9yZGVyOiAnc29saWQgMXB4IGJsYWNrJ1xuXG4gICAgICB9XG4gICAgfSxcbiAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xuICAgICAgICB3aWR0aDogJzYwMHB4JywgaGVpZ2h0OiAnNjAwcHgnXG4gICAgICB9fSxcbiAgICAgICAgaCgnaW1nJywge3NyYzonLi9leGFtcGxlL2dyaWQuanBnJ30se3N0eWxlOiB7XG4gICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZSdcbiAgICAgICAgfX0pLFxuICAgICAgICBkaXYgPSBoKCdkaXYnLFxuICAgICAgICAgIHtzdHlsZTpcbiAgICAgICAgICAgIHtwb3NpdGlvbjogJ2Fic29sdXRlJ31cbiAgICAgICAgICB9LFxuICAgICAgICAgIGgoJ2gxJywnRFJBR01FJywge1xuICAgICAgICAgICAgc3R5bGU6e2JvcmRlcjogJ3NvbGlkIDRweCByZWQnLCBwb3NpdGlvbjogJ3JlbGF0aXZlJ30sXG4gICAgICAgICAgICBvbm1vdXNlZG93bjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB2YXIgYWJzID0gZG9tdi5hYnNvbHV0ZShkaXYsIHRydWUpIC8vdHJ1ZSBtZWFucyBib3VuZC5cbiAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gbmV3IFZlYzIoYWJzLngsIGFicy55KVxuICAgICAgICAgICAgICBkcmFnKGZ1bmN0aW9uIChtb3ZlKSB7XG4gICAgICAgICAgICAgICAgaWYobW92ZS5lbmQpIHJldHVyblxuICAgICAgICAgICAgICAgIGFicy5zZXQoc3RhcnQuYWRkKG1vdmUsIHRydWUpKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG4gIClcbilcblxuZnVuY3Rpb24gZGltICh2ZWMsIGRpbSkge1xuICB2YXIgdiA9IG8oKVxuICB2ZWMuY2hhbmdlKGZ1bmN0aW9uIChlKSB7XG4gICAgdih2ZWNbZGltXSlcbiAgfSlcbiAgdih2ZWNbZGltXSlcbiAgcmV0dXJuIHZcbn1cblxudmFyIGludmlzaWJsZSA9IHtcbiAgc3R5bGU6IHsgXG4gICAgYmFja2dyb3VuZDogJ2hzbGEoMCwwJSwwJSwwKScsIFxuICAgICdwb2ludGVyLWV2ZW50cyc6ICdub25lJyxcbiAgICAgJ3otaW5kZXgnOiAxMDAwLFxuICB9IH1cblxudmFyIGZpeGVkID0ge1xuICBzdHlsZToge1xuICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxuICAgIGxlZnQgICAgOiAnMHB4JyxcbiAgICB0b3AgICAgIDogJzBweCdcbiAgfSB9XG5cbnZhciB2ZXJ0ID0gaCgnZGl2JywgaW52aXNpYmxlLCBmaXhlZCwge1xuICBzdHlsZToge1xuICAgIGhlaWdodCAgOiAnMTAwJScsXG4gICAgJ2JvcmRlci1yaWdodCcgICA6JzFweCBzb2xpZCBibGFjaycsXG4gIH1cbn0pIFxuXG52YXIgaG9yeiA9IGgoJ2RpdicsIGludmlzaWJsZSwgZml4ZWQsIHtcbiAgc3R5bGU6IHtcbiAgICB3aWR0aCAgIDogJzEwMCUnLFxuICAgICdib3JkZXItYm90dG9tJyAgIDonMXB4IHNvbGlkIGJsYWNrJyxcbiAgfVxufSkgXG5cbm1vdXNlLmNoYW5nZShmdW5jdGlvbiAoKSB7XG4vLyAgY29uc29sZS5sb2cobW91c2UueCwgbW91c2UueSlcbiAgdmVydC5zdHlsZS53aWR0aCA9IG1vdXNlLnggKyAncHgnXG4gIGhvcnouc3R5bGUuaGVpZ2h0ID0gbW91c2UueSArICdweCdcbn0pXG5cbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaG9yeik7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHZlcnQpO1xuXG52YXIgY29udGFpbmVyXG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFxuICBjb250YWluZXI9IGgoJ2RpdicsICB7c3R5bGU6IHtcbiAgICAgICAgd2lkdGg6ICczMDBweCcsXG4gICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCBibGFjaycsXG4gICAgICAgIGJhY2tncm91bmQ6ICd3aGl0ZScsXG4gICAgICAgICdib3gtc2hhZG93JzogJzNweCAzcHggMTBweCBoc2xhKDAsIDMwJSwgMzAlLCAwLjUpJ1xuICAgICAgfVxuICAgIH0sXG4gICAgaCgnZGl2JywgXG4gICAgICB7c3R5bGU6IHtcbiAgICAgICAgYmFja2dyb3VuZDogJ3JlZCcsXG4gICAgfX0sXG4gICAgLy9ub3RlLCB0aGUgb3V0ZXIgZGl2IGlzIG9ubHkgZHJhZ2dhYmxlXG4gICAgLy9ieSBpdCdzIHRpdGxlLlxuICAgICAgaCgnaDEnLCAnZHJhZ2dhYmxlJywge3N0eWxlOiB7bWFyZ2luOiAnMHB4J319KSxcbiAgICAgIHtvbm1vdXNlZG93bjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYWJzID0gZG9tdi5hYnNvbHV0ZShjb250YWluZXIsIHRydWUpIC8vdHJ1ZSBtZWFucyBib3VuZC5cbiAgICAgICAgdmFyIHN0YXJ0ID0gbmV3IFZlYzIoYWJzLngsIGFicy55KVxuICAgICAgICBkcmFnKGZ1bmN0aW9uIChtb3ZlKSB7XG4gICAgICAgICAgaWYobW92ZS5lbmQpIHJldHVyblxuICAgICAgICAgIGFicy5zZXQoc3RhcnQuYWRkKG1vdmUsIHRydWUpKVxuICAgICAgICB9KVxuXG4gICAgICB9fVxuICAgICksXG4gICAgaCgncCcsICdDb250ZW50cy4uLi4nKVxuICApXG4pXG5cbnZhciB0dmVydCA9IGgoJ2RpdicsIGludmlzaWJsZSwgZml4ZWQsIHtcbiAgc3R5bGU6IHtcbiAgICBoZWlnaHQgIDogJzEwMCUnLFxuICAgICdib3JkZXItcmlnaHQnICAgOicxcHggc29saWQgYmxhY2snLFxuICB9XG59KSBcblxudmFyIHRob3J6ID0gaCgnZGl2JywgaW52aXNpYmxlLCBmaXhlZCwge1xuICBzdHlsZToge1xuICAgIHdpZHRoICAgOiAnMTAwJScsXG4gICAgJ2JvcmRlci1ib3R0b20nICAgOicxcHggc29saWQgYmxhY2snLFxuICB9XG59KSBcbnZhciB0b3VjaCA9IGRvbXYudG91Y2goKVxuXG50b3VjaC5jaGFuZ2UoZnVuY3Rpb24gKCkge1xuLy8gIGNvbnNvbGUubG9nKG1vdXNlLngsIG1vdXNlLnkpXG4gIHR2ZXJ0LnN0eWxlLndpZHRoID0gbW91c2UueCArICdweCdcbiAgdGhvcnouc3R5bGUuaGVpZ2h0ID0gbW91c2UueSArICdweCdcbn0pXG5cblxuIiwiOyhmdW5jdGlvbiBpbmplY3QoY2xlYW4sIHByZWNpc2lvbiwgdW5kZWYpIHtcblxuICBmdW5jdGlvbiBWZWMyKHgsIHkpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgVmVjMikpIHtcbiAgICAgIHJldHVybiBuZXcgVmVjMih4LCB5KTtcbiAgICB9XG4gICAgdGhpcy5zZXQoeCB8fCAwLCB5IHx8IDApO1xuICB9O1xuXG4gIFZlYzIucHJvdG90eXBlID0ge1xuICAgIGNoYW5nZSA6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXJzKSB7XG4gICAgICAgICAgdGhpcy5vYnNlcnZlcnMucHVzaChmbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSBbZm5dO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub2JzZXJ2ZXJzKSB7XG4gICAgICAgIGZvciAodmFyIGk9dGhpcy5vYnNlcnZlcnMubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzW2ldKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBpZ25vcmUgOiBmdW5jdGlvbihmbikge1xuICAgICAgdGhpcy5vYnNlcnZlcnMgPSB0aGlzLm9ic2VydmVycy5maWx0ZXIoZnVuY3Rpb24oY2IpIHtcbiAgICAgICAgcmV0dXJuIGNiICE9PSBmbjtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZGlydHkgOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYWNoZUtleXMgPSBbJ19fY2FjaGVkTGVuZ3RoJywgJ19fY2FjaGVkTGVuZ3RoU3F1YXJlZCddO1xuICAgICAgZm9yICh2YXIgaT0wLCBsPWNhY2hlS2V5cy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgICAgIHRoaXNbY2FjaGVLZXlzW2ldXSA9IG51bGw7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIHNldCB4IGFuZCB5XG4gICAgc2V0OiBmdW5jdGlvbih4LCB5LCBzaWxlbnQpIHtcbiAgICAgIGlmKHggJiYgJ29iamVjdCcgPT09IHR5cGVvZiB4KSB7XG4gICAgICAgIHNpbGVudCA9IHk7XG4gICAgICAgIHkgPSB4Lnk7XG4gICAgICAgIHggPSB4Lng7XG4gICAgICB9XG4gICAgICB4ID0gVmVjMi5jbGVhbih4KVxuICAgICAgeSA9IFZlYzIuY2xlYW4oeSlcbiAgICAgIGlmKHRoaXMueCA9PT0geCAmJiB0aGlzLnkgPT09IHkpXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgdGhpcy54ID0geDtcbiAgICAgIHRoaXMueSA9IHk7XG4gICAgICB0aGlzLmRpcnR5KCk7XG4gICAgICBpZihzaWxlbnQgIT09IGZhbHNlKVxuICAgICAgICByZXR1cm4gdGhpcy5jaGFuZ2UoKTtcbiAgICB9LFxuXG4gICAgLy8gcmVzZXQgeCBhbmQgeSB0byB6ZXJvXG4gICAgemVybyA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0KDAsIDApO1xuICAgIH0sXG5cbiAgICAvLyByZXR1cm4gYSBuZXcgdmVjdG9yIHdpdGggdGhlIHNhbWUgY29tcG9uZW50IHZhbHVlc1xuICAgIC8vIGFzIHRoaXMgb25lXG4gICAgY2xvbmUgOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgVmVjMih0aGlzLngsIHRoaXMueSk7XG4gICAgfSxcblxuICAgIC8vIG5lZ2F0ZSB0aGUgdmFsdWVzIG9mIHRoaXMgdmVjdG9yXG4gICAgbmVnYXRlIDogZnVuY3Rpb24ocmV0dXJuTmV3KSB7XG4gICAgICBpZiAocmV0dXJuTmV3KSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjMigtdGhpcy54LCAtdGhpcy55KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldCgtdGhpcy54LCAtdGhpcy55KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQWRkIHRoZSBpbmNvbWluZyBgdmVjMmAgdmVjdG9yIHRvIHRoaXMgdmVjdG9yXG4gICAgYWRkIDogZnVuY3Rpb24odmVjMiwgcmV0dXJuTmV3KSB7XG4gICAgICBpZiAoIXJldHVybk5ldykge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXQodGhpcy54ICsgdmVjMi54LCB0aGlzLnkgKyB2ZWMyLnkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUmV0dXJuIGEgbmV3IHZlY3RvciBpZiBgcmV0dXJuTmV3YCBpcyB0cnV0aHlcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKFxuICAgICAgICAgIHRoaXMueCArIHZlYzIueCxcbiAgICAgICAgICB0aGlzLnkgKyB2ZWMyLnlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU3VidHJhY3QgdGhlIGluY29taW5nIGB2ZWMyYCBmcm9tIHRoaXMgdmVjdG9yXG4gICAgc3VidHJhY3QgOiBmdW5jdGlvbih2ZWMyLCByZXR1cm5OZXcpIHtcbiAgICAgIGlmICghcmV0dXJuTmV3KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldCh0aGlzLnggLSB2ZWMyLngsIHRoaXMueSAtIHZlYzIueSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJldHVybiBhIG5ldyB2ZWN0b3IgaWYgYHJldHVybk5ld2AgaXMgdHJ1dGh5XG4gICAgICAgIHJldHVybiBuZXcgVmVjMihcbiAgICAgICAgICB0aGlzLnggLSB2ZWMyLngsXG4gICAgICAgICAgdGhpcy55IC0gdmVjMi55XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIE11bHRpcGx5IHRoaXMgdmVjdG9yIGJ5IHRoZSBpbmNvbWluZyBgdmVjMmBcbiAgICBtdWx0aXBseSA6IGZ1bmN0aW9uKHZlYzIsIHJldHVybk5ldykge1xuICAgICAgdmFyIHgseTtcbiAgICAgIGlmICh2ZWMyLnggIT09IHVuZGVmKSB7XG4gICAgICAgIHggPSB2ZWMyLng7XG4gICAgICAgIHkgPSB2ZWMyLnk7XG5cbiAgICAgIC8vIEhhbmRsZSBpbmNvbWluZyBzY2FsYXJzXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4ID0geSA9IHZlYzI7XG4gICAgICB9XG5cbiAgICAgIGlmICghcmV0dXJuTmV3KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldCh0aGlzLnggKiB4LCB0aGlzLnkgKiB5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjMihcbiAgICAgICAgICB0aGlzLnggKiB4LFxuICAgICAgICAgIHRoaXMueSAqIHlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUm90YXRlIHRoaXMgdmVjdG9yLiBBY2NlcHRzIGEgYFJvdGF0aW9uYCBvciBhbmdsZSBpbiByYWRpYW5zLlxuICAgIC8vXG4gICAgLy8gUGFzc2luZyBhIHRydXRoeSBgaW52ZXJzZWAgd2lsbCBjYXVzZSB0aGUgcm90YXRpb24gdG9cbiAgICAvLyBiZSByZXZlcnNlZC5cbiAgICAvL1xuICAgIC8vIElmIGByZXR1cm5OZXdgIGlzIHRydXRoeSwgYSBuZXdcbiAgICAvLyBgVmVjMmAgd2lsbCBiZSBjcmVhdGVkIHdpdGggdGhlIHZhbHVlcyByZXN1bHRpbmcgZnJvbVxuICAgIC8vIHRoZSByb3RhdGlvbi4gT3RoZXJ3aXNlIHRoZSByb3RhdGlvbiB3aWxsIGJlIGFwcGxpZWRcbiAgICAvLyB0byB0aGlzIHZlY3RvciBkaXJlY3RseSwgYW5kIHRoaXMgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAgcm90YXRlIDogZnVuY3Rpb24ociwgaW52ZXJzZSwgcmV0dXJuTmV3KSB7XG4gICAgICB2YXJcbiAgICAgIHggPSB0aGlzLngsXG4gICAgICB5ID0gdGhpcy55LFxuICAgICAgY29zID0gTWF0aC5jb3MociksXG4gICAgICBzaW4gPSBNYXRoLnNpbihyKSxcbiAgICAgIHJ4LCByeTtcblxuICAgICAgaW52ZXJzZSA9IChpbnZlcnNlKSA/IC0xIDogMTtcblxuICAgICAgcnggPSBjb3MgKiB4IC0gKGludmVyc2UgKiBzaW4pICogeTtcbiAgICAgIHJ5ID0gKGludmVyc2UgKiBzaW4pICogeCArIGNvcyAqIHk7XG5cbiAgICAgIGlmIChyZXR1cm5OZXcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHJ4LCByeSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXQocngsIHJ5KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBsZW5ndGggb2YgdGhpcyB2ZWN0b3JcbiAgICBfX2NhY2hlZExlbmd0aCA6IG51bGwsXG4gICAgbGVuZ3RoIDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fX2NhY2hlZExlbmd0aCA9PT0gbnVsbCkge1xuICAgICAgICB2YXIgeCA9IHRoaXMueCwgeSA9IHRoaXMueTtcbiAgICAgICAgdGhpcy5fX2NhY2hlZExlbmd0aCA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGVkTGVuZ3RoXG4gICAgfSxcblxuICAgIC8vIEdldCB0aGUgbGVuZ3RoIHNxdWFyZWQuIEZvciBwZXJmb3JtYW5jZSwgdXNlIHRoaXMgaW5zdGVhZCBvZiBgVmVjMiNsZW5ndGhgIChpZiBwb3NzaWJsZSkuXG4gICAgX19jYWNoZWRMZW5ndGhTcXVhcmVkIDogbnVsbCxcbiAgICBsZW5ndGhTcXVhcmVkIDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fX2NhY2hlZExlbmd0aFNxdWFyZWQgPT09IG51bGwpIHtcbiAgICAgICAgdmFyIHggPSB0aGlzLngsIHkgPSB0aGlzLnk7XG4gICAgICAgIHRoaXMuX19jYWNoZWRMZW5ndGhTcXVhcmVkID0gVmVjMi5jbGVhbih4ICogeCArIHkgKiB5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9fY2FjaGVkTGVuZ3RoU3F1YXJlZDtcbiAgICB9LFxuXG4gICAgLy8gUmV0dXJuIHRoZSBkaXN0YW5jZSBiZXR3ZW4gdGhpcyBgVmVjMmAgYW5kIHRoZSBpbmNvbWluZyB2ZWMyIHZlY3RvclxuICAgIC8vIGFuZCByZXR1cm4gYSBzY2FsYXJcbiAgICBkaXN0YW5jZSA6IGZ1bmN0aW9uKHZlYzIpIHtcbiAgICAgIHJldHVybiB0aGlzLnN1YnRyYWN0KHZlYzIsIHRydWUpLmxlbmd0aCgpO1xuICAgIH0sXG5cbiAgICAvLyBDb252ZXJ0IHRoaXMgdmVjdG9yIGludG8gYSB1bml0IHZlY3Rvci5cbiAgICAvLyBSZXR1cm5zIHRoZSBsZW5ndGguXG4gICAgbm9ybWFsaXplIDogZnVuY3Rpb24ocmV0dXJuTmV3KSB7XG4gICAgICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGgoKTtcblxuICAgICAgLy8gQ29sbGVjdCBhIHJhdGlvIHRvIHNocmluayB0aGUgeCBhbmQgeSBjb29yZHNcbiAgICAgIHZhciBpbnZlcnRlZExlbmd0aCA9IChsZW5ndGggPCBOdW1iZXIuTUlOX1ZBTFVFKSA/IDAgOiAxL2xlbmd0aDtcblxuICAgICAgaWYgKCFyZXR1cm5OZXcpIHtcbiAgICAgICAgLy8gQ29udmVydCB0aGUgY29vcmRzIHRvIGJlIGdyZWF0ZXIgdGhhbiB6ZXJvXG4gICAgICAgIC8vIGJ1dCBzbWFsbGVyIHRoYW4gb3IgZXF1YWwgdG8gMS4wXG4gICAgICAgIHJldHVybiB0aGlzLnNldCh0aGlzLnggKiBpbnZlcnRlZExlbmd0aCwgdGhpcy55ICogaW52ZXJ0ZWRMZW5ndGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHRoaXMueCAqIGludmVydGVkTGVuZ3RoLCB0aGlzLnkgKiBpbnZlcnRlZExlbmd0aClcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIGlmIGFub3RoZXIgYFZlYzJgJ3MgY29tcG9uZW50cyBtYXRjaCB0aGlzIG9uZSdzXG4gICAgLy8gYWxzbyBhY2NlcHRzIDIgc2NhbGFyc1xuICAgIGVxdWFsIDogZnVuY3Rpb24odiwgdykge1xuICAgICAgaWYgKHcgPT09IHVuZGVmKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgdGhpcy54ID09PSB2LnggJiZcbiAgICAgICAgICB0aGlzLnkgPT0gdi55XG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIHRoaXMueCA9PT0gdiAmJlxuICAgICAgICAgIHRoaXMueSA9PT0gd1xuICAgICAgICApXG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFJldHVybiBhIG5ldyBgVmVjMmAgdGhhdCBjb250YWlucyB0aGUgYWJzb2x1dGUgdmFsdWUgb2ZcbiAgICAvLyBlYWNoIG9mIHRoaXMgdmVjdG9yJ3MgcGFydHNcbiAgICBhYnMgOiBmdW5jdGlvbihyZXR1cm5OZXcpIHtcbiAgICAgIHZhciB4ID0gTWF0aC5hYnModGhpcy54KSwgeSA9IE1hdGguYWJzKHRoaXMueSk7XG5cbiAgICAgIGlmIChyZXR1cm5OZXcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHgsIHkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KHgsIHkpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBSZXR1cm4gYSBuZXcgYFZlYzJgIGNvbnNpc3Rpbmcgb2YgdGhlIHNtYWxsZXN0IHZhbHVlc1xuICAgIC8vIGZyb20gdGhpcyB2ZWN0b3IgYW5kIHRoZSBpbmNvbWluZ1xuICAgIC8vXG4gICAgLy8gV2hlbiByZXR1cm5OZXcgaXMgdHJ1dGh5LCBhIG5ldyBgVmVjMmAgd2lsbCBiZSByZXR1cm5lZFxuICAgIC8vIG90aGVyd2lzZSB0aGUgbWluaW11bSB2YWx1ZXMgaW4gZWl0aGVyIHRoaXMgb3IgYHZgIHdpbGxcbiAgICAvLyBiZSBhcHBsaWVkIHRvIHRoaXMgdmVjdG9yLlxuICAgIG1pbiA6IGZ1bmN0aW9uKHYsIHJldHVybk5ldykge1xuICAgICAgdmFyXG4gICAgICB0eCA9IHRoaXMueCxcbiAgICAgIHR5ID0gdGhpcy55LFxuICAgICAgdnggPSB2LngsXG4gICAgICB2eSA9IHYueSxcbiAgICAgIHggPSB0eCA8IHZ4ID8gdHggOiB2eCxcbiAgICAgIHkgPSB0eSA8IHZ5ID8gdHkgOiB2eTtcblxuICAgICAgaWYgKHJldHVybk5ldykge1xuICAgICAgICByZXR1cm4gbmV3IFZlYzIoeCwgeSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXQoeCwgeSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFJldHVybiBhIG5ldyBgVmVjMmAgY29uc2lzdGluZyBvZiB0aGUgbGFyZ2VzdCB2YWx1ZXNcbiAgICAvLyBmcm9tIHRoaXMgdmVjdG9yIGFuZCB0aGUgaW5jb21pbmdcbiAgICAvL1xuICAgIC8vIFdoZW4gcmV0dXJuTmV3IGlzIHRydXRoeSwgYSBuZXcgYFZlYzJgIHdpbGwgYmUgcmV0dXJuZWRcbiAgICAvLyBvdGhlcndpc2UgdGhlIG1pbmltdW0gdmFsdWVzIGluIGVpdGhlciB0aGlzIG9yIGB2YCB3aWxsXG4gICAgLy8gYmUgYXBwbGllZCB0byB0aGlzIHZlY3Rvci5cbiAgICBtYXggOiBmdW5jdGlvbih2LCByZXR1cm5OZXcpIHtcbiAgICAgIHZhclxuICAgICAgdHggPSB0aGlzLngsXG4gICAgICB0eSA9IHRoaXMueSxcbiAgICAgIHZ4ID0gdi54LFxuICAgICAgdnkgPSB2LnksXG4gICAgICB4ID0gdHggPiB2eCA/IHR4IDogdngsXG4gICAgICB5ID0gdHkgPiB2eSA/IHR5IDogdnk7XG5cbiAgICAgIGlmIChyZXR1cm5OZXcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHgsIHkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KHgsIHkpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDbGFtcCB2YWx1ZXMgaW50byBhIHJhbmdlLlxuICAgIC8vIElmIHRoaXMgdmVjdG9yJ3MgdmFsdWVzIGFyZSBsb3dlciB0aGFuIHRoZSBgbG93YCdzXG4gICAgLy8gdmFsdWVzLCB0aGVuIHJhaXNlIHRoZW0uICBJZiB0aGV5IGFyZSBoaWdoZXIgdGhhblxuICAgIC8vIGBoaWdoYCdzIHRoZW4gbG93ZXIgdGhlbS5cbiAgICAvL1xuICAgIC8vIFBhc3NpbmcgcmV0dXJuTmV3IGFzIHRydWUgd2lsbCBjYXVzZSBhIG5ldyBWZWMyIHRvIGJlXG4gICAgLy8gcmV0dXJuZWQuICBPdGhlcndpc2UsIHRoaXMgdmVjdG9yJ3MgdmFsdWVzIHdpbGwgYmUgY2xhbXBlZFxuICAgIGNsYW1wIDogZnVuY3Rpb24obG93LCBoaWdoLCByZXR1cm5OZXcpIHtcbiAgICAgIHZhciByZXQgPSB0aGlzLm1pbihoaWdoLCB0cnVlKS5tYXgobG93KVxuICAgICAgaWYgKHJldHVybk5ldykge1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KHJldC54LCByZXQueSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFBlcmZvcm0gbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjdG9yc1xuICAgIC8vIGFtb3VudCBpcyBhIGRlY2ltYWwgYmV0d2VlbiAwIGFuZCAxXG4gICAgbGVycCA6IGZ1bmN0aW9uKHZlYywgYW1vdW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGQodmVjLnN1YnRyYWN0KHRoaXMsIHRydWUpLm11bHRpcGx5KGFtb3VudCksIHRydWUpO1xuICAgIH0sXG5cbiAgICAvLyBHZXQgdGhlIHNrZXcgdmVjdG9yIHN1Y2ggdGhhdCBkb3Qoc2tld192ZWMsIG90aGVyKSA9PSBjcm9zcyh2ZWMsIG90aGVyKVxuICAgIHNrZXcgOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIFJldHVybnMgYSBuZXcgdmVjdG9yLlxuICAgICAgcmV0dXJuIG5ldyBWZWMyKC10aGlzLnksIHRoaXMueClcbiAgICB9LFxuXG4gICAgLy8gY2FsY3VsYXRlIHRoZSBkb3QgcHJvZHVjdCBiZXR3ZWVuXG4gICAgLy8gdGhpcyB2ZWN0b3IgYW5kIHRoZSBpbmNvbWluZ1xuICAgIGRvdCA6IGZ1bmN0aW9uKGIpIHtcbiAgICAgIHJldHVybiBWZWMyLmNsZWFuKHRoaXMueCAqIGIueCArIGIueSAqIHRoaXMueSk7XG4gICAgfSxcblxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgcGVycGVuZGljdWxhciBkb3QgcHJvZHVjdCBiZXR3ZWVuXG4gICAgLy8gdGhpcyB2ZWN0b3IgYW5kIHRoZSBpbmNvbWluZ1xuICAgIHBlcnBEb3QgOiBmdW5jdGlvbihiKSB7XG4gICAgICByZXR1cm4gVmVjMi5jbGVhbih0aGlzLnggKiBiLnkgLSB0aGlzLnkgKiBiLngpXG4gICAgfSxcblxuICAgIC8vIERldGVybWluZSB0aGUgYW5nbGUgYmV0d2VlbiB0d28gdmVjMnNcbiAgICBhbmdsZVRvIDogZnVuY3Rpb24odmVjKSB7XG4gICAgICByZXR1cm4gTWF0aC5hdGFuMih0aGlzLnBlcnBEb3QodmVjKSwgdGhpcy5kb3QodmVjKSk7XG4gICAgfSxcblxuICAgIC8vIERpdmlkZSB0aGlzIHZlY3RvcidzIGNvbXBvbmVudHMgYnkgYSBzY2FsYXJcbiAgICBkaXZpZGUgOiBmdW5jdGlvbihzY2FsYXIsIHJldHVybk5ldykge1xuICAgICAgaWYgKHNjYWxhciA9PT0gMCB8fCBpc05hTihzY2FsYXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZGl2aXNpb24gYnkgemVybycpXG4gICAgICB9XG5cbiAgICAgIGlmIChyZXR1cm5OZXcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMyKHRoaXMueC9zY2FsYXIsIHRoaXMueS9zY2FsYXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5zZXQodGhpcy54IC8gc2NhbGFyLCB0aGlzLnkgLyBzY2FsYXIpO1xuICAgIH0sXG5cbiAgICB0b0FycmF5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBbdGhpcy54LCB0aGlzLnldO1xuICAgIH0sXG5cbiAgICBmcm9tQXJyYXk6IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXQoYXJyYXlbMF0sIGFycmF5WzFdKTtcbiAgICB9LFxuICAgIHRvSlNPTjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHt4OiB0aGlzLngsIHk6IHRoaXMueX1cbiAgICB9XG4gIH07XG5cbiAgVmVjMi5mcm9tQXJyYXkgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBuZXcgVmVjMihhcnJheVswXSwgYXJyYXlbMV0pO1xuICB9O1xuXG4gIC8vIEZsb2F0aW5nIHBvaW50IHN0YWJpbGl0eVxuICBWZWMyLnByZWNpc2lvbiA9IHByZWNpc2lvbiB8fCA4O1xuICB2YXIgcCA9IE1hdGgucG93KDEwLCBWZWMyLnByZWNpc2lvbilcblxuICBWZWMyLmNsZWFuID0gY2xlYW4gfHwgZnVuY3Rpb24odmFsKSB7XG4gICAgaWYgKGlzTmFOKHZhbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTmFOIGRldGVjdGVkJylcbiAgICB9XG5cbiAgICBpZiAoIWlzRmluaXRlKHZhbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW5maW5pdHkgZGV0ZWN0ZWQnKTtcbiAgICB9XG5cbiAgICBpZihNYXRoLnJvdW5kKHZhbCkgPT09IHZhbCkge1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICByZXR1cm4gTWF0aC5yb3VuZCh2YWwgKiBwKS9wO1xuICB9O1xuICBWZWMyLmluamVjdCA9IGluamVjdDtcblxuICAvLyBFeHBvc2UsIGJ1dCBhbHNvIGFsbG93IGNyZWF0aW5nIGEgZnJlc2ggVmVjMiBzdWJjbGFzcy5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gVmVjMjtcbiAgfSBlbHNlIHtcbiAgICB3aW5kb3cuVmVjMiA9IHdpbmRvdy5WZWMyIHx8IFZlYzI7XG4gIH1cbiAgcmV0dXJuIFZlYzJcbn0pKCk7XG5cblxuIiwiOyhmdW5jdGlvbiAoKSB7XG5cbi8vIGJpbmQgYSB0byBiIC0tIE9uZSBXYXkgQmluZGluZ1xuZnVuY3Rpb24gYmluZDEoYSwgYikge1xuICBhKGIoKSk7IGIoYSlcbn1cbi8vYmluZCBhIHRvIGIgYW5kIGIgdG8gYSAtLSBUd28gV2F5IEJpbmRpbmdcbmZ1bmN0aW9uIGJpbmQyKGEsIGIpIHtcbiAgYihhKCkpOyBhKGIpOyBiKGEpO1xufVxuXG4vLy0tLXV0aWwtZnVudGlvbnMtLS0tLS1cblxuLy9jaGVjayBpZiB0aGlzIGNhbGwgaXMgYSBnZXQuXG5mdW5jdGlvbiBpc0dldCh2YWwpIHtcbiAgcmV0dXJuIHVuZGVmaW5lZCA9PT0gdmFsXG59XG5cbi8vY2hlY2sgaWYgdGhpcyBjYWxsIGlzIGEgc2V0LCBlbHNlLCBpdCdzIGEgbGlzdGVuXG5mdW5jdGlvbiBpc1NldCh2YWwpIHtcbiAgcmV0dXJuICdmdW5jdGlvbicgIT09IHR5cGVvZiB2YWxcbn1cblxuLy90cmlnZ2VyIGFsbCBsaXN0ZW5lcnNcbmZ1bmN0aW9uIGFsbChhcnksIHZhbCkge1xuICBmb3IodmFyIGsgaW4gYXJ5KVxuICAgIGFyeVtrXSh2YWwpXG59XG5cbi8vcmVtb3ZlIGEgbGlzdGVuZXJcbmZ1bmN0aW9uIHJlbW92ZShhcnksIGl0ZW0pIHtcbiAgZGVsZXRlIGFyeVthcnkuaW5kZXhPZihpdGVtKV1cbn1cblxuLy9yZWdpc3RlciBhIGxpc3RlbmVyXG5mdW5jdGlvbiBvbihlbWl0dGVyLCBldmVudCwgbGlzdGVuZXIpIHtcbiAgKGVtaXR0ZXIub24gfHwgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyKVxuICAgIC5jYWxsKGVtaXR0ZXIsIGV2ZW50LCBsaXN0ZW5lciwgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIG9mZihlbWl0dGVyLCBldmVudCwgbGlzdGVuZXIpIHtcbiAgKGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIgfHwgZW1pdHRlci5yZW1vdmVFdmVudExpc3RlbmVyIHx8IGVtaXR0ZXIub2ZmKVxuICAgIC5jYWxsKGVtaXR0ZXIsIGV2ZW50LCBsaXN0ZW5lciwgZmFsc2UpXG59XG5cbi8vQW4gb2JzZXJ2YWJsZSB0aGF0IHN0b3JlcyBhIHZhbHVlLlxuXG5mdW5jdGlvbiB2YWx1ZSAoKSB7XG4gIHZhciBfdmFsLCBsaXN0ZW5lcnMgPSBbXVxuICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiAoXG4gICAgICBpc0dldCh2YWwpID8gX3ZhbFxuICAgIDogaXNTZXQodmFsKSA/IGFsbChsaXN0ZW5lcnMsIF92YWwgPSB2YWwpXG4gICAgOiAobGlzdGVuZXJzLnB1c2godmFsKSwgdmFsKF92YWwpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJlbW92ZShsaXN0ZW5lcnMsIHZhbClcbiAgICAgIH0pXG4gICl9fVxuICAvL14gaWYgd3JpdHRlbiBpbiB0aGlzIHN0eWxlLCBhbHdheXMgZW5kcyApfX1cblxuLypcbiMjcHJvcGVydHlcbm9ic2VydmUgYSBwcm9wZXJ0eSBvZiBhbiBvYmplY3QsIHdvcmtzIHdpdGggc2N1dHRsZWJ1dHQuXG5jb3VsZCBjaGFuZ2UgdGhpcyB0byB3b3JrIHdpdGggYmFja2JvbmUgTW9kZWwgLSBidXQgaXQgd291bGQgYmVjb21lIHVnbHkuXG4qL1xuXG5mdW5jdGlvbiBwcm9wZXJ0eSAobW9kZWwsIGtleSkge1xuICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiAoXG4gICAgICBpc0dldCh2YWwpID8gbW9kZWwuZ2V0KGtleSkgOlxuICAgICAgaXNTZXQodmFsKSA/IG1vZGVsLnNldChrZXksIHZhbCkgOlxuICAgICAgKG9uKG1vZGVsLCAnY2hhbmdlOicra2V5LCB2YWwpLCB2YWwobW9kZWwuZ2V0KGtleSkpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG9mZihtb2RlbCwgJ2NoYW5nZTonK2tleSwgdmFsKVxuICAgICAgfSlcbiAgICApfX1cblxuLypcbm5vdGUgdGhlIHVzZSBvZiB0aGUgZWx2aXMgb3BlcmF0b3IgYD86YCBpbiBjaGFpbmVkIGVsc2UtaWYgZm9ybWF0aW9uLFxuYW5kIGFsc28gdGhlIGNvbW1hIG9wZXJhdG9yIGAsYCB3aGljaCBldmFsdWF0ZXMgZWFjaCBwYXJ0IGFuZCB0aGVuXG5yZXR1cm5zIHRoZSBsYXN0IHZhbHVlLlxuXG5vbmx5IDggbGluZXMhIHRoYXQgaXNuJ3QgbXVjaCBmb3Igd2hhdCB0aGlzIGJhYnkgY2FuIGRvIVxuKi9cblxuZnVuY3Rpb24gdHJhbnNmb3JtIChvYnNlcnZhYmxlLCBkb3duLCB1cCkge1xuICBpZignZnVuY3Rpb24nICE9PSB0eXBlb2Ygb2JzZXJ2YWJsZSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3RyYW5zZm9ybSBleHBlY3RzIGFuIG9ic2VydmFibGUnKVxuICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiAoXG4gICAgICBpc0dldCh2YWwpID8gZG93bihvYnNlcnZhYmxlKCkpXG4gICAgOiBpc1NldCh2YWwpID8gb2JzZXJ2YWJsZSgodXAgfHwgZG93bikodmFsKSlcbiAgICA6IG9ic2VydmFibGUoZnVuY3Rpb24gKF92YWwpIHsgdmFsKGRvd24oX3ZhbCkpIH0pXG4gICAgKX19XG5cbmZ1bmN0aW9uIG5vdChvYnNlcnZhYmxlKSB7XG4gIHJldHVybiB0cmFuc2Zvcm0ob2JzZXJ2YWJsZSwgZnVuY3Rpb24gKHYpIHsgcmV0dXJuICF2IH0pXG59XG5cbmZ1bmN0aW9uIGxpc3RlbiAoZWxlbWVudCwgZXZlbnQsIGF0dHIsIGxpc3RlbmVyKSB7XG4gIGZ1bmN0aW9uIG9uRXZlbnQgKCkge1xuICAgIGxpc3RlbmVyKCdmdW5jdGlvbicgPT09IHR5cGVvZiBhdHRyID8gYXR0cigpIDogZWxlbWVudFthdHRyXSlcbiAgfVxuICBvbihlbGVtZW50LCBldmVudCwgb25FdmVudClcbiAgb25FdmVudCgpXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgb2ZmKGVsZW1lbnQsIGV2ZW50LCBvbkV2ZW50KVxuICB9XG59XG5cbi8vb2JzZXJ2ZSBodG1sIGVsZW1lbnQgLSBhbGlhc2VkIGFzIGBpbnB1dGBcbmZ1bmN0aW9uIGF0dHJpYnV0ZShlbGVtZW50LCBhdHRyLCBldmVudCkge1xuICBhdHRyID0gYXR0ciB8fCAndmFsdWUnOyBldmVudCA9IGV2ZW50IHx8ICdpbnB1dCdcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gKFxuICAgICAgaXNHZXQodmFsKSA/IGVsZW1lbnRbYXR0cl1cbiAgICA6IGlzU2V0KHZhbCkgPyBlbGVtZW50W2F0dHJdID0gdmFsXG4gICAgOiBsaXN0ZW4oZWxlbWVudCwgZXZlbnQsIGF0dHIsIHZhbClcbiAgICApfVxufVxuXG4vLyBvYnNlcnZlIGEgc2VsZWN0IGVsZW1lbnRcbmZ1bmN0aW9uIHNlbGVjdChlbGVtZW50KSB7XG4gIGZ1bmN0aW9uIF9hdHRyICgpIHtcbiAgICAgIHJldHVybiBlbGVtZW50W2VsZW1lbnQuc2VsZWN0ZWRJbmRleF0udmFsdWU7XG4gIH1cbiAgZnVuY3Rpb24gX3NldCh2YWwpIHtcbiAgICBmb3IodmFyIGk9MDsgaSA8IGVsZW1lbnQub3B0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYoZWxlbWVudC5vcHRpb25zW2ldLnZhbHVlID09IHZhbCkgZWxlbWVudC5zZWxlY3RlZEluZGV4ID0gaTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gKFxuICAgICAgaXNHZXQodmFsKSA/IGVsZW1lbnQub3B0aW9uc1tlbGVtZW50LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG4gICAgOiBpc1NldCh2YWwpID8gX3NldCh2YWwpXG4gICAgOiBsaXN0ZW4oZWxlbWVudCwgJ2NoYW5nZScsIF9hdHRyLCB2YWwpXG4gICAgKX1cbn1cblxuLy90b2dnbGUgYmFzZWQgb24gYW4gZXZlbnQsIGxpa2UgbW91c2VvdmVyLCBtb3VzZW91dFxuZnVuY3Rpb24gdG9nZ2xlIChlbCwgdXAsIGRvd24pIHtcbiAgdmFyIGkgPSBmYWxzZVxuICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgIGZ1bmN0aW9uIG9uVXAoKSB7XG4gICAgICBpIHx8IHZhbChpID0gdHJ1ZSlcbiAgICB9XG4gICAgZnVuY3Rpb24gb25Eb3duICgpIHtcbiAgICAgIGkgJiYgdmFsKGkgPSBmYWxzZSlcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIGlzR2V0KHZhbCkgPyBpXG4gICAgOiBpc1NldCh2YWwpID8gdW5kZWZpbmVkIC8vcmVhZCBvbmx5XG4gICAgOiAob24oZWwsIHVwLCBvblVwKSwgb24oZWwsIGRvd24gfHwgdXAsIG9uRG93biksIHZhbChpKSwgZnVuY3Rpb24gKCkge1xuICAgICAgb2ZmKGVsLCB1cCwgb25VcCk7IG9mZihlbCwgZG93biB8fCB1cCwgb25Eb3duKVxuICAgIH0pXG4gICl9fVxuXG5mdW5jdGlvbiBlcnJvciAobWVzc2FnZSkge1xuICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSlcbn1cblxuZnVuY3Rpb24gY29tcHV0ZSAob2JzZXJ2YWJsZXMsIGNvbXB1dGUpIHtcbiAgZnVuY3Rpb24gZ2V0QWxsKCkge1xuICAgIGNvbnNvbGUubG9nKCdnZXRBbGwnKVxuICAgIHJldHVybiBjb21wdXRlLmFwcGx5KG51bGwsIG9ic2VydmFibGVzLm1hcChmdW5jdGlvbiAoZSkge3JldHVybiBlKCl9KSlcbiAgfVxuXG4gIHZhciBjdXIgPSBbXSwgaW5pdCA9IHRydWVcblxuICB2YXIgdiA9IHZhbHVlKClcblxuICBvYnNlcnZhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uIChmLCBpKSB7XG4gICAgY29uc29sZS5sb2coJ2luaXQnKVxuICAgIGYoZnVuY3Rpb24gKHZhbCkge1xuICAgICAgY3VyW2ldID0gdmFsXG4gICAgICBpZihpbml0KSByZXR1cm5cbiAgICAgIHYoY29tcHV0ZS5hcHBseShudWxsLCBjdXIpKVxuICAgIH0pXG4gIH0pXG4gIGluaXQgPSBmYWxzZVxuICB2KGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnY29tcHV0JylcbiAgICBjb21wdXRlLmFwcGx5KG51bGwsIGN1cilcbiAgfSlcblxuICByZXR1cm4gdlxuLyogIFxuICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgIHJldHVybiAoXG4gICAgICBpc0dldCh2YWwpID8gZ2V0QWxsKClcbiAgICA6IGlzU2V0KHZhbCkgPyBlcnJvcigncmVhZC1vbmx5JylcbiAgICA6IG9ic2VydmFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9icykge1xuICAgICAgICAvL25vdCB2ZXJ5IGdvb2RcbiAgICAgICAgb2JzKGZ1bmN0aW9uICgpIHsgdmFsKGdldEFsbCgpKSB9KVxuICAgICAgfSlcbiAgICApfSovXG59XG5cbmZ1bmN0aW9uIGJvb2xlYW4gKG9ic2VydmFibGUsIHRydXRoeSwgZmFsc2V5KSB7XG4gIHJldHVybiB0cmFuc2Zvcm0ob2JzZXJ2YWJsZSwgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgcmV0dXJuIHZhbCA/IHRydXRoeSA6IGZhbHNleVxuICAgIH0sIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHJldHVybiB2YWwgPT0gdHJ1dGh5ID8gdHJ1ZSA6IGZhbHNlXG4gICAgfSlcbiAgfVxuXG52YXIgZXhwb3J0cyA9IHZhbHVlXG5leHBvcnRzLmJpbmQxICAgICA9IGJpbmQxXG5leHBvcnRzLmJpbmQyICAgICA9IGJpbmQyXG5leHBvcnRzLnZhbHVlICAgICA9IHZhbHVlXG5leHBvcnRzLm5vdCAgICAgICA9IG5vdFxuZXhwb3J0cy5wcm9wZXJ0eSAgPSBwcm9wZXJ0eVxuZXhwb3J0cy5pbnB1dCAgICAgPVxuZXhwb3J0cy5hdHRyaWJ1dGUgPSBhdHRyaWJ1dGVcbmV4cG9ydHMuc2VsZWN0ICAgID0gc2VsZWN0XG5leHBvcnRzLmNvbXB1dGUgICA9IGNvbXB1dGVcbmV4cG9ydHMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG5leHBvcnRzLmJvb2xlYW4gICA9IGJvb2xlYW5cbmV4cG9ydHMudG9nZ2xlICAgID0gdG9nZ2xlXG5leHBvcnRzLmhvdmVyICAgICA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiB0b2dnbGUoZSwgJ21vdXNlb3ZlcicsICdtb3VzZW91dCcpfVxuZXhwb3J0cy5mb2N1cyAgICAgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gdG9nZ2xlKGUsICdmb2N1cycsICdibHVyJyl9XG5cbmlmKCdvYmplY3QnID09PSB0eXBlb2YgbW9kdWxlKSBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNcbmVsc2UgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9ic2VydmFibGUgPSBleHBvcnRzXG59KSgpXG4iLCJ2YXIgVmVjMiA9IHJlcXVpcmUoJ3ZlYzInKVxudmFyIFJlYzIgPSByZXF1aXJlKCdyZWMyJylcblxudmFyIG1vdXNlLCBzY3JvbGwsIHNjcmVlbiwgc2l6ZVxuXG52YXIgZWxlbWVudCA9XG5leHBvcnRzLmVsZW1lbnQgPSBmdW5jdGlvbiAoZWwsIGJpbmQpIHtcbiAgdmFyIHJlYyA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpICAgIFxuICB2YXIgcmVjMiA9IG5ldyBSZWMyXG4gIFxuICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKVxuXG4gIHJlYzIuc2V0KHJlYy5sZWZ0IC0gcGFyc2VGbG9hdChzdHlsZVsnbWFyZ2luLWxlZnQnXSlcbiAgICAsIHJlYy50b3AgLSBwYXJzZUZsb2F0KHN0eWxlWydtYXJnaW4tdG9wJ10pKVxuICAvL2NoZWNrIGlmIGl0J3MgYWN0dWFsbHkgYSBSZWMyIC0gaWYgaXQncyBhIHZlYzJcbiAgLy9za2lwIHRoaXMgc3RlcC5cbiAgaWYocmVjMi5zaXplKVxuICAgIHJlYzIuc2l6ZS5zZXQocmVjLndpZHRoLCByZWMuaGVpZ2h0KVxuXG4gIGlmKGJpbmQpIHtcbiAgICByZWMyLnNpemUuY2hhbmdlKGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICBjb25zb2xlLmxvZygnd2gnLCBzaXplLngsIHNpemUueSlcbiAgICAgIGVsLnN0eWxlLndpZHRoICA9IHNpemUueCArICdweCdcbiAgICAgIGVsLnN0eWxlLmhlaWdodCA9IHNpemUueSArICdweCdcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHJlYzJcbn1cblxuZXhwb3J0cy5tb3VzZUV2ZW50ID0gbW91c2VFdmVudFxuXG4vL2Z1bmN0aW9uIChldikge1xuLy8gIHJldHVybiBuZXcgVmVjMihldi5jbGllbnRYLCBldi5jbGllbnRZKVxuLy99XG5cbi8vdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbClcbi8vICsgcGFyc2VGbG9hdChzdHlsZVsnbWFyZ2luLXRvcCddKVxuLy8gKyBwYXJzZUZsb2F0KHN0eWxlWydtYXJnaW4tbGVmdCddKVxuXG52YXIgZWxlbWVudFJlYzIgPSBmdW5jdGlvbiAoZWwpIHtcbiAgdmFyIHJlYyA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpICAgIFxuICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKVxuICByZXR1cm4gbmV3IFJlYzIoXG4gICAgcmVjLmxlZnQgLSBwYXJzZUZsb2F0KHN0eWxlLmxlZnQpLFxuICAgIHJlYy50b3AgLSBwYXJzZUZsb2F0KHN0eWxlLnRvcCksXG4gICAgcmVjLndpZHRoLCByZWMuaGVpZ2h0XG4gIClcbn1cblxuZnVuY3Rpb24gbW91c2VFdmVudCAoZXYpIHtcbiAgdmFyIHZlYyA9IG5ldyBWZWMyKClcbiAgcmV0dXJuIHZlYy5zZXQoZXYuY2xpZW50WCwgZXYuY2xpZW50WSlcbn1cblxuZXhwb3J0cy5tb3VzZSA9IGZ1bmN0aW9uICgpIHtcbiAgaWYobW91c2UpIHJldHVybiBtb3VzZVxuICBtb3VzZSA9IG5ldyBWZWMyKClcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgbW91c2Uuc2V0KGUuY2xpZW50WCwgZS5jbGllbnRZKVxuICB9KVxuICByZXR1cm4gbW91c2Vcbn1cblxuZXhwb3J0cy5zY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gIGlmKHNjcm9sbCkgcmV0dXJuIHNjcm9sbFxuICBzY3JvbGwgPSBuZXcgVmVjMigpXG4gIHNjcm9sbC5zZXQoZS5jbGllbnRYLCBlLmNsaWVudFkpXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbiAoZSkge1xuICAgIHNjcm9sbC5zZXQod2luZG93LnNjcm9sbFgsIHdpbmRvdy5zY3JvbGxZKVxuICB9KVxufVxuXG5leHBvcnRzLnNjcmVlblNpemUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmKHNpemUpIHJldHVybiBzaXplXG4gIHNpemUgPSBuZXcgVmVjMigpXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmdW5jdGlvbiAoZSkge1xuICAgIHNpemUuc2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gIH0pXG4gIHNpemUuc2V0KHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gIHJldHVybiBzaXplXG59XG5cblxuLy9pZiBiaW5kPXRydWUgdGhpcyB3aWxsIG1ha2UgdGhlIGVsZW1lbnRcbi8vdHJhY2sgdGhlIHBvc2l0aW9uIG9mIHRoZSBWZWMyLFxuLy9hbmQgd2lsbCB3b3JrIGFyb3VuZCB0aGUgRE9NIHF3ZXJrIHRoYXRcblxuZXhwb3J0cy5hYnNvbHV0ZSA9IGZ1bmN0aW9uIChlbCwgYmluZCkge1xuICB2YXIgYWJzb2x1dGUgPVxuICAgIGVsZW1lbnQoZWwpLnN1YnRyYWN0KGVsZW1lbnQoZWwucGFyZW50RWxlbWVudCkpXG5cbiAgaWYoYmluZCkge1xuICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICAgIGZ1bmN0aW9uIHBsYWNlICgpIHtcbiAgICAgIGVsLnN0eWxlLmxlZnQgPSBhYnNvbHV0ZS54ICsgJ3B4J1xuICAgICAgZWwuc3R5bGUudG9wICA9IGFic29sdXRlLnkgKyAncHgnXG4gICAgfVxuICAgIGFic29sdXRlLmNoYW5nZShwbGFjZSlcbiAgICBlbC5zdHlsZS5ib3R0b20gPSAnJ1xuICAgIGVsLnN0eWxlLnJpZ2h0ICA9ICcnXG4gIH1cbiAgcmV0dXJuIGFic29sdXRlXG59XG5cbiIsInZhciBldmVudHMgPSByZXF1aXJlKCdldmVudHMnKTtcblxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcbmV4cG9ydHMuaXNEYXRlID0gZnVuY3Rpb24ob2JqKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IERhdGVdJ307XG5leHBvcnRzLmlzUmVnRXhwID0gZnVuY3Rpb24ob2JqKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IFJlZ0V4cF0nfTtcblxuXG5leHBvcnRzLnByaW50ID0gZnVuY3Rpb24gKCkge307XG5leHBvcnRzLnB1dHMgPSBmdW5jdGlvbiAoKSB7fTtcbmV4cG9ydHMuZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuXG5leHBvcnRzLmluc3BlY3QgPSBmdW5jdGlvbihvYmosIHNob3dIaWRkZW4sIGRlcHRoLCBjb2xvcnMpIHtcbiAgdmFyIHNlZW4gPSBbXTtcblxuICB2YXIgc3R5bGl6ZSA9IGZ1bmN0aW9uKHN0ciwgc3R5bGVUeXBlKSB7XG4gICAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9BTlNJX2VzY2FwZV9jb2RlI2dyYXBoaWNzXG4gICAgdmFyIHN0eWxlcyA9XG4gICAgICAgIHsgJ2JvbGQnIDogWzEsIDIyXSxcbiAgICAgICAgICAnaXRhbGljJyA6IFszLCAyM10sXG4gICAgICAgICAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAgICAgICAgICdpbnZlcnNlJyA6IFs3LCAyN10sXG4gICAgICAgICAgJ3doaXRlJyA6IFszNywgMzldLFxuICAgICAgICAgICdncmV5JyA6IFs5MCwgMzldLFxuICAgICAgICAgICdibGFjaycgOiBbMzAsIDM5XSxcbiAgICAgICAgICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgICAgICAgICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgICAgICAgICAnZ3JlZW4nIDogWzMyLCAzOV0sXG4gICAgICAgICAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICAgICAgICAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgICAgICAgICAneWVsbG93JyA6IFszMywgMzldIH07XG5cbiAgICB2YXIgc3R5bGUgPVxuICAgICAgICB7ICdzcGVjaWFsJzogJ2N5YW4nLFxuICAgICAgICAgICdudW1iZXInOiAnYmx1ZScsXG4gICAgICAgICAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgICAgICAgICAndW5kZWZpbmVkJzogJ2dyZXknLFxuICAgICAgICAgICdudWxsJzogJ2JvbGQnLFxuICAgICAgICAgICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAgICAgICAgICdkYXRlJzogJ21hZ2VudGEnLFxuICAgICAgICAgIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICAgICAgICAgJ3JlZ2V4cCc6ICdyZWQnIH1bc3R5bGVUeXBlXTtcblxuICAgIGlmIChzdHlsZSkge1xuICAgICAgcmV0dXJuICdcXDAzM1snICsgc3R5bGVzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICAgJ1xcMDMzWycgKyBzdHlsZXNbc3R5bGVdWzFdICsgJ20nO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgfTtcbiAgaWYgKCEgY29sb3JzKSB7XG4gICAgc3R5bGl6ZSA9IGZ1bmN0aW9uKHN0ciwgc3R5bGVUeXBlKSB7IHJldHVybiBzdHI7IH07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXQodmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAgIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLmluc3BlY3QgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICAgIHZhbHVlICE9PSBleHBvcnRzICYmXG4gICAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgICByZXR1cm4gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMpO1xuICAgIH1cblxuICAgIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICAgIHJldHVybiBzdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG5cbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgICAgIHJldHVybiBzdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuXG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG5cbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAgIH1cbiAgICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG4gICAgfVxuXG4gICAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICAgIHZhciB2aXNpYmxlX2tleXMgPSBPYmplY3Rfa2V5cyh2YWx1ZSk7XG4gICAgdmFyIGtleXMgPSBzaG93SGlkZGVuID8gT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXModmFsdWUpIDogdmlzaWJsZV9rZXlzO1xuXG4gICAgLy8gRnVuY3Rpb25zIHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAncmVnZXhwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGF0ZXMgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZFxuICAgIGlmIChpc0RhdGUodmFsdWUpICYmIGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gc3R5bGl6ZSh2YWx1ZS50b1VUQ1N0cmluZygpLCAnZGF0ZScpO1xuICAgIH1cblxuICAgIHZhciBiYXNlLCB0eXBlLCBicmFjZXM7XG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBvYmplY3QgdHlwZVxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgdHlwZSA9ICdBcnJheSc7XG4gICAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICAgIH0gZWxzZSB7XG4gICAgICB0eXBlID0gJ09iamVjdCc7XG4gICAgICBicmFjZXMgPSBbJ3snLCAnfSddO1xuICAgIH1cblxuICAgIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICBiYXNlID0gKGlzUmVnRXhwKHZhbHVlKSkgPyAnICcgKyB2YWx1ZSA6ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2UgPSAnJztcbiAgICB9XG5cbiAgICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgYmFzZSA9ICcgJyArIHZhbHVlLnRvVVRDU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgICB9XG5cbiAgICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnJyArIHZhbHVlLCAncmVnZXhwJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgICB2YXIgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgbmFtZSwgc3RyO1xuICAgICAgaWYgKHZhbHVlLl9fbG9va3VwR2V0dGVyX18pIHtcbiAgICAgICAgaWYgKHZhbHVlLl9fbG9va3VwR2V0dGVyX18oa2V5KSkge1xuICAgICAgICAgIGlmICh2YWx1ZS5fX2xvb2t1cFNldHRlcl9fKGtleSkpIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0ciA9IHN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHZhbHVlLl9fbG9va3VwU2V0dGVyX18oa2V5KSkge1xuICAgICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHZpc2libGVfa2V5cy5pbmRleE9mKGtleSkgPCAwKSB7XG4gICAgICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gICAgICB9XG4gICAgICBpZiAoIXN0cikge1xuICAgICAgICBpZiAoc2Vlbi5pbmRleE9mKHZhbHVlW2tleV0pIDwgMCkge1xuICAgICAgICAgIGlmIChyZWN1cnNlVGltZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh2YWx1ZVtrZXldKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyID0gZm9ybWF0KHZhbHVlW2tleV0sIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKHR5cGUgPT09ICdBcnJheScgJiYga2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH1cbiAgICAgICAgbmFtZSA9IEpTT04uc3RyaW5naWZ5KCcnICsga2V5KTtcbiAgICAgICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICAgICAgbmFtZSA9IHN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oXlwifFwiJCkvZywgXCInXCIpO1xuICAgICAgICAgIG5hbWUgPSBzdHlsaXplKG5hbWUsICdzdHJpbmcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmFtZSArICc6ICcgKyBzdHI7XG4gICAgfSk7XG5cbiAgICBzZWVuLnBvcCgpO1xuXG4gICAgdmFyIG51bUxpbmVzRXN0ID0gMDtcbiAgICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICAgIG51bUxpbmVzRXN0Kys7XG4gICAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgICByZXR1cm4gcHJldiArIGN1ci5sZW5ndGggKyAxO1xuICAgIH0sIDApO1xuXG4gICAgaWYgKGxlbmd0aCA+IDUwKSB7XG4gICAgICBvdXRwdXQgPSBicmFjZXNbMF0gK1xuICAgICAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICAgICAnICcgK1xuICAgICAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgICAgICcgJyArXG4gICAgICAgICAgICAgICBicmFjZXNbMV07XG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0ID0gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cbiAgcmV0dXJuIGZvcm1hdChvYmosICh0eXBlb2YgZGVwdGggPT09ICd1bmRlZmluZWQnID8gMiA6IGRlcHRoKSk7XG59O1xuXG5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIGFyIGluc3RhbmNlb2YgQXJyYXkgfHxcbiAgICAgICAgIEFycmF5LmlzQXJyYXkoYXIpIHx8XG4gICAgICAgICAoYXIgJiYgYXIgIT09IE9iamVjdC5wcm90b3R5cGUgJiYgaXNBcnJheShhci5fX3Byb3RvX18pKTtcbn1cblxuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gcmUgaW5zdGFuY2VvZiBSZWdFeHAgfHxcbiAgICAodHlwZW9mIHJlID09PSAnb2JqZWN0JyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocmUpID09PSAnW29iamVjdCBSZWdFeHBdJyk7XG59XG5cblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgaWYgKGQgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHR5cGVvZiBkICE9PSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICB2YXIgcHJvcGVydGllcyA9IERhdGUucHJvdG90eXBlICYmIE9iamVjdF9nZXRPd25Qcm9wZXJ0eU5hbWVzKERhdGUucHJvdG90eXBlKTtcbiAgdmFyIHByb3RvID0gZC5fX3Byb3RvX18gJiYgT2JqZWN0X2dldE93blByb3BlcnR5TmFtZXMoZC5fX3Byb3RvX18pO1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocHJvdG8pID09PSBKU09OLnN0cmluZ2lmeShwcm9wZXJ0aWVzKTtcbn1cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cbmV4cG9ydHMubG9nID0gZnVuY3Rpb24gKG1zZykge307XG5cbmV4cG9ydHMucHVtcCA9IG51bGw7XG5cbnZhciBPYmplY3Rfa2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgcmVzLnB1c2goa2V5KTtcbiAgICByZXR1cm4gcmVzO1xufTtcblxudmFyIE9iamVjdF9nZXRPd25Qcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHJlcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59O1xuXG52YXIgT2JqZWN0X2NyZWF0ZSA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gKHByb3RvdHlwZSwgcHJvcGVydGllcykge1xuICAgIC8vIGZyb20gZXM1LXNoaW1cbiAgICB2YXIgb2JqZWN0O1xuICAgIGlmIChwcm90b3R5cGUgPT09IG51bGwpIHtcbiAgICAgICAgb2JqZWN0ID0geyAnX19wcm90b19fJyA6IG51bGwgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvdG90eXBlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgICAndHlwZW9mIHByb3RvdHlwZVsnICsgKHR5cGVvZiBwcm90b3R5cGUpICsgJ10gIT0gXFwnb2JqZWN0XFwnJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgVHlwZSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICBUeXBlLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICAgICAgb2JqZWN0ID0gbmV3IFR5cGUoKTtcbiAgICAgICAgb2JqZWN0Ll9fcHJvdG9fXyA9IHByb3RvdHlwZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QuZGVmaW5lUHJvcGVydGllcykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhvYmplY3QsIHByb3BlcnRpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xufTtcblxuZXhwb3J0cy5pbmhlcml0cyA9IGZ1bmN0aW9uKGN0b3IsIHN1cGVyQ3Rvcikge1xuICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvcjtcbiAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3RfY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbn07XG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICh0eXBlb2YgZiAhPT0gJ3N0cmluZycpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goZXhwb3J0cy5pbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzogcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKXtcbiAgICBpZiAoeCA9PT0gbnVsbCB8fCB0eXBlb2YgeCAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgZXhwb3J0cy5pbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcbiIsInZhciBzcGxpdCA9IHJlcXVpcmUoJ2Jyb3dzZXItc3BsaXQnKVxudmFyIENsYXNzTGlzdCA9IHJlcXVpcmUoJ2NsYXNzLWxpc3QnKVxudmFyIERhdGFTZXQgPSByZXF1aXJlKCdkYXRhLXNldCcpXG5cbm1vZHVsZS5leHBvcnRzID0gaFxuXG5mdW5jdGlvbiBoKCkge1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSwgZSA9IG51bGxcbiAgZnVuY3Rpb24gaXRlbSAobCkge1xuICAgIHZhciByXG4gICAgZnVuY3Rpb24gcGFyc2VDbGFzcyAoc3RyaW5nKSB7XG4gICAgICB2YXIgbSA9IHNwbGl0KHN0cmluZywgLyhbXFwuI10/W2EtekEtWjAtOV8tXSspLylcbiAgICAgIGZvckVhY2gobSwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgdmFyIHMgPSB2LnN1YnN0cmluZygxLHYubGVuZ3RoKVxuICAgICAgICBpZighdikgcmV0dXJuXG4gICAgICAgIGlmKCFlKVxuICAgICAgICAgIGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHYpXG4gICAgICAgIGVsc2UgaWYgKHZbMF0gPT09ICcuJylcbiAgICAgICAgICBDbGFzc0xpc3QoZSkuYWRkKHMpXG4gICAgICAgIGVsc2UgaWYgKHZbMF0gPT09ICcjJylcbiAgICAgICAgICBlLnNldEF0dHJpYnV0ZSgnaWQnLCBzKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZihsID09IG51bGwpXG4gICAgICA7XG4gICAgZWxzZSBpZignc3RyaW5nJyA9PT0gdHlwZW9mIGwpIHtcbiAgICAgIGlmKCFlKVxuICAgICAgICBwYXJzZUNsYXNzKGwpXG4gICAgICBlbHNlXG4gICAgICAgIGUuYXBwZW5kQ2hpbGQociA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGwpKVxuICAgIH1cbiAgICBlbHNlIGlmKCdudW1iZXInID09PSB0eXBlb2YgbFxuICAgICAgfHwgJ2Jvb2xlYW4nID09PSB0eXBlb2YgbFxuICAgICAgfHwgbCBpbnN0YW5jZW9mIERhdGVcbiAgICAgIHx8IGwgaW5zdGFuY2VvZiBSZWdFeHAgKSB7XG4gICAgICAgIGUuYXBwZW5kQ2hpbGQociA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGwudG9TdHJpbmcoKSkpXG4gICAgfVxuICAgIC8vdGhlcmUgbWlnaHQgYmUgYSBiZXR0ZXIgd2F5IHRvIGhhbmRsZSB0aGlzLi4uXG4gICAgZWxzZSBpZiAoaXNBcnJheShsKSlcbiAgICAgIGZvckVhY2gobCwgaXRlbSlcbiAgICBlbHNlIGlmKGlzTm9kZShsKSlcbiAgICAgIGUuYXBwZW5kQ2hpbGQociA9IGwpXG4gICAgZWxzZSBpZihsIGluc3RhbmNlb2YgVGV4dClcbiAgICAgIGUuYXBwZW5kQ2hpbGQociA9IGwpXG4gICAgZWxzZSBpZiAoJ29iamVjdCcgPT09IHR5cGVvZiBsKSB7XG4gICAgICBmb3IgKHZhciBrIGluIGwpIHtcbiAgICAgICAgaWYoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxba10pIHtcbiAgICAgICAgICBpZigvXm9uXFx3Ky8udGVzdChrKSkge1xuICAgICAgICAgICAgZS5hZGRFdmVudExpc3RlbmVyXG4gICAgICAgICAgICAgID8gZS5hZGRFdmVudExpc3RlbmVyKGsuc3Vic3RyaW5nKDIpLCBsW2tdKVxuICAgICAgICAgICAgICA6IGUuYXR0YWNoRXZlbnQoaywgbFtrXSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZVtrXSA9IGxba10oKVxuICAgICAgICAgICAgbFtrXShmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICBlW2tdID0gdlxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihrID09PSAnc3R5bGUnKSB7XG4gICAgICAgICAgZm9yICh2YXIgcyBpbiBsW2tdKSAoZnVuY3Rpb24ocywgdikge1xuICAgICAgICAgICAgaWYoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIHYpIHtcbiAgICAgICAgICAgICAgZS5zdHlsZS5zZXRQcm9wZXJ0eShzLCB2KCkpXG4gICAgICAgICAgICAgIHYoZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICAgICAgICAgIGUuc3R5bGUuc2V0UHJvcGVydHkocywgdmFsKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgIGUuc3R5bGUuc2V0UHJvcGVydHkocywgbFtrXVtzXSlcbiAgICAgICAgICB9KShzLCBsW2tdW3NdKVxuICAgICAgICB9IGVsc2UgaWYgKGsuc3Vic3RyKDAsIDUpID09PSBcImRhdGEtXCIpIHtcbiAgICAgICAgICBEYXRhU2V0KGUpW2suc3Vic3RyKDUpXSA9IGxba11cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlW2tdID0gbFtrXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbCkge1xuICAgICAgLy9hc3N1bWUgaXQncyBhbiBvYnNlcnZhYmxlIVxuICAgICAgdmFyIHYgPSBsKClcbiAgICAgIGUuYXBwZW5kQ2hpbGQociA9IGlzTm9kZSh2KSA/IHYgOiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2KSlcblxuICAgICAgbChmdW5jdGlvbiAodikge1xuICAgICAgICBpZihpc05vZGUodikgJiYgci5wYXJlbnRFbGVtZW50KVxuICAgICAgICAgIHIucGFyZW50RWxlbWVudC5yZXBsYWNlQ2hpbGQodiwgciksIHIgPSB2XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByLnRleHRDb250ZW50ID0gdlxuICAgICAgfSlcblxuICAgIH1cblxuICAgIHJldHVybiByXG4gIH1cbiAgd2hpbGUoYXJncy5sZW5ndGgpXG4gICAgaXRlbShhcmdzLnNoaWZ0KCkpXG5cbiAgcmV0dXJuIGVcbn1cblxuZnVuY3Rpb24gaXNOb2RlIChlbCkge1xuICByZXR1cm4gZWwubm9kZU5hbWUgJiYgZWwubm9kZVR5cGVcbn1cblxuZnVuY3Rpb24gZm9yRWFjaCAoYXJyLCBmbikge1xuICBpZiAoYXJyLmZvckVhY2gpIHJldHVybiBhcnIuZm9yRWFjaChmbilcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGZuKGFycltpXSwgaSlcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoYXJyKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nXG59XG4iLCIoZnVuY3Rpb24oKXsvKiFcbiAqIENyb3NzLUJyb3dzZXIgU3BsaXQgMS4xLjFcbiAqIENvcHlyaWdodCAyMDA3LTIwMTIgU3RldmVuIExldml0aGFuIDxzdGV2ZW5sZXZpdGhhbi5jb20+XG4gKiBBdmFpbGFibGUgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG4gKiBFQ01BU2NyaXB0IGNvbXBsaWFudCwgdW5pZm9ybSBjcm9zcy1icm93c2VyIHNwbGl0IG1ldGhvZFxuICovXG5cbi8qKlxuICogU3BsaXRzIGEgc3RyaW5nIGludG8gYW4gYXJyYXkgb2Ygc3RyaW5ncyB1c2luZyBhIHJlZ2V4IG9yIHN0cmluZyBzZXBhcmF0b3IuIE1hdGNoZXMgb2YgdGhlXG4gKiBzZXBhcmF0b3IgYXJlIG5vdCBpbmNsdWRlZCBpbiB0aGUgcmVzdWx0IGFycmF5LiBIb3dldmVyLCBpZiBgc2VwYXJhdG9yYCBpcyBhIHJlZ2V4IHRoYXQgY29udGFpbnNcbiAqIGNhcHR1cmluZyBncm91cHMsIGJhY2tyZWZlcmVuY2VzIGFyZSBzcGxpY2VkIGludG8gdGhlIHJlc3VsdCBlYWNoIHRpbWUgYHNlcGFyYXRvcmAgaXMgbWF0Y2hlZC5cbiAqIEZpeGVzIGJyb3dzZXIgYnVncyBjb21wYXJlZCB0byB0aGUgbmF0aXZlIGBTdHJpbmcucHJvdG90eXBlLnNwbGl0YCBhbmQgY2FuIGJlIHVzZWQgcmVsaWFibHlcbiAqIGNyb3NzLWJyb3dzZXIuXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byBzcGxpdC5cbiAqIEBwYXJhbSB7UmVnRXhwfFN0cmluZ30gc2VwYXJhdG9yIFJlZ2V4IG9yIHN0cmluZyB0byB1c2UgZm9yIHNlcGFyYXRpbmcgdGhlIHN0cmluZy5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbbGltaXRdIE1heGltdW0gbnVtYmVyIG9mIGl0ZW1zIHRvIGluY2x1ZGUgaW4gdGhlIHJlc3VsdCBhcnJheS5cbiAqIEByZXR1cm5zIHtBcnJheX0gQXJyYXkgb2Ygc3Vic3RyaW5ncy5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQmFzaWMgdXNlXG4gKiBzcGxpdCgnYSBiIGMgZCcsICcgJyk7XG4gKiAvLyAtPiBbJ2EnLCAnYicsICdjJywgJ2QnXVxuICpcbiAqIC8vIFdpdGggbGltaXRcbiAqIHNwbGl0KCdhIGIgYyBkJywgJyAnLCAyKTtcbiAqIC8vIC0+IFsnYScsICdiJ11cbiAqXG4gKiAvLyBCYWNrcmVmZXJlbmNlcyBpbiByZXN1bHQgYXJyYXlcbiAqIHNwbGl0KCcuLndvcmQxIHdvcmQyLi4nLCAvKFthLXpdKykoXFxkKykvaSk7XG4gKiAvLyAtPiBbJy4uJywgJ3dvcmQnLCAnMScsICcgJywgJ3dvcmQnLCAnMicsICcuLiddXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uIHNwbGl0KHVuZGVmKSB7XG5cbiAgdmFyIG5hdGl2ZVNwbGl0ID0gU3RyaW5nLnByb3RvdHlwZS5zcGxpdCxcbiAgICBjb21wbGlhbnRFeGVjTnBjZyA9IC8oKT8/Ly5leGVjKFwiXCIpWzFdID09PSB1bmRlZixcbiAgICAvLyBOUENHOiBub25wYXJ0aWNpcGF0aW5nIGNhcHR1cmluZyBncm91cFxuICAgIHNlbGY7XG5cbiAgc2VsZiA9IGZ1bmN0aW9uKHN0ciwgc2VwYXJhdG9yLCBsaW1pdCkge1xuICAgIC8vIElmIGBzZXBhcmF0b3JgIGlzIG5vdCBhIHJlZ2V4LCB1c2UgYG5hdGl2ZVNwbGl0YFxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc2VwYXJhdG9yKSAhPT0gXCJbb2JqZWN0IFJlZ0V4cF1cIikge1xuICAgICAgcmV0dXJuIG5hdGl2ZVNwbGl0LmNhbGwoc3RyLCBzZXBhcmF0b3IsIGxpbWl0KTtcbiAgICB9XG4gICAgdmFyIG91dHB1dCA9IFtdLFxuICAgICAgZmxhZ3MgPSAoc2VwYXJhdG9yLmlnbm9yZUNhc2UgPyBcImlcIiA6IFwiXCIpICsgKHNlcGFyYXRvci5tdWx0aWxpbmUgPyBcIm1cIiA6IFwiXCIpICsgKHNlcGFyYXRvci5leHRlbmRlZCA/IFwieFwiIDogXCJcIikgKyAvLyBQcm9wb3NlZCBmb3IgRVM2XG4gICAgICAoc2VwYXJhdG9yLnN0aWNreSA/IFwieVwiIDogXCJcIiksXG4gICAgICAvLyBGaXJlZm94IDMrXG4gICAgICBsYXN0TGFzdEluZGV4ID0gMCxcbiAgICAgIC8vIE1ha2UgYGdsb2JhbGAgYW5kIGF2b2lkIGBsYXN0SW5kZXhgIGlzc3VlcyBieSB3b3JraW5nIHdpdGggYSBjb3B5XG4gICAgICBzZXBhcmF0b3IgPSBuZXcgUmVnRXhwKHNlcGFyYXRvci5zb3VyY2UsIGZsYWdzICsgXCJnXCIpLFxuICAgICAgc2VwYXJhdG9yMiwgbWF0Y2gsIGxhc3RJbmRleCwgbGFzdExlbmd0aDtcbiAgICBzdHIgKz0gXCJcIjsgLy8gVHlwZS1jb252ZXJ0XG4gICAgaWYgKCFjb21wbGlhbnRFeGVjTnBjZykge1xuICAgICAgLy8gRG9lc24ndCBuZWVkIGZsYWdzIGd5LCBidXQgdGhleSBkb24ndCBodXJ0XG4gICAgICBzZXBhcmF0b3IyID0gbmV3IFJlZ0V4cChcIl5cIiArIHNlcGFyYXRvci5zb3VyY2UgKyBcIiQoPyFcXFxccylcIiwgZmxhZ3MpO1xuICAgIH1cbiAgICAvKiBWYWx1ZXMgZm9yIGBsaW1pdGAsIHBlciB0aGUgc3BlYzpcbiAgICAgKiBJZiB1bmRlZmluZWQ6IDQyOTQ5NjcyOTUgLy8gTWF0aC5wb3coMiwgMzIpIC0gMVxuICAgICAqIElmIDAsIEluZmluaXR5LCBvciBOYU46IDBcbiAgICAgKiBJZiBwb3NpdGl2ZSBudW1iZXI6IGxpbWl0ID0gTWF0aC5mbG9vcihsaW1pdCk7IGlmIChsaW1pdCA+IDQyOTQ5NjcyOTUpIGxpbWl0IC09IDQyOTQ5NjcyOTY7XG4gICAgICogSWYgbmVnYXRpdmUgbnVtYmVyOiA0Mjk0OTY3Mjk2IC0gTWF0aC5mbG9vcihNYXRoLmFicyhsaW1pdCkpXG4gICAgICogSWYgb3RoZXI6IFR5cGUtY29udmVydCwgdGhlbiB1c2UgdGhlIGFib3ZlIHJ1bGVzXG4gICAgICovXG4gICAgbGltaXQgPSBsaW1pdCA9PT0gdW5kZWYgPyAtMSA+Pj4gMCA6IC8vIE1hdGgucG93KDIsIDMyKSAtIDFcbiAgICBsaW1pdCA+Pj4gMDsgLy8gVG9VaW50MzIobGltaXQpXG4gICAgd2hpbGUgKG1hdGNoID0gc2VwYXJhdG9yLmV4ZWMoc3RyKSkge1xuICAgICAgLy8gYHNlcGFyYXRvci5sYXN0SW5kZXhgIGlzIG5vdCByZWxpYWJsZSBjcm9zcy1icm93c2VyXG4gICAgICBsYXN0SW5kZXggPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgIGlmIChsYXN0SW5kZXggPiBsYXN0TGFzdEluZGV4KSB7XG4gICAgICAgIG91dHB1dC5wdXNoKHN0ci5zbGljZShsYXN0TGFzdEluZGV4LCBtYXRjaC5pbmRleCkpO1xuICAgICAgICAvLyBGaXggYnJvd3NlcnMgd2hvc2UgYGV4ZWNgIG1ldGhvZHMgZG9uJ3QgY29uc2lzdGVudGx5IHJldHVybiBgdW5kZWZpbmVkYCBmb3JcbiAgICAgICAgLy8gbm9ucGFydGljaXBhdGluZyBjYXB0dXJpbmcgZ3JvdXBzXG4gICAgICAgIGlmICghY29tcGxpYW50RXhlY05wY2cgJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgICAgIG1hdGNoWzBdLnJlcGxhY2Uoc2VwYXJhdG9yMiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSA9PT0gdW5kZWYpIHtcbiAgICAgICAgICAgICAgICBtYXRjaFtpXSA9IHVuZGVmO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2guaW5kZXggPCBzdHIubGVuZ3RoKSB7XG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkob3V0cHV0LCBtYXRjaC5zbGljZSgxKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGFzdExlbmd0aCA9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgbGFzdExhc3RJbmRleCA9IGxhc3RJbmRleDtcbiAgICAgICAgaWYgKG91dHB1dC5sZW5ndGggPj0gbGltaXQpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHNlcGFyYXRvci5sYXN0SW5kZXggPT09IG1hdGNoLmluZGV4KSB7XG4gICAgICAgIHNlcGFyYXRvci5sYXN0SW5kZXgrKzsgLy8gQXZvaWQgYW4gaW5maW5pdGUgbG9vcFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobGFzdExhc3RJbmRleCA9PT0gc3RyLmxlbmd0aCkge1xuICAgICAgaWYgKGxhc3RMZW5ndGggfHwgIXNlcGFyYXRvci50ZXN0KFwiXCIpKSB7XG4gICAgICAgIG91dHB1dC5wdXNoKFwiXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaChzdHIuc2xpY2UobGFzdExhc3RJbmRleCkpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0Lmxlbmd0aCA+IGxpbWl0ID8gb3V0cHV0LnNsaWNlKDAsIGxpbWl0KSA6IG91dHB1dDtcbiAgfTtcblxuICByZXR1cm4gc2VsZjtcbn0pKCk7XG5cbn0pKCkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgaWYgKGV2LnNvdXJjZSA9PT0gd2luZG93ICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIihmdW5jdGlvbihwcm9jZXNzKXtpZiAoIXByb2Nlc3MuRXZlbnRFbWl0dGVyKSBwcm9jZXNzLkV2ZW50RW1pdHRlciA9IGZ1bmN0aW9uICgpIHt9O1xuXG52YXIgRXZlbnRFbWl0dGVyID0gZXhwb3J0cy5FdmVudEVtaXR0ZXIgPSBwcm9jZXNzLkV2ZW50RW1pdHRlcjtcbnZhciBpc0FycmF5ID0gdHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbidcbiAgICA/IEFycmF5LmlzQXJyYXlcbiAgICA6IGZ1bmN0aW9uICh4cykge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICAgIH1cbjtcbmZ1bmN0aW9uIGluZGV4T2YgKHhzLCB4KSB7XG4gICAgaWYgKHhzLmluZGV4T2YpIHJldHVybiB4cy5pbmRleE9mKHgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHggPT09IHhzW2ldKSByZXR1cm4gaTtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuXG4vLyAxMCBsaXN0ZW5lcnMgYXJlIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2hcbi8vIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuLy9cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG52YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcbiAgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyA9IG47XG59O1xuXG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzQXJyYXkodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpXG4gICAge1xuICAgICAgaWYgKGFyZ3VtZW50c1sxXSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGFyZ3VtZW50c1sxXTsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuY2F1Z2h0LCB1bnNwZWNpZmllZCAnZXJyb3InIGV2ZW50LlwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIGZhbHNlO1xuICB2YXIgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgaWYgKCFoYW5kbGVyKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09ICdmdW5jdGlvbicpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2UgaWYgKGlzQXJyYXkoaGFuZGxlcikpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcblxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuLy8gRXZlbnRFbWl0dGVyIGlzIGRlZmluZWQgaW4gc3JjL25vZGVfZXZlbnRzLmNjXG4vLyBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQoKSBpcyBhbHNvIGRlZmluZWQgdGhlcmUuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiBsaXN0ZW5lcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYWRkTGlzdGVuZXIgb25seSB0YWtlcyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcbiAgfVxuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09IFwibmV3TGlzdGVuZXJzXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyc1wiLlxuICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSB7XG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIH0gZWxzZSBpZiAoaXNBcnJheSh0aGlzLl9ldmVudHNbdHlwZV0pKSB7XG5cbiAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgICAgdmFyIG07XG4gICAgICBpZiAodGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG0gPSB0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbSA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgICB9XG5cbiAgICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIH0gZWxzZSB7XG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLm9uKHR5cGUsIGZ1bmN0aW9uIGcoKSB7XG4gICAgc2VsZi5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcbiAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIGxpc3RlbmVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZW1vdmVMaXN0ZW5lciBvbmx5IHRha2VzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xuICB9XG5cbiAgLy8gZG9lcyBub3QgdXNlIGxpc3RlbmVycygpLCBzbyBubyBzaWRlIGVmZmVjdCBvZiBjcmVhdGluZyBfZXZlbnRzW3R5cGVdXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0FycmF5KGxpc3QpKSB7XG4gICAgdmFyIGkgPSBpbmRleE9mKGxpc3QsIGxpc3RlbmVyKTtcbiAgICBpZiAoaSA8IDApIHJldHVybiB0aGlzO1xuICAgIGxpc3Quc3BsaWNlKGksIDEpO1xuICAgIGlmIChsaXN0Lmxlbmd0aCA9PSAwKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgfSBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0gPT09IGxpc3RlbmVyKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBkb2VzIG5vdCB1c2UgbGlzdGVuZXJzKCksIHNvIG5vIHNpZGUgZWZmZWN0IG9mIGNyZWF0aW5nIF9ldmVudHNbdHlwZV1cbiAgaWYgKHR5cGUgJiYgdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1t0eXBlXSkgdGhpcy5fZXZlbnRzW3R5cGVdID0gbnVsbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkgdGhpcy5fZXZlbnRzW3R5cGVdID0gW107XG4gIGlmICghaXNBcnJheSh0aGlzLl9ldmVudHNbdHlwZV0pKSB7XG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIH1cbiAgcmV0dXJuIHRoaXMuX2V2ZW50c1t0eXBlXTtcbn07XG5cbn0pKHJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKSkiLCIvLyBjb250YWlucywgYWRkLCByZW1vdmUsIHRvZ2dsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IENsYXNzTGlzdFxuXG5mdW5jdGlvbiBDbGFzc0xpc3QoZWxlbSkge1xuICAgIHZhciBjbCA9IGVsZW0uY2xhc3NMaXN0XG5cbiAgICBpZiAoY2wpIHtcbiAgICAgICAgcmV0dXJuIGNsXG4gICAgfVxuXG4gICAgdmFyIGNsYXNzTGlzdCA9IHtcbiAgICAgICAgYWRkOiBhZGRcbiAgICAgICAgLCByZW1vdmU6IHJlbW92ZVxuICAgICAgICAsIGNvbnRhaW5zOiBjb250YWluc1xuICAgICAgICAsIHRvZ2dsZTogdG9nZ2xlXG4gICAgICAgICwgdG9TdHJpbmc6ICR0b1N0cmluZ1xuICAgICAgICAsIGxlbmd0aDogMFxuICAgICAgICAsIGl0ZW06IGl0ZW1cbiAgICB9XG5cbiAgICByZXR1cm4gY2xhc3NMaXN0XG5cbiAgICBmdW5jdGlvbiBhZGQodG9rZW4pIHtcbiAgICAgICAgdmFyIGxpc3QgPSBnZXRUb2tlbnMoKVxuICAgICAgICBpZiAobGlzdC5pbmRleE9mKHRva2VuKSA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBsaXN0LnB1c2godG9rZW4pXG4gICAgICAgIHNldFRva2VucyhsaXN0KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZSh0b2tlbikge1xuICAgICAgICB2YXIgbGlzdCA9IGdldFRva2VucygpXG4gICAgICAgICAgICAsIGluZGV4ID0gbGlzdC5pbmRleE9mKHRva2VuKVxuXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgIHNldFRva2VucyhsaXN0KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbnRhaW5zKHRva2VuKSB7XG4gICAgICAgIHJldHVybiBnZXRUb2tlbnMoKS5pbmRleE9mKHRva2VuKSA+IC0xXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlKHRva2VuKSB7XG4gICAgICAgIGlmIChjb250YWlucyh0b2tlbikpIHtcbiAgICAgICAgICAgIHJlbW92ZSh0b2tlbilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWRkKHRva2VuKVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uICR0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0uY2xhc3NOYW1lXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXRlbShpbmRleCkge1xuICAgICAgICB2YXIgdG9rZW5zID0gZ2V0VG9rZW5zKClcbiAgICAgICAgcmV0dXJuIHRva2Vuc1tpbmRleF0gfHwgbnVsbFxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFRva2VucygpIHtcbiAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGVsZW0uY2xhc3NOYW1lXG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcihjbGFzc05hbWUuc3BsaXQoXCIgXCIpLCBpc1RydXRoeSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRUb2tlbnMobGlzdCkge1xuICAgICAgICB2YXIgbGVuZ3RoID0gbGlzdC5sZW5ndGhcblxuICAgICAgICBlbGVtLmNsYXNzTmFtZSA9IGxpc3Quam9pbihcIiBcIilcbiAgICAgICAgY2xhc3NMaXN0Lmxlbmd0aCA9IGxlbmd0aFxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY2xhc3NMaXN0W2ldID0gbGlzdFtpXVxuICAgICAgICB9XG5cbiAgICAgICAgZGVsZXRlIGxpc3RbbGVuZ3RoXVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZmlsdGVyIChhcnIsIGZuKSB7XG4gICAgdmFyIHJldCA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGZuKGFycltpXSkpIHJldC5wdXNoKGFycltpXSlcbiAgICB9XG4gICAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBpc1RydXRoeSh2YWx1ZSkge1xuICAgIHJldHVybiAhIXZhbHVlXG59XG4iLCJ2YXIgVmVjMiA9IHJlcXVpcmUoJ3ZlYzInKVxuXG52YXIgaW5oZXJpdHMgPSByZXF1aXJlKCd1dGlsJykuaW5oZXJpdHNcblxuaW5oZXJpdHMoUmVjMiwgVmVjMilcblxubW9kdWxlLmV4cG9ydHMgPSBSZWMyXG5cbmZ1bmN0aW9uIFJlYzIgKHgsIHksIHcsIGgpIHtcbiAgaWYoISh0aGlzIGluc3RhbmNlb2YgUmVjMikpIHJldHVybiBuZXcgUmVjMih4LCB5LCB3LCBoKVxuICB4ID0geCB8fCAwXG4gIHkgPSB5IHx8IDBcbiAgdyA9IHcgfHwgMFxuICBoID0gaCB8fCAwXG4gIGNvbnNvbGUubG9nKHgsIHksIHcsIGgpXG4gIHRoaXMuc2V0KDAsIDApXG4gIHZhciBzZWxmID0gdGhpc1xuICB2YXIgc2l6ZSA9IHRoaXMuc2l6ZSA9IG5ldyBWZWMyKHcsIGgpXG4gIHZhciBib3VuZCA9IHRoaXMuYm91bmQgPSBuZXcgVmVjMih4ICsgdylcbiAgc2l6ZS5jaGFuZ2UoZnVuY3Rpb24gKHgsIHkpIHtcbiAgICBib3VuZC5zZXQoc2VsZi54ICsgc2l6ZS54LCBzZWxmLnkgKyBzaXplLnkpXG4gIH0pXG4gIGJvdW5kLmNoYW5nZShmdW5jdGlvbiAoeCwgeSkge1xuICAgIHNpemUuc2V0KGJvdW5kLnggLSBzZWxmLngsIGJvdW5kLnkgLSBzZWxmLnkpXG4gIH0pXG5cbn1cblxudmFyIFIgPSBSZWMyLnByb3RvdHlwZVxuXG5SLmNvbnRhaW5lZCA9IGZ1bmN0aW9uIChwb2ludCkge1xuICByZXR1cm4gKFxuICAgIHRoaXMueCA8PSBwb2ludC54ICYmIHBvaW50LnggPD0gdGhpcy5ib3VuZC54IFxuICAmJlxuICAgIHRoaXMueSA8PSBwb2ludC55ICYmIHBvaW50LnkgPD0gdGhpcy5ib3VuZC55ICAgXG4gIClcbn1cblxuUi5jb2xsaWRlID0gZnVuY3Rpb24gKGJveCkge1xuICByZXR1cm4gKFxuICAgICAgKHRoaXMueCA8PSBib3gueCAgICAgICAmJiBib3gueCAgICAgICA8PSB0aGlzLmJvdW5kLnhcbiAgICB8fCB0aGlzLnggPD0gYm94LmJvdW5kLnggJiYgYm94LmJvdW5kLnggPD0gdGhpcy5ib3VuZC54KVxuICAgICYmKHRoaXMueSA8PSBib3gueSAgICAgICAmJiAgICAgICBib3gueSA8PSB0aGlzLmJvdW5kLnlcbiAgICB8fCB0aGlzLnkgPD0gYm94LmJvdW5kLnkgJiYgYm94LmJvdW5kLnkgPD0gdGhpcy5ib3VuZC55KVxuICApXG59XG4iLCJ2YXIgV2Vha21hcCA9IHJlcXVpcmUoXCJ3ZWFrbWFwXCIpXG52YXIgSW5kaXZpZHVhbCA9IHJlcXVpcmUoXCJpbmRpdmlkdWFsXCIpXG5cbnZhciBkYXRhc2V0TWFwID0gSW5kaXZpZHVhbChcIl9fREFUQV9TRVRfV0VBS01BUFwiLCBXZWFrbWFwKCkpXG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVNldFxuXG5mdW5jdGlvbiBEYXRhU2V0KGVsZW0pIHtcbiAgICBpZiAoZWxlbS5kYXRhc2V0KSB7XG4gICAgICAgIHJldHVybiBlbGVtLmRhdGFzZXRcbiAgICB9XG5cbiAgICB2YXIgaGFzaCA9IGRhdGFzZXRNYXAuZ2V0KGVsZW0pXG5cbiAgICBpZiAoIWhhc2gpIHtcbiAgICAgICAgaGFzaCA9IGNyZWF0ZUhhc2goZWxlbSlcbiAgICAgICAgZGF0YXNldE1hcC5zZXQoZWxlbSwgaGFzaClcbiAgICB9XG5cbiAgICByZXR1cm4gaGFzaFxufVxuXG5mdW5jdGlvbiBjcmVhdGVIYXNoKGVsZW0pIHtcbiAgICB2YXIgYXR0cmlidXRlcyA9IGVsZW0uYXR0cmlidXRlc1xuICAgIHZhciBoYXNoID0ge31cblxuICAgIGlmIChhdHRyaWJ1dGVzID09PSBudWxsIHx8IGF0dHJpYnV0ZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gaGFzaFxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYXR0ciA9IGF0dHJpYnV0ZXNbaV1cblxuICAgICAgICBpZiAoYXR0ci5uYW1lLnN1YnN0cigwLDUpICE9PSBcImRhdGEtXCIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBoYXNoW2F0dHIubmFtZS5zdWJzdHIoNSldID0gYXR0ci52YWx1ZVxuICAgIH1cblxuICAgIHJldHVybiBoYXNoXG59XG4iLCIoZnVuY3Rpb24oKXsvKiAoVGhlIE1JVCBMaWNlbnNlKVxyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTIgQnJhbmRvbiBCZW52aWUgPGh0dHA6Ly9iYmVudmllLmNvbT5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZFxyXG4gKiBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSAnU29mdHdhcmUnKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbixcclxuICogaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSxcclxuICogc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXHJcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIHdpdGggYWxsIGNvcGllcyBvclxyXG4gKiBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAnQVMgSVMnLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElOR1xyXG4gKiBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcclxuICogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSAgQ0xBSU0sXHJcbiAqIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXHJcbiAqL1xyXG5cclxuLy8gT3JpZ2luYWwgV2Vha01hcCBpbXBsZW1lbnRhdGlvbiBieSBHb3phbGEgQCBodHRwczovL2dpc3QuZ2l0aHViLmNvbS8xMjY5OTkxXHJcbi8vIFVwZGF0ZWQgYW5kIGJ1Z2ZpeGVkIGJ5IFJheW5vcyBAIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tLzE2MzgwNTlcclxuLy8gRXhwYW5kZWQgYnkgQmVudmllIEAgaHR0cHM6Ly9naXRodWIuY29tL0JlbnZpZS9oYXJtb255LWNvbGxlY3Rpb25zXHJcblxyXG52b2lkIGZ1bmN0aW9uKGdsb2JhbCwgdW5kZWZpbmVkXywgdW5kZWZpbmVkKXtcclxuICB2YXIgZ2V0UHJvcHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyxcclxuICAgICAgZGVmUHJvcCAgPSBPYmplY3QuZGVmaW5lUHJvcGVydHksXHJcbiAgICAgIHRvU291cmNlID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLFxyXG4gICAgICBjcmVhdGUgICA9IE9iamVjdC5jcmVhdGUsXHJcbiAgICAgIGhhc093biAgID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcclxuICAgICAgZnVuY05hbWUgPSAvXlxcbj9mdW5jdGlvblxccz8oXFx3Kik/Xz9cXCgvO1xyXG5cclxuXHJcbiAgZnVuY3Rpb24gZGVmaW5lKG9iamVjdCwga2V5LCB2YWx1ZSl7XHJcbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB2YWx1ZSA9IGtleTtcclxuICAgICAga2V5ID0gbmFtZU9mKHZhbHVlKS5yZXBsYWNlKC9fJC8sICcnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZWZQcm9wKG9iamVjdCwga2V5LCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIG5hbWVPZihmdW5jKXtcclxuICAgIHJldHVybiB0eXBlb2YgZnVuYyAhPT0gJ2Z1bmN0aW9uJ1xyXG4gICAgICAgICAgPyAnJyA6ICduYW1lJyBpbiBmdW5jXHJcbiAgICAgICAgICA/IGZ1bmMubmFtZSA6IHRvU291cmNlLmNhbGwoZnVuYykubWF0Y2goZnVuY05hbWUpWzFdO1xyXG4gIH1cclxuXHJcbiAgLy8gIyMjIyMjIyMjIyMjXHJcbiAgLy8gIyMjIERhdGEgIyMjXHJcbiAgLy8gIyMjIyMjIyMjIyMjXHJcblxyXG4gIHZhciBEYXRhID0gKGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgZGF0YURlc2MgPSB7IHZhbHVlOiB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogdW5kZWZpbmVkIH0gfSxcclxuICAgICAgICBkYXRhbG9jayA9ICdyZXR1cm4gZnVuY3Rpb24oayl7aWYoaz09PXMpcmV0dXJuIGx9JyxcclxuICAgICAgICB1aWRzICAgICA9IGNyZWF0ZShudWxsKSxcclxuXHJcbiAgICAgICAgY3JlYXRlVUlEID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgIHZhciBrZXkgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcclxuICAgICAgICAgIHJldHVybiBrZXkgaW4gdWlkcyA/IGNyZWF0ZVVJRCgpIDogdWlkc1trZXldID0ga2V5O1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGdsb2JhbElEID0gY3JlYXRlVUlEKCksXHJcblxyXG4gICAgICAgIHN0b3JhZ2UgPSBmdW5jdGlvbihvYmope1xyXG4gICAgICAgICAgaWYgKGhhc093bi5jYWxsKG9iaiwgZ2xvYmFsSUQpKVxyXG4gICAgICAgICAgICByZXR1cm4gb2JqW2dsb2JhbElEXTtcclxuXHJcbiAgICAgICAgICBpZiAoIU9iamVjdC5pc0V4dGVuc2libGUob2JqKSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBtdXN0IGJlIGV4dGVuc2libGVcIik7XHJcblxyXG4gICAgICAgICAgdmFyIHN0b3JlID0gY3JlYXRlKG51bGwpO1xyXG4gICAgICAgICAgZGVmUHJvcChvYmosIGdsb2JhbElELCB7IHZhbHVlOiBzdG9yZSB9KTtcclxuICAgICAgICAgIHJldHVybiBzdG9yZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgIC8vIGNvbW1vbiBwZXItb2JqZWN0IHN0b3JhZ2UgYXJlYSBtYWRlIHZpc2libGUgYnkgcGF0Y2hpbmcgZ2V0T3duUHJvcGVydHlOYW1lcydcclxuICAgIGRlZmluZShPYmplY3QsIGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMob2JqKXtcclxuICAgICAgdmFyIHByb3BzID0gZ2V0UHJvcHMob2JqKTtcclxuICAgICAgaWYgKGhhc093bi5jYWxsKG9iaiwgZ2xvYmFsSUQpKVxyXG4gICAgICAgIHByb3BzLnNwbGljZShwcm9wcy5pbmRleE9mKGdsb2JhbElEKSwgMSk7XHJcbiAgICAgIHJldHVybiBwcm9wcztcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIERhdGEoKXtcclxuICAgICAgdmFyIHB1aWQgPSBjcmVhdGVVSUQoKSxcclxuICAgICAgICAgIHNlY3JldCA9IHt9O1xyXG5cclxuICAgICAgdGhpcy51bmxvY2sgPSBmdW5jdGlvbihvYmope1xyXG4gICAgICAgIHZhciBzdG9yZSA9IHN0b3JhZ2Uob2JqKTtcclxuICAgICAgICBpZiAoaGFzT3duLmNhbGwoc3RvcmUsIHB1aWQpKVxyXG4gICAgICAgICAgcmV0dXJuIHN0b3JlW3B1aWRdKHNlY3JldCk7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gY3JlYXRlKG51bGwsIGRhdGFEZXNjKTtcclxuICAgICAgICBkZWZQcm9wKHN0b3JlLCBwdWlkLCB7XHJcbiAgICAgICAgICB2YWx1ZTogbmV3IEZ1bmN0aW9uKCdzJywgJ2wnLCBkYXRhbG9jaykoc2VjcmV0LCBkYXRhKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGVmaW5lKERhdGEucHJvdG90eXBlLCBmdW5jdGlvbiBnZXQobyl7IHJldHVybiB0aGlzLnVubG9jayhvKS52YWx1ZSB9KTtcclxuICAgIGRlZmluZShEYXRhLnByb3RvdHlwZSwgZnVuY3Rpb24gc2V0KG8sIHYpeyB0aGlzLnVubG9jayhvKS52YWx1ZSA9IHYgfSk7XHJcblxyXG4gICAgcmV0dXJuIERhdGE7XHJcbiAgfSgpKTtcclxuXHJcblxyXG4gIHZhciBXTSA9IChmdW5jdGlvbihkYXRhKXtcclxuICAgIHZhciB2YWxpZGF0ZSA9IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGlmIChrZXkgPT0gbnVsbCB8fCB0eXBlb2Yga2V5ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2Yga2V5ICE9PSAnZnVuY3Rpb24nKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIFdlYWtNYXAga2V5XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB3cmFwID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgdmFsdWUpe1xyXG4gICAgICB2YXIgc3RvcmUgPSBkYXRhLnVubG9jayhjb2xsZWN0aW9uKTtcclxuICAgICAgaWYgKHN0b3JlLnZhbHVlKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3QgaXMgYWxyZWFkeSBhIFdlYWtNYXBcIik7XHJcbiAgICAgIHN0b3JlLnZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHVud3JhcCA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24pe1xyXG4gICAgICB2YXIgc3RvcmFnZSA9IGRhdGEudW5sb2NrKGNvbGxlY3Rpb24pLnZhbHVlO1xyXG4gICAgICBpZiAoIXN0b3JhZ2UpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIldlYWtNYXAgaXMgbm90IGdlbmVyaWNcIik7XHJcbiAgICAgIHJldHVybiBzdG9yYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBpbml0aWFsaXplID0gZnVuY3Rpb24od2Vha21hcCwgaXRlcmFibGUpe1xyXG4gICAgICBpZiAoaXRlcmFibGUgIT09IG51bGwgJiYgdHlwZW9mIGl0ZXJhYmxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgaXRlcmFibGUuZm9yRWFjaCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIGl0ZXJhYmxlLmZvckVhY2goZnVuY3Rpb24oaXRlbSwgaSl7XHJcbiAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIEFycmF5ICYmIGl0ZW0ubGVuZ3RoID09PSAyKVxyXG4gICAgICAgICAgICBzZXQuY2FsbCh3ZWFrbWFwLCBpdGVyYWJsZVtpXVswXSwgaXRlcmFibGVbaV1bMV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIFdlYWtNYXAoaXRlcmFibGUpe1xyXG4gICAgICBpZiAodGhpcyA9PT0gZ2xvYmFsIHx8IHRoaXMgPT0gbnVsbCB8fCB0aGlzID09PSBXZWFrTWFwLnByb3RvdHlwZSlcclxuICAgICAgICByZXR1cm4gbmV3IFdlYWtNYXAoaXRlcmFibGUpO1xyXG5cclxuICAgICAgd3JhcCh0aGlzLCBuZXcgRGF0YSk7XHJcbiAgICAgIGluaXRpYWxpemUodGhpcywgaXRlcmFibGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldChrZXkpe1xyXG4gICAgICB2YWxpZGF0ZShrZXkpO1xyXG4gICAgICB2YXIgdmFsdWUgPSB1bndyYXAodGhpcykuZ2V0KGtleSk7XHJcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkXyA/IHVuZGVmaW5lZCA6IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcclxuICAgICAgdmFsaWRhdGUoa2V5KTtcclxuICAgICAgLy8gc3RvcmUgYSB0b2tlbiBmb3IgZXhwbGljaXQgdW5kZWZpbmVkIHNvIHRoYXQgXCJoYXNcIiB3b3JrcyBjb3JyZWN0bHlcclxuICAgICAgdW53cmFwKHRoaXMpLnNldChrZXksIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRfIDogdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhcyhrZXkpe1xyXG4gICAgICB2YWxpZGF0ZShrZXkpO1xyXG4gICAgICByZXR1cm4gdW53cmFwKHRoaXMpLmdldChrZXkpICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVsZXRlXyhrZXkpe1xyXG4gICAgICB2YWxpZGF0ZShrZXkpO1xyXG4gICAgICB2YXIgZGF0YSA9IHVud3JhcCh0aGlzKSxcclxuICAgICAgICAgIGhhZCA9IGRhdGEuZ2V0KGtleSkgIT09IHVuZGVmaW5lZDtcclxuICAgICAgZGF0YS5zZXQoa2V5LCB1bmRlZmluZWQpO1xyXG4gICAgICByZXR1cm4gaGFkO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRvU3RyaW5nKCl7XHJcbiAgICAgIHVud3JhcCh0aGlzKTtcclxuICAgICAgcmV0dXJuICdbb2JqZWN0IFdlYWtNYXBdJztcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICB2YXIgc3JjID0gKCdyZXR1cm4gJytkZWxldGVfKS5yZXBsYWNlKCdlXycsICdcXFxcdTAwNjUnKSxcclxuICAgICAgICAgIGRlbCA9IG5ldyBGdW5jdGlvbigndW53cmFwJywgJ3ZhbGlkYXRlJywgc3JjKSh1bndyYXAsIHZhbGlkYXRlKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgdmFyIGRlbCA9IGRlbGV0ZV87XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNyYyA9ICgnJytPYmplY3QpLnNwbGl0KCdPYmplY3QnKTtcclxuICAgIHZhciBzdHJpbmdpZmllciA9IGZ1bmN0aW9uIHRvU3RyaW5nKCl7XHJcbiAgICAgIHJldHVybiBzcmNbMF0gKyBuYW1lT2YodGhpcykgKyBzcmNbMV07XHJcbiAgICB9O1xyXG5cclxuICAgIGRlZmluZShzdHJpbmdpZmllciwgc3RyaW5naWZpZXIpO1xyXG5cclxuICAgIHZhciBwcmVwID0geyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheVxyXG4gICAgICA/IGZ1bmN0aW9uKGYpeyBmLl9fcHJvdG9fXyA9IHN0cmluZ2lmaWVyIH1cclxuICAgICAgOiBmdW5jdGlvbihmKXsgZGVmaW5lKGYsIHN0cmluZ2lmaWVyKSB9O1xyXG5cclxuICAgIHByZXAoV2Vha01hcCk7XHJcblxyXG4gICAgW3RvU3RyaW5nLCBnZXQsIHNldCwgaGFzLCBkZWxdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKXtcclxuICAgICAgZGVmaW5lKFdlYWtNYXAucHJvdG90eXBlLCBtZXRob2QpO1xyXG4gICAgICBwcmVwKG1ldGhvZCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gV2Vha01hcDtcclxuICB9KG5ldyBEYXRhKSk7XHJcblxyXG4gIHZhciBkZWZhdWx0Q3JlYXRvciA9IE9iamVjdC5jcmVhdGVcclxuICAgID8gZnVuY3Rpb24oKXsgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCkgfVxyXG4gICAgOiBmdW5jdGlvbigpeyByZXR1cm4ge30gfTtcclxuXHJcbiAgZnVuY3Rpb24gY3JlYXRlU3RvcmFnZShjcmVhdG9yKXtcclxuICAgIHZhciB3ZWFrbWFwID0gbmV3IFdNO1xyXG4gICAgY3JlYXRvciB8fCAoY3JlYXRvciA9IGRlZmF1bHRDcmVhdG9yKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzdG9yYWdlKG9iamVjdCwgdmFsdWUpe1xyXG4gICAgICBpZiAodmFsdWUgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgIHdlYWttYXAuc2V0KG9iamVjdCwgdmFsdWUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhbHVlID0gd2Vha21hcC5nZXQob2JqZWN0KTtcclxuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgdmFsdWUgPSBjcmVhdG9yKG9iamVjdCk7XHJcbiAgICAgICAgICB3ZWFrbWFwLnNldChvYmplY3QsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzdG9yYWdlO1xyXG4gIH1cclxuXHJcblxyXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBXTTtcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgZXhwb3J0cy5XZWFrTWFwID0gV007XHJcbiAgfSBlbHNlIGlmICghKCdXZWFrTWFwJyBpbiBnbG9iYWwpKSB7XHJcbiAgICBnbG9iYWwuV2Vha01hcCA9IFdNO1xyXG4gIH1cclxuXHJcbiAgV00uY3JlYXRlU3RvcmFnZSA9IGNyZWF0ZVN0b3JhZ2U7XHJcbiAgaWYgKGdsb2JhbC5XZWFrTWFwKVxyXG4gICAgZ2xvYmFsLldlYWtNYXAuY3JlYXRlU3RvcmFnZSA9IGNyZWF0ZVN0b3JhZ2U7XHJcbn0oKDAsIGV2YWwpKCd0aGlzJykpO1xyXG5cbn0pKCkiLCIoZnVuY3Rpb24oKXt2YXIgcm9vdCA9IHJlcXVpcmUoXCJnbG9iYWxcIilcblxubW9kdWxlLmV4cG9ydHMgPSBJbmRpdmlkdWFsXG5cbmZ1bmN0aW9uIEluZGl2aWR1YWwoa2V5LCB2YWx1ZSkge1xuICAgIGlmIChyb290W2tleV0pIHtcbiAgICAgICAgcmV0dXJuIHJvb3Rba2V5XVxuICAgIH1cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyb290LCBrZXksIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICwgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuICAgIHJldHVybiB2YWx1ZVxufVxuXG59KSgpIiwiKGZ1bmN0aW9uKGdsb2JhbCl7LypnbG9iYWwgd2luZG93LCBnbG9iYWwqL1xuaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbFxufSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3dcbn1cblxufSkod2luZG93KSJdfQ==
;