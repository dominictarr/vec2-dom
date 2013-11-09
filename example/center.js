var h = require('hyperscript')
var vdom = require('../')

var hello = h('h1', "hello Jing.js", {style :{color: 'yellow'}})
var outer = h('div', {style: {background: 'red', width: '600px', height: '400px'}}, hello)

document.body.appendChild(outer)

var r1 = vdom.element(outer)
var r2 = vdom.absolute(hello, true)

r2.set(r1.size.divide(2, true).subtract(r2.size.divide(2, true)))






