import React, { Component } from 'react';
import moment from 'moment';

class DataRow extends React.Component {
	constructor(props){
		super(props);
        this.onRowClick = this.onRowClick.bind(this)
        this.state = {
            color: false
        }
	}

	componentWillMount(){
  	}

    coloredGrade(grade){
        return ( 
            <div className={"col s4 left-align nota-"+ grade}> {grade.replace(/\b\w/g, l => l.toUpperCase())} </div>
        )
    }

    onRowClick() {
        console.log("row clicked")
        var current = this.state.color
        this.setState({
            color: !current
        })
    }

	render () {
        if (this.state.color){
            var stylebg = { backgroundColor : 'lightblue' }
        } else {
            var stylebg = {}
        }
		return (
            <div className={'datarow row'} onClick={this.onRowClick} style={stylebg}>
                {this.coloredGrade(this.props.score)}
                <div className='col s4 center-align'> {moment(this.props.date).format('LTS')} </div>
                <div className='col s4 right-align'> {moment(this.props.date).format('L')} </div>
            </div>
        )
	}
}

export default DataRow;
