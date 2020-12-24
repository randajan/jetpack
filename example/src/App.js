import React, { Component } from 'react'

import jet, { jet2 } from '@randajan/jetpack';

window.jet = jet;
window.jet2 = jet2;


// setTimeout(_=>jet.event.listenShift(document.getElementById("x4"), (ev, bound)=>{
//   console.log(bound.relX, bound.relY);
//   //console.log(bound.dir, bound.time, bound.dist);
//   //alert([bound.dir, bound.time, bound.dist].joins(", "))
//   if (bound.state === "stop") {
//     bound.relX = jet.num.snap(bound.relX, .25, 0, 1);
//     bound.relY = jet.num.snap(bound.relY, .25, 0, 1);
//   }

// }, true, .25, .25), 1000);

export default class App extends Component {
  render () {
    return (
      <div>
        Open console and type "jet". Try what you wish.
        <div id="x1" style={{height:"2000px", width:"2000px"}}>
          <div id="x2" style={{position:"relative", height:"200px", width:"200px", top:"50%", left:"50%", overflow:"scroll", "border":"10px solid black"}}>
            <div id="x3" style={{position:"relative", height:"100px", width:"100px", "border":"1px solid red"}}>
              <div id="x4" style={{position:"absolute", height:"50px", width:"50px", top:"50%", left:"50%", "backgroundColor":"green", "transform":"translate(-50%, -50%)"}}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
