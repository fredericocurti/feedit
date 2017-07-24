import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar'
import Popover from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import FontIcon from 'material-ui/FontIcon';

import { logout } from '../helpers/auth'

class Navigator extends Component {

// COMPONENT FUNCTIONS

  constructor(props) {
    super(props);
    this.mql = window.matchMedia('(min-width: 480px)')
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this)
    this.toggleDrawer = this.toggleDrawer.bind(this)
    this.state = {
      open: false,
      anchorEl: null,
      user : this.props.user,
      show : false,
      drawer : null
    };
  }


componentWillMount(){
    console.log('navbar will mount')
    this.mql.addListener(this.mediaQueryChanged)
    this.setState({mql:this.mql, docked : this.mql.matches})

}

// --------------------------------------------------------------------------- 
// AUX FUNCTIONS

toggleDrawer(){
    this.props.toggleDrawer(!this.drawer.state.open)
    this.drawer.setState( { open : !this.drawer.state.open })
}

handleLogout = (event) => {

    event.preventDefault();
    // This prevents ghost click.
    logout()
    window.location.reload()

    this.setState({
      user:null,
    });
  }

handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  handleToggle = () => this.setState({open: !this.state.open});

  mediaQueryChanged() {
    this.setState({
      docked: this.mql.matches,
      open: this.mql.matches
    })
  }

  // --------------------------------------------------------------------------
  // RENDER FUNCTION


render () {

    let navbar = () => {
        return(
            <div key='navbar' className="navbar-fixed" style={{ height: 50, zIndex: 5}}>
                <nav className="nav">
                    <div id="navbar" className="nav-wrapper gradient sticky" style={{ zIndex : 2 }}>
                        <ul>
                            <div className="centered center logo">feedit</div>
                        </ul>
                        <ul className="left">
                        <li>
                            <div className="row valign-wrapper">
                                <a onClick={this.toggleDrawer}>
                                    <FontIcon style={{color: 'white', marginTop: 12.5}} className="material-icons" >dehaze</FontIcon>
                                </a>
                            </div>
                        </li>
                        </ul>
                    </div>
                </nav>
            </div>
        )
    }
    
    let sidebar = () => {
        return (
            <Drawer
                key='sidebar'
                docked={this.state.docked}
                containerClassName='drawer'
                width={250}
                ref={ (Drawer) => { this.drawer = Drawer } } >
                
                    <FlatButton className='avatarBtn'
                        onTouchTap={this.handleTouchTap}
                        hoverColor={ 'rgba(130,130,130,0.5)' }>
                        <Avatar src={this.props.user.photoURL} className='userImg' />
                        <Popover
                            open={this.state.open}
                            anchorEl={this.state.anchorEl}
                            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                            targetOrigin={{horizontal: 'middle', vertical: 'top'}}
                            onRequestClose={this.handleRequestClose}
                        >
                            <Menu>
                                <MenuItem 
                                    disabled 
                                    primaryText={ <div style={{fontSize: 14}}>{this.props.user.email}</div> }/>
                                <Divider/>
                                <MenuItem primaryText="Ajuda &amp; feedback" />
                                <MenuItem primaryText="Configurações" />
                                <MenuItem primaryText="Sair" onTouchTap={this.handleLogout}/>
                            </Menu>
                        </Popover>                            
                    </FlatButton>

                <MenuItem disabled
                    primaryText={ 
                        <ul className='drawer-item' style={{color: 'white', marginTop: 0}}>
                            {this.state.user.email}
                        </ul>
                    }
                />
                <MenuItem style={{marginTop:20}}
                    leftIcon={<FontIcon className="material-icons" >home</FontIcon>}
                    primaryText='Visão Geral'
                />

                {/* final da navbar */}
                <div className='sidebar-bottom-item'>
                    <Divider/>
                    <MenuItem leftIcon={<FontIcon className="material-icons" >help</FontIcon>} primaryText="Ajuda &amp; feedback" />
                    <MenuItem leftIcon={<FontIcon className="material-icons" >settings</FontIcon>} primaryText="Configurações" />
                    <MenuItem 
                        leftIcon={<FontIcon className="material-icons" >power_settings_new</FontIcon>} 
                        primaryText="Sair" onTouchTap={this.handleLogout}
                    />
                </div>



            </Drawer>
        )
    }

    let navigator = () => {
        return [ navbar() , sidebar() ]
    }

    return(
        <div id='navigator' style={{overflow: 'auto'}}>
            {this.state.user 
                ? navigator() 
                : null
            }
        </div>
    )
}

}

export default Navigator;
