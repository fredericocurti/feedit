import React, { Component } from 'react';

class Badge extends React.Component {

// COMPONENT FUNCTIONS 

	constructor(props){
		super(props);
	}

	componentWillMount(){
  	}


// --------------------------- //
// AUX FUNCTIONS

    checkGrammar(){
        if (this.props.count != 1){
            return 'Novas'
        } else {
            return 'Nova'
        }
    }

    checkType(){
        if (this.props.type == 'new'){
            return 'green'
        } else {
            return 'cyan lighten-2'
        }
    }


// ----------------------- //
// RENDER FUNCTION

	render () {
		return (
          <span 
            onClick={this.props.resetFunction} 
            key={'badge-new-' + this.props.badgetype} 
            className={"new badge " + this.checkType()} 
            data-badge-caption={this.checkGrammar()}
          >
            {this.props.count}
          </span>

          
        )
	}
}

export default Badge;
