import React, { Component } from 'react';


class DataRow extends Component {
    
    // COMPONENT FUNCTIONS

	constructor(props){
        super(props);
        this.showDeleteBtn = this.showDeleteBtn.bind(this)
        this.doubleClicked = this.doubleClicked.bind(this)
        this.triggerDeleteRow = this.triggerDeleteRow.bind(this)
        this.getClass = this.getClass.bind(this)

        this.state = {
            isNew : this.props.isNew,
            deleteBtnVisible : false,
        }
	}

	componentWillMount(){
        if (this.props.isNew){
            // console.log('NEW ROW MOUNTING')
            this.setState({ class :'row datarow new' })
            // this.setSeen({ isNew: true,seen: false })
        } else {
            this.setState({ class :'row datarow' })
        }
  	}

    componentDidMount(){
        if (this.props.isNew && this.props.boxstate && this.props.windowstate){
            // console.log('ROW MOUNTED WITH CLASS', this.state.class)
            // console.log('SWITCHING BACK')
            this.setBack()
        }
    }

    setBack(){
        setTimeout(() => {
            this.setState({ class: 'row datarow'})
            this.props.setRowAsSeen(this.props.review.key)
        },1)
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.isNew === true && this.props.isNew === false){
            this.setState({ class :'row datarow new' }, () => {
                if (this.props.boxstate && this.props.windowstate){
                    this.setBack()
                }
            })
        }
    }

    componentDidUpdate(){
        // console.log('row updated')
        if (this.props.isNew && this.props.boxstate && this.props.windowstate){
            this.setBack()
        }
    }

    shouldComponentUpdate(nextProps,nextState){
        if (this.props.isNew || this.props.isNew != nextProps.isNew || 
        this.state.deleteBtnVisible != nextState.deleteBtnVisible){
            return true
        } else {
            return false
        }
    }

    // ---------------------------------------------
    // AUX FUNCTIONS

    setSeen(){
        this.setState({ seen : true })
    }

    getClass(){
        if (this.props.isNew){
            return 
         } else {
             return 'row datarow'
        }
    }


    coloredGrade(grade){
        return ( 
            <div className={`col ${this.state.deleteBtnVisible ? "s3" : "s4"} left-align`} 
            style={{ color: this.props.color }}>
            {grade.replace(/\b\w/g, l => l.toUpperCase())} 
            </div>
        )
    }


    doubleClicked(){
        this.setState({deleteBtnVisible : !this.state.deleteBtnVisible})
        console.log('double clicked')
    }

    triggerDeleteRow(){
        console.log('row key')
        this.props.deleteRow(this.props.review.key)
    }

    showDeleteBtn(){
        if (this.state.deleteBtnVisible){
            return <div onClick={this.triggerDeleteRow} className='col s1 left-align deletebtn' style={{color:'crimson'}}>✖</div>
        }
    }



    // ---------------------------------------
    // RENDER FUNCTION


	render () {
        const oldColor = '#d5f6ff'

		return (
            <div className={this.state.class} 
                onDoubleClick={this.doubleClicked}
            >
                { this.showDeleteBtn() }                
                {this.coloredGrade(this.props.review.score)}
                <div className={`col s4 center-align`}> {this.props.review.time} </div>
                <div className={`col s4 right-align`}> {this.props.review.date} </div>
            </div>
        )
	}
}

export default DataRow;
