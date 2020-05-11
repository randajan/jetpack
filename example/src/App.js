import React, { Component } from 'react'

import jet from '@randajan/jetpack';

window.jet = jet;

setTimeout(_=>jet.event.listenShift(document.getElementById("x4")), 2000);

export default class App extends Component {
  render () {
    return (
      <div>
        Open console and type "jet". Try what you wish.
        <div id="x1" style={{height:"2000px", width:"2000px"}}>
          <div id="x2" style={{position:"relative", height:"200px", width:"200px", top:"50%", left:"50%", overflow:"scroll", "border":"10px solid black"}}>
            <div id="x3" style={{position:"relative", height:"100px", width:"100px", "border":"1px solid red"}}>
              <div id="x4" style={{position:"absolute", height:"50px", width:"50px", "backgroundColor":"green", "transform":"translate(-50%, -50%)"}}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
