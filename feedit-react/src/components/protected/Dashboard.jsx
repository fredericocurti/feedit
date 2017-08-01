import React, { Component } from 'react';
// import Snackbar from 'material-ui/Snackbar'

import Settings from '../Settings.jsx'
import Home from '../Home.jsx'
import '../../css/materialize.css'
import '../../css/style.css'
import Navigator from '../Navigator.jsx'
import { firebaseAuth } from '../../config/constants'


// import Popover from 'material-ui/Popover'
// import Menu from 'material-ui/Menu'
// import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton';
// import Divider from 'material-ui/Divider';
// import Avatar from 'material-ui/Avatar';
import Dialog from 'material-ui/Dialog';
import MediaQuery from 'react-responsive'


import Store from '../../helpers/store.js'
import Notifications from '../../helpers/notifications'
import allow_desktop from '../../img/allow-desktop.png'


class Dashboard extends Component {

// COMPONENT FUNCTIONS

	constructor(props){
		super(props)
    this.mql = window.matchMedia('(min-width: 480px)')
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this)
    this.toggleDrawer = this.toggleDrawer.bind(this)
    this.switchComponent = this.switchComponent.bind(this)
    this.state = {
        loaded : false,
        mql: this.mql,
        docked: this.mql.matches,
        user: firebaseAuth().currentUser,
        drawerIsOpen : true,
        currentComponent : 'home',
        dialogOpen: false
    }

	}

  componentWillMount(){
    this.mql.addListener(this.mediaQueryChanged)
    this.setState({mql:this.mql, docked : this.mql.matches})
  }

  componentDidMount(){
    this.setState({loaded : true, open: true })
    
  }

  componentDidUpdate(){
    // console.log('dashboard updated')
  }

// AUX FUNCTIONS --------------------------------------------------------------


  toggleDrawer(drawerStatus){
    this.setState( {drawerIsOpen : drawerStatus} )
  }

  handleOpen = () => {
    this.setState({dialogOpen: true});
  };

  handleClose = () => {
    this.setState({dialogOpen: false});
  };


  mediaQueryChanged() {
    this.setState({
      docked: this.mql.matches,
      open: this.mql.matches
    })
  }

  switchComponent(nextComponent) {
    if (nextComponent != this.state.currentComponent && Store.isReady()){
      switch(nextComponent){
        case 'home':
          this.setState({ currentComponent : 'home' })
          break
        case 'settings':
          this.setState({ currentComponent : 'settings' })
      }
    }
    
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

    const getCurrentComponent = () => {
      let comp = this.state.currentComponent
      if (comp == 'home'){
        return <Home/>
      } else if (comp == 'settings'){
        return <Settings/>
      }
    }

    const notificationStatusDialog = () => {
      this.actions = [
        <FlatButton
          label="Ok"
          primary={true}
          keyboardFocused={true}
          onTouchTap={this.handleClose}
        />,
    ];
      return <Dialog
                title={
                  "Para ser notificado sobre novas avaliações " +
                  "habilite as notificações automáticas como mostra a imagem abaixo"
                }
                actions={this.actions}
                modal={false}
                open={this.state.dialogOpen}
                onRequestClose={this.handleClose}
              >
                <img style={{margin:'0 auto',display:'block'}}src={allow_desktop}/>
            </Dialog>

    }


    return (
        <div style={{height : 100+'%',overflowY: 'auto'}}>
        { notificationStatusDialog() }
        <Navigator 
            user={this.state.user} 
            toggleDrawer={this.toggleDrawer} 
            switchComponent={this.switchComponent}
        />

        <MediaQuery minDeviceWidth={1224}>
            <div style={{height: 250, backgroundColor: '#ed4264'}}/>
            <div id="Dashboard" className='data-container'>
              <div className={sideMargin()}>
                <div className='container'>
                { getCurrentComponent() }
              </div>
            </div>
          </div>
        </MediaQuery>

        <MediaQuery maxDeviceWidth={1224}>
        {/*<div>You are a tablet or mobile phone</div>*/}
            <div className={sideMargin()}>
                <div className='container'>
                  { getCurrentComponent() }
              </div>
            </div>
        </MediaQuery>


          
        </div>
    );
  }
}

export default Dashboard;
