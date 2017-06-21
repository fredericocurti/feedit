import React, { Component } from 'react';
import {Collapsible,CollapsibleItem} from 'react-materialize'
import firebase from 'firebase'

class DataBox extends React.Component {
	constructor(props){
		super(props);
		this.state = { data: [] };
	}

	// componentWillMount(){
    // /* Create reference to messages in Firebase Database */
    // let messagesRef = firebase.database().ref(firebase.auth().currentUser.uid + '/data/feedbacks/banheiro').orderByKey().limitToLast(100);
    // messagesRef.on('child_added', snapshot => {
    //   /* Update React state when message is added at Firebase Database */
    //   let message = { text: snapshot.val(), id: snapshot.key };
    //   this.setState({ data: [message].concat(this.state.messages) });
    // })
  	// }


	render () {
		return (
			<Collapsible popout>
				<CollapsibleItem header='First' icon='filter_drama'>
					Lorem ipsum dolor sit amet.
				</CollapsibleItem>
				{
					this.state.data.map( message => <CollapsibleItem key={message.id}> {message.text} </CollapsibleItem>)
				}
			</Collapsible>
		);
		}
}

export default DataBox;
