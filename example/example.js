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


