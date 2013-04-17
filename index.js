var Vec2 = require('vec2')
var Rec2 = require('rec2')

var mouse, scroll, screen

var element =
exports.element = function (el) {
  var rec = el.getBoundingClientRect()    
  var rec2 = new Rec2
  rec2.set(rec.left, rec.top)
  //check if it's actually a Rec2 - if it's a vec2
  //skip this step.
  if(rec2.size)
    rec2.size.set(rec.width, rec.height)
  return rec2
}

exports.mouseEvent = function (ev) {
  return new Vec2(ev.clientX, ev.clientY)
}

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

