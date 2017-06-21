import React, { Component } from 'react';
import Clock from '../Clock.jsx'
import DataBox from '../DataBox.jsx'
import NavBar from '../NavBar.jsx'
import '../../css/materialize.css'
import '../../css/style.css'

class Dashboard extends Component {

 doStuff() {
    return console.log("eaemenkk")
  }

  render() {
    return (
      <div>
        <Clock />
        <DataBox/>
        <DataBox/>
      </div>
    );
  }
}

export default Dashboard;
