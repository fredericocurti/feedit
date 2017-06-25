import React, { Component } from 'react';
import moment from 'moment';

class NewBadge extends React.Component {
	constructor(props){
		super(props);
	}

	componentWillMount(){
  	}

    coloredGrade(grade){
        return ( 
            <div className={"col s4 left-align nota-"+ grade}> {grade.replace(/\b\w/g, l => l.toUpperCase())} </div>
        )
    }

    checkGrammar(){
        if (this.props.count != 1){
            return 'Novas'
        } else {
            return 'Nova'
        }
    }

    
    // onBadgeClick() {
    //     this.props.resetFunction()
    //     // event.currentTarget.style.backgroundColor = '#ccc';
    // }

	render () {
		return (
          <span onClick={this.props.resetFunction} key={'badge-new-' + this.props.badgetype} className="new badge green" data-badge-caption={this.checkGrammar()}>{this.props.count}</span>
        )
	}
}

export default NewBadge;
