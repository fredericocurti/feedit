import React, { Component } from 'react';
import Headroom from 'react-headroom'
import Snackbar from 'material-ui/Snackbar'
import Home from '../Home.jsx'
import '../../css/materialize.css'
import '../../css/style.css'
import Navigator from '../Navigator.jsx'
import { firebaseAuth } from '../../config/constants'

import Popover from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';


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
    // console.log('dashboard updated')
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
          <div style={{height : 100+'%',overflowY: 'auto'}}>
              <Navigator user={this.state.user} toggleDrawer={this.toggleDrawer}/>
            <div style={{height: 250, backgroundColor: '#ed4264'}}/>
            <div id="Dashboard" className='data-container'>
              <div className={sideMargin()}>
                <div className='container'>
                {/*<DoughnutExample/>*/}
                <Home/>
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
