var Vec2 = require('vec2')
var Rec2 = require('rec2')

var mouse, scroll, screen, size

var element =
exports.element = function (el, bind) {
  var rec = el.getBoundingClientRect()    
  var rec2 = new Rec2()
  
  var style = getComputedStyle(el)

  rec2.set((rec.left || 0)  - (parseFloat(style['margin-left']) || 0)
    , (rec.top || 0) - (parseFloat(style['margin-top']) || 0)) 
  //check if it's actually a Rec2 - if it's a vec2
  //skip this step.

  if(rec2.size)
    rec2.size.set(rec.width, rec.height)

  if(bind) {
    rec2.size.change(function (size) {
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

exports.absolute = function (el, bind) {
  //if we are binding, it changes the layout rules
  //for say, divs, so do that first.
  if(bind)
    el.style.position = 'absolute'

  var absolute =
    element(el, bind).subtract(element(el.parentElement))

  if(bind) {
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

