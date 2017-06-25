import React, { Component } from 'react';
// import {Collapsible,CollapsibleItem} from 'react-materialize'
import NewBadge from './NewBadge.jsx'
import DataRow from './DataRow.jsx'
import firebase from 'firebase'
import Collapsible from 'react-collapsible'

class DataBox extends React.Component {
	constructor(props){
		super(props);
		this.resetNewBadge = this.resetNewBadge.bind(this)
		this.updateChildren = this.updateChildren.bind(this)
		this.state = {
			initialHasLoaded: false,
			newUnseen: 0,
			data: [],
			counters: {
				initial : 0,
				excelente: 0,
				bom: 0,
				ruim : 0
			},
			badgeColors: {
				excelente: '#67e200',
				bom: '#ff9800',
				ruim: 'red'
			}
		};
	}

	increaseCounters(score){
		this.state.counters[score] ++
	}

	// Static badges
	showExcelenteBadge(){
		if (this.state.counters.excelente > 0){
		return (
			<span key={this.props.boxname + '-excelente-counter'}
			className='new badge circular-badge' style={{backgroundColor:this.state.badgeColors['excelente']}} data-badge-caption={this.state.counters.excelente}></span>
			);
		}
	}
	showBomBadge(){
		if (this.state.counters.bom > 0){
			return (
				<span key={this.props.boxname + '-bom-counter'}
				className='new badge circular-badge' style={{backgroundColor:this.state.badgeColors['bom']}} data-badge-caption={this.state.counters.bom}></span>
			);
		}
	}
	showRuimBadge(){
		if (this.state.counters.ruim > 0){
			return (
				<span key={this.props.boxname + '-ruim-counter'}
				className='new badge circular-badge' style={{backgroundColor:this.state.badgeColors['ruim']}} data-badge-caption={this.state.counters.ruim}></span>
			);
		}
	}

	// Dynamic badges
	showNewBadge(){
		if (this.state.newUnseen > 0){
			return(
				<NewBadge key={this.props.boxname + '-new-badge'} count={this.state.newUnseen} resetFunction={this.resetNewBadge}/> 
			)
		}
	}

	resetNewBadge(){
		this.setState({ newUnseen : 0 })
	}

	componentWillUpdate(){
		this.showNewBadge()
	}

	componentWillMount(){
    /* Create reference to messages in Firebase Database */
    let feedbacksRef = firebase.database().ref(firebase.auth().currentUser.uid + '/data/feedbacks/' + this.props.boxname ).orderByKey().limitToLast(100);

    feedbacksRef.on('child_added', snapshot => {
       /* Update React state when message is added at Firebase Database */
    	let review = { 
			key : snapshot.key,
			score: snapshot.val().score,
			date: snapshot.val().date 
		};

		this.increaseCounters(review.score)
		var datas = this.state.data
		datas.unshift(review)
    	this.setState({ data: datas });

		// Handles live added data
		if(this.state.initialHasLoaded){
			console.log("New data added to box " + this.props.boxname)
			var localnewUnseen = this.state.newUnseen
			localnewUnseen ++
			this.setState({
				newUnseen : localnewUnseen
			})
		}


     })
	 	feedbacksRef.once('value', snapshot => {
			this.state.counters.initial = snapshot.numChildren()
			if (this.state.counters.initial == this.state.data.length){
				console.log("Initial data loaded @ " + this.props.boxname)
				this.state.initialHasLoaded = true;
				// this.collapsible.updateChildren()
			}
	 })

  	}

	rowVisibilityManager(){
		if (this.state.initialHasLoaded == false){
			return true
		} else {
			return false
		}
	}

	componentDidMount(){
		console.log(this.collapsible)
	}

	updateChildren(){
		console.log('updating children')
		this.collapsible.updateChildren(this.collapsible.state.children)
	}


	render () {
		return (
			/*<Collapsible popout>
				<CollapsibleItem header={[
					this.props.boxname.replace(/\b\w/g, l => l.toUpperCase()),
					<span key={this.props.boxname + '-total-counter'} className="badge counter-badge" data-badge-caption={this.state.data.length}></span>,
					this.showNewBadge(),this.showRuimBadge(),this.showBomBadge(),this.showExcelenteBadge()
				]} children={this.state.data.map( review => <DataRow key={review.key} new={this.rowVisibilityManager()} score={review.score} date={review.date} uc={this.updateChildren}/>)}
				ref = {(CollapsibleItem) => {this.collapsible = CollapsibleItem}}/>
			</Collapsible>*/
			
			<Collapsible openedClassName='Collapsible open' triggerClassName='Collapsible__trigger waves-effect waves-subtle' 
			triggerOpenedClassName='Collapsible__trigger waves-effect waves-subtle open' 
			trigger={[
					this.props.boxname.replace(/\b\w/g, l => l.toUpperCase()),
					<span key={this.props.boxname + '-total-counter'} className="badge counter-badge" data-badge-caption={this.state.data.length}></span>,
					this.showNewBadge(),this.showRuimBadge(),this.showBomBadge(),this.showExcelenteBadge()
				]} transitionTime={220} easing='ease-out'>
				{this.state.data.map( review => <DataRow key={review.key} new={this.rowVisibilityManager()} score={review.score} date={review.date} uc={this.updateChildren}/>)}
			</Collapsible>
		);
	}
}

export default DataBox;
