import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';


class SideBar extends React.Component {
	constructor(props){
		super(props);
	}

	componentWillMount(){
  	}


	render () {
		return (
            <Drawer
				docked={this.props.docked}
				containerClassName='drawer'
				width={225}
            >
                <MenuItem disabled primaryText={ <ul className='drawer-item'> { (this.props.user.email) 
					? this.props.user.email
					: null } </ul>} />
            </Drawer>
        )
	}
}

export default SideBar;
