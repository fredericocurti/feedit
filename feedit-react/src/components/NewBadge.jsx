import React, { Component } from 'react';
import moment from 'moment';

class NewBadge extends React.Component {
	constructor(props){
		super(props);
	}

	componentWillMount(){
  	}

    checkGrammar(){
        if (this.props.count != 1){
            return 'Novas'
        } else {
            return 'Nova'
        }
    }

	render () {
		return (
          <span onClick={this.props.resetFunction} key={'badge-new-' + this.props.badgetype} className="new badge green" data-badge-caption={this.checkGrammar()}>{this.props.count}</span>
        )
	}
}

export default NewBadge;
