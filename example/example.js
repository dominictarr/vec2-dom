
var domv = require('./')
var Vec2 = require('vec2')

var mouse = domv.mouse()

function drag (move) {
  var start = new Vec2(mouse.x, mouse.y)
  var diff = new Vec2(0, 0)
  function onMove () {
    move.call(
  }
  var onMove
  mouse.change(onMove = function () {
    move(diff.set(mouse.x, mouse.y).subtract(start)) 
  })
  window.addEventListener('mouseup', function () {
    mouse.ignore(onMove)
    diff.dropped = true
    move(diff)
  })
}

var div
document.body.appendChild(
  div = h('div',
    {style:
      {position: 'absolute'}
    }
    h('h1','DRAG ME', {
      onmousedown: function () {
        var abs = domv.absolute(div, true) //true means bound.
        var start = abs.clone()
        drag(function (move) {
          if(move.end) return          

          abs.set(start.add(move, true))
        })
      }
    })
  )

)
