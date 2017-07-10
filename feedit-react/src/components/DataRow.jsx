import React, { Component } from 'react';

class DataRow extends Component {
    
    // COMPONENT FUNCTIONS

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

    componentDidUpdate(){
        // console.log('row updated')
        if (this.state.isNew && this.props.boxstate && this.props.windowstate){
            this.refresh = setTimeout( 
            () => this.setSeen(),
            500 );
        }
    }

    shouldComponentUpdate(nextProps,nextState){
        if (this.state.isNew === true || nextState.isNew != this.state.isNew){
            return true
        } else {
            return false
        }
    }

    // ---------------------------------------------
    // AUX FUNCTIONS

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
    

    // ---------------------------------------
    // RENDER FUNCTION


	render () {
        const oldColor = '#d5f6ff'
        if (this.state.isNew){
            var stylebg = { backgroundColor : '#ffff00'}
        }
		return (
            <div className={'datarow row'} style={stylebg}>
                {this.coloredGrade(this.props.score)}
                <div className='col s4 center-align'> {this.props.time} </div>
                <div className='col s4 right-align'> {this.props.date} </div>
            </div>
        )
	}
}

export default DataRow;
