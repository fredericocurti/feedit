import React, { Component } from 'react';
import {Navbar,NavItem} from 'react-materialize'

class NavBar extends React.Component {

render () {
	return (
        // <Navbar brand='feedit' right style={{backgroundColor:"#FFFFFF"}}>
        //     <NavItem href='components.html'>Components</NavItem>
        // </Navbar>

        // style="position:relative;top:-7px;margin-left:10px;color:white;display:inline-block"
        // style="display:inline-block"
        // style="height:inherit;
        
        // style="color:white;display:none;height:100%"
        // style="height:inherit;"
        // style="height:inherit;font-size:0.85rem;color:white;display:none;"

        //style="color:rgb(238, 71, 58);width:130px;margin-left:0px;"


        <div className="navbar-fixed" style={{ height:50 }}>
            <nav className="nav">
                <div id="navbar" className="nav-wrapper navcolor sticky" style={{ zIndex : 2 }}>
                    <ul>
                        <a href="#" className="centered text-align center" >feedit</a>
                    </ul>
                    <ul className="left">
                    <li>
                        <div id="slide-button" className="row">
                            <a>SLIDER</a>
                        </div>
                    </li>
                    </ul>
                    <ul id="nav-mobile" className="right">
                        <li>
                            <a>USERBADGE</a>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>

	    );
    }
}

export default NavBar;
