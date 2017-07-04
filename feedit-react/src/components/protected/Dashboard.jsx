import React, { Component } from 'react';

import Snackbar from 'material-ui/Snackbar'
import RaisedButton from 'material-ui/RaisedButton';

import Clock from '../Clock.jsx'
import DataBoxContainer from '../DataBoxContainer.jsx'
import '../../css/materialize.css'
import '../../css/style.css'
import Navigator from '../Navigator.jsx'
import { firebaseAuth } from '../../config/constants'

class Dashboard extends Component {

// COMPONENT FUNCTIONS

	constructor(props){
		super(props)
    this.mql = window.matchMedia('(min-width: 480px)')
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this)
    this.toggleDrawer = this.toggleDrawer.bind(this)
    this.state = {
        loaded : false,
        open : false,
        mql: this.mql,
        docked: this.mql.matches,
        user: firebaseAuth().currentUser,
        drawerIsOpen : true,
    }
	}

  componentWillMount(){
    this.mql.addListener(this.mediaQueryChanged)
    this.setState({mql:this.mql, docked : this.mql.matches})
  }

  componentDidMount(){
    this.setState( { loaded : true, open: true } )
  }

  componentDidUpdate(){
    console.log('dashboard updated')
  }

// AUX FUNCTIONS --------------------------------------------------------------


  toggleDrawer(drawerStatus){
    this.setState( {drawerIsOpen : drawerStatus} )
  }

  handleToggle = () => this.setState({open: !this.state.open});

  mediaQueryChanged() {
    this.setState({
      docked: this.mql.matches,
      open: this.mql.matches
    })
  }

// RENDER FUNCTION ------------------------------------------------------------

  render() {
    const sideMargin = () => {
      if (this.state.drawerIsOpen){
        return 'side-margin'
      } else {
        return ''
      }
    }

    return (
      <div style={{height : 100+'%'}}>
        <Navigator user={this.state.user} toggleDrawer={this.toggleDrawer}/>
          <div style={{height : 100+'%',overflowY: 'auto'}}>
            <div id="Dashboard" className='dashboard data-container'>
              <div className={sideMargin()}>
                <Clock />
                <DataBoxContainer/>
                <Snackbar 
                  open={this.state.open}
                  message="Usuário autenticado com sucesso!"
                  autoHideDuration={4000}
                  onRequestClose={this.handleToggle}
                />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
