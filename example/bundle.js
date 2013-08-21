;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var domv = require('../')
var Vec2 = require('vec2')
var h    = require('hyperscript')
var o    = require('observable')

var mouse = domv.mouse()

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

var mouse, scroll, screen

var element =
exports.element = function (el, bind) {
  var rec = el.getBoundingClientRect()    
  var rec2 = new Rec2
  
  var style = getComputedStyle(el)
  console.log(style.left, style.right)
  rec2.set(rec.left - parseFloat(style['margin-left'])
    , rec.top - parseFloat(style['margin-top']))
  //check if it's actually a Rec2 - if it's a vec2
  //skip this step.
  if(rec2.size)
    rec2.size.set(rec.width, rec.height)

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

var touch
exports.touch = function (el) {
  el = el || document.body
  if(touch) return touch
  touch = new Vec2()
  touch.set(0, 0)
  el.addEventListener('touchmove', onTouchMove)
  el.addEventListener('MozTouchMove', onTouchMove)

  function onTouchMove (e) {
    var m = e.touches[0]
    touch.set(m.clientX, m.clientY)
  }

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

exports.size = function (el, bind) {
  
}

},{"vec2":3,"rec2":6}],4:[function(require,module,exports){
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

},{"browser-split":7,"class-list":8,"data-set":9}],10:[function(require,module,exports){
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

},{"events":11}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
},{"__browserify_process":12}],6:[function(require,module,exports){
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

},{"util":10,"vec2":3}],9:[function(require,module,exports){
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
;