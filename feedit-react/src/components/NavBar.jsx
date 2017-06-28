import React, { Component } from 'react';
import { Navbar,NavItem } from 'react-materialize'
import Avatar from 'material-ui/Avatar'
import Popover from 'material-ui/Popover'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';

import { logout } from '../helpers/auth'

class NavBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null,
      user : this.props.user,
      show : false,
    };
  }

componentWillMount(){
    console.log('navbar will mount')    
}


handleLogout = (event) => {
    event.preventDefault();
    // This prevents ghost click.
    logout()
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

render () {
    if (this.props.user){
        return(
        <div className="navbar-fixed" style={{ height:60 }}>
            <nav className="nav">
                <div id="navbar" className="nav-wrapper navcolor sticky" style={{ zIndex : 2 }}>
                    <ul>
                        <div className="centered text-align center" >feedit</div>
                    </ul>
                    <ul className="left">
                    <li>
                        <div id="slide-button" className="row">
                            <a>SLIDER</a>
                        </div>
                    </li>
                    </ul>
                    <ul className="right">
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
                            {/*<a>{this.props.children}</a>*/}
                        </FlatButton>
                    </ul>
                </div>
            </nav>
        </div>

	    );
    } else {
        return (
            <div/>
    )
        
    }

    }
}

export default NavBar;
