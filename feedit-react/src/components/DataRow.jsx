import React, { Component } from 'react';
import moment from 'moment';

class DataRow extends React.Component {
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


	render () {
		return (
            <div className='datarow row'>
                {this.coloredGrade(this.props.score)}
                <div className='col s4 center-align'> {moment(this.props.date).format('LTS')} </div>
                <div className='col s4 right-align'> {moment(this.props.date).format('L')} </div>
            </div>
        )
	}
}

export default DataRow;
