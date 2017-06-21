import React, { Component } from 'react';
import {Navbar,NavItem} from 'react-materialize'

class NavBar extends React.Component {

render () {
	return (
        <Navbar brand='feedit' right style={{backgroundColor:"#FFFFFF"}}>
            <NavItem href='components.html'>Components</NavItem>
        </Navbar>

	    );
    }
}

export default NavBar;
