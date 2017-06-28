import React, { Component } from 'react';
import moment from 'moment';

class DataRow extends Component {
	constructor(props){
		super(props);
        this.state = {
            isNew: this.props.isNew
        }
	}

	componentWillMount(){
  	}

    componentDidMount(){
        if (this.state.isNew && this.props.boxstate && this.props.windowstate){
            this.refresh = setTimeout( 
            () => this.setSeen(),
            500 );
        }
    }

    setSeen(){
        this.setState({ isNew : false })
        }

    coloredGrade(grade){
        return ( 
            <div className={"col s4 left-align nota-"+ grade}> {grade.replace(/\b\w/g, l => l.toUpperCase())} </div>
        )
    }

    // onRowClick() {
    //     console.log("row clicked")
    //     var current = this.state.color
    //     this.setState({
    //         color: !current
    //     })
    // }

    componentDidUpdate(){
        if (this.state.isNew && this.props.boxstate && this.props.windowstate){
            this.refresh = setTimeout( 
            () => this.setSeen(),
            500 );
        }
    }

	render () {
        if (this.state.isNew){
            var stylebg = { backgroundColor : '#d5f6ff' }
        }
		return (
            <div className={'datarow row'} style={stylebg}>
                {this.coloredGrade(this.props.score)}
                <div className='col s4 center-align'> {moment(this.props.date).format('LTS')} </div>
                <div className='col s4 right-align'> {moment(this.props.date).format('L')} </div>
            </div>
        )
	}
}

export default DataRow;
