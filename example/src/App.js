import React, { Component } from 'react'

import jet from '@randajan/jetpack';

window.jet = jet;

export default class App extends Component {
  render () {
    return (
      <div>
        Open console and type "jet". Try what you wish.
      </div>
    )
  }
}
