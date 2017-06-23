import React, { Component } from 'react';
import {Collapsible,CollapsibleItem} from 'react-materialize'
import DataRow from './DataRow.jsx'
import firebase from 'firebase'

class DataBox extends React.Component {
	constructor(props){
		super(props);
		this.state = { data: [] };
	}

	componentWillMount(){
    /* Create reference to messages in Firebase Database */
    let messagesRef = firebase.database().ref(firebase.auth().currentUser.uid + '/data/feedbacks/' + this.props.boxname ).orderByKey().limitToLast(100);
    messagesRef.on('child_added', snapshot => {
       /* Update React state when message is added at Firebase Database */

       let review = { 
		   key : snapshot.key,
		   score: snapshot.val().score,
		   date: snapshot.val().date };
		
	   var datas = this.state.data
	   datas.unshift(review)
       this.setState({ data: datas });
     })
  	}

	render () {
		return (
			<Collapsible popout>
				{/*<CollapsibleItem header={this.props.boxname.replace(/\b\w/g, l => l.toUpperCase())}>*/}
				<CollapsibleItem header={[
				this.props.boxname.replace(/\b\w/g, l => l.toUpperCase()),
				<span className="new badge circular-badge" style={{backgroundColor:'#67e200'}} data-badge-caption="0"></span>,
				<span className="new badge circular-badge" style={{backgroundColor:'red'}} data-badge-caption="0"></span>,
				<span className="new badge circular-badge" style={{backgroundColor:'lightblue'}} data-badge-caption="0"></span>,
				
				]}>
					{this.state.data.map( review => <DataRow key={review.key} score={review.score} date={review.date} />)}
				</CollapsibleItem>

			</Collapsible>
		);
		}
}

export default DataBox;
