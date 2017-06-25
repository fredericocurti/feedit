import React, { Component } from 'react';
import Clock from '../Clock.jsx'
import DataBoxContainer from '../DataBoxContainer.jsx'
import NavBar from '../NavBar.jsx'
import '../../css/materialize.css'
import '../../css/style.css'

class Dashboard extends Component {

  render() {
    return (
      <div id="Dashboard" style={{width : 100 + '%'}}>
        <Clock />
        <DataBoxContainer/>
      </div>
    );
  }
}

export default Dashboard;
