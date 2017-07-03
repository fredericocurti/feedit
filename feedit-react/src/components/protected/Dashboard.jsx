import React, { Component } from 'react';

import Snackbar from 'material-ui/Snackbar'
import RaisedButton from 'material-ui/RaisedButton';

import Clock from '../Clock.jsx'
import DataBoxContainer from '../DataBoxContainer.jsx'
import NavBar from '../NavBar.jsx'
import '../../css/materialize.css'
import '../../css/style.css'

import SideBar from '../SideBar'
import { firebaseAuth } from '../../config/constants'

class Dashboard extends Component {
	constructor(props){
		super(props)
    this.mql = window.matchMedia('(min-width: 480px)')
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this)
    this.state = {
        loaded : false,
        open : false,
        mql: this.mql,
        docked: this.mql.matches,
        user: firebaseAuth().currentUser
    }
	}

  componentWillMount(){
    this.mql.addListener(this.mediaQueryChanged)
    this.setState({mql:this.mql, docked : this.mql.matches})
  }

  componentDidMount(){
    this.setState( { loaded : true } )
  }

  handleToggle = () => this.setState({open: !this.state.open});

  mediaQueryChanged() {
    this.setState({
      docked: this.mql.matches,
      open: this.mql.matches
    })
  }

  render() {
    return (
      <div id="Dashboard" className='dashboard data-container'>
        <div className='side-margin'>
          <Clock />
          <DataBoxContainer/>
          <Snackbar 
            open={this.state.loaded}
            message="Usuário autenticado com sucesso!"
            autoHideDuration={4000}
          />
        </div>
      </div>
    );
  }
}

export default Dashboard;
