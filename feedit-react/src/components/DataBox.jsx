import React, { Component } from 'react';
import {Preloader} from 'react-materialize'
import Badge from './Badge.jsx'
import DataRow from './DataRow.jsx'
import firebase from 'firebase'
import Collapsible from 'react-collapsible'
import {getMemory, setMemory} from '../helpers/memory'
import Avatar from 'material-ui/Avatar'
import moment from 'moment'
import 'moment/locale/pt-br';
import Notifications from '../helpers/notifications.js'

import Store from '../helpers/store.js'

let colors = Store.getStore('colors')

class DataBox extends React.Component {

// COMPONENT FUNCTIONS --------------------------------------------------------

	constructor(props){
		super(props);
		this.resetNewBadge = this.resetNewBadge.bind(this)
		this.resetMemoryBadge = this.resetMemoryBadge.bind(this)
		this.handleCollapsibleClick = this.handleCollapsibleClick.bind(this)
		this.requestOlderData = this.requestOlderData.bind(this)
		this.badgeColors = {
			excelente: colors.excelente,
			bom: colors.bom,
			ruim: colors.ruim
		}

		this.initialLoaded = false
							
		this.state = {
			dataHasLoaded: false,
			uid : this.props.userUid,
			newUnseen: 0,
			isOpen : false,
			isFocused: true,
			memoryDifference : 0,
			requested: 100,
			requestInc: 50,
			requestOffset: 0,
			data: [],
			displayingData: [0,50],
			counters: {
				excelente: 0,
				bom: 0,
				ruim : 0,
				total : 0
			},
		}

		this.boxRef = firebase.database()
			.ref('/users/' + this.state.uid + '/data/machines/' + this.props.boxname)

	}

	componentWillUpdate(){
	}
	
	componentWillMount(){
		moment.locale('pt-BR')
		if (Store.isReady()){
			let store = Store.getBox(this.props.boxname)
			this.setState({ data : store.reviews , counters : store.totalCounters},() => {
				this.setState({dataHasLoaded : true, requested : store.reviews.length, newUnseen : store.newUnseen})
			})
			this.initialLoaded = true
		}

		Store.subscribe(`databoxes_${this.props.boxname}`, this.onDataboxReceived = () => {
			let store = Store.getBox(this.props.boxname)
			this.setState({ counters: store.totalCounters, data : store.reviews },() => {
				this.setState({
					dataHasLoaded : true, 
					requested : store.reviews.length,
					newUnseen : store.newUnseen
				})
			})

			if (!this.initialLoaded){
				this.checkMemory()
			}

			this.initialLoaded = true

			})
	
		window.addEventListener("beforeunload", (ev) => {  
			ev.preventDefault();
			setMemory(this.props.userUid,this.props.boxname,this.state.counters.total)
		})
	}
	
	componentWillUnmount(){
		Store.unsubscribe(`databoxes_${this.props.boxname}`, this.onDataboxReceived)
		setMemory(this.state.userUid,this.props.boxname,this.state.counters.total)
		Store.resetBox(this.props.boxname)
	}


	// AUX FUNCTIONS --------------------------------------------------------------------


	// Static badges
	showExcelenteBadge(){
		if (this.state.counters.excelente > 0){
			return (
				<Avatar
					color={'white'}
					backgroundColor={this.badgeColors.excelente}
					size={26}
					style={{ marginLeft: 5}}
					key={'counter-excelente-'+this.props.boxname}
				>
          			{this.state.counters.excelente}
        		</Avatar>)
		}
	}
	showBomBadge(){
		if (this.state.counters.bom > 0){
			/*return (
				<span key={this.props.boxname + '-bom-counter'}
				className='new badge circular-badge' style={{backgroundColor:this.badgeColors['bom']}} data-badge-caption={this.state.counters.bom}></span>
			);*/
			return (
				<Avatar
					color={'white'}
					backgroundColor={this.badgeColors.bom}
					size={26}
					style={{ marginLeft: 5}}
					key={'counter-bom-'+this.props.boxname}
				>
          			{this.state.counters.bom}
        		</Avatar>)
		}
	}

	showRuimBadge(){
		if (this.state.counters.ruim > 0){
			return (
				<Avatar
					color={'white'}
					backgroundColor={this.badgeColors.ruim}
					size={26}
					style={{ marginLeft: 5}}
					key={'counter-ruim-'+this.props.boxname}
				>
          			{this.state.counters.ruim}
        		</Avatar>)
		}
	}

	// Dynamic badges
	showNewBadge(){
		if (this.state.newUnseen > 0){
			return(
				<Badge 
					type ='new'
					key={this.props.boxname + '-new-badge'} 
					count={this.state.newUnseen} 
					resetFunction={this.resetNewBadge}
				/> 
			)
		}
	}
	
	resetNewBadge(){
		Store.resetUnseen(this.props.boxname)
		this.setState({ newUnseen : 0 })
	}

	showMemoryBadge(){
		if (this.state.memoryDifference > 0) {
			return ( 
				<Badge 
					type='memory'
					key={this.props.boxname + '-memory-badge'}
					count={this.state.memoryDifference} 
					resetFunction={this.resetMemoryBadge}
				/>
			)
		}
	}

	resetMemoryBadge(){
		this.setState({ memoryDifference : 0 })
	}

	requestOlderData(){
		let dD = this.state.displayingData
		dD[1] += 50
		this.setState ({displayingData: dD })

		if (this.state.dataHasLoaded && dD[1] > this.state.requested){
			let newData = []

			this.setState({
				requested: this.state.requested + this.state.requestInc,
				}, () => {
				this.boxRef.child('entries')	
				.orderByChild('date')
				.limitToLast( this.state.requested + this.state.requestOffset )
				.once('value', snapshot => {
					console.log('requested more data @ box',this.props.boxname)
					snapshot.forEach( (snapshot) => {

						let review = Store.review(this.props.boxname,snapshot)
						newData.unshift(review)

					})
					
					newData = newData
						.slice(
						this.state.requested - this.state.requestInc + this.state.requestOffset,
						newData.length)
					
					let concatData = this.state.data.concat(newData)

					this.setState({
						data: concatData
					})
				})
			})
			
		}
	}

	checkMemory(){
		const currentLength = this.state.counters.total
		var memoryPromise = getMemory(this.props.boxname)
		memoryPromise.then(snapshot => {
			let memoryLength = snapshot.val()
			if (memoryLength != currentLength){
				console.log('there is a dif @ ' + this.props.boxname)
				const difference = currentLength - memoryLength
				this.setState( { memoryDifference : difference } )
			}
		})
	}

	handleCollapsibleClick(){
		if (this.state.isOpen){
			this.collapsible.closeCollapsible()
			this.setState({ isOpen : false })
		} else {
			this.collapsible.openCollapsible()
			this.setState({ isOpen : true })
		}
	}

	showMoreBtn(){
		if (this.state.counters.total > this.state.requested || this.state.data.length > this.state.displayingData[1]){
			return (
				<div>
					<a className='btn btn-flat' 
					style={{ margin: 'auto',display:'block'}}
					onClick={this.requestOlderData}
					>
						<b>+</b> Mostrar mais 
					</a>
				</div>
			)
		}
	};


// RENDER FUNCTION --------------------------------------------------------

	render () {
		var triggerarray = [
					this.props.boxname.replace(/\b\w/g, l => l.toUpperCase()),
					<span key={this.props.boxname + '-total-counter'} className="badge counter-badge" data-badge-caption={this.state.counters.total}></span>,
					<div className='counters' key={'counters-'+this.props.boxname}>					
						{[
						this.showExcelenteBadge(),
						this.showBomBadge(),
						this.showRuimBadge(),
						]}

					</div>,
					this.showNewBadge(),
					this.showMemoryBadge() 
			]

		var triggerLoader = () => {
			if (this.state.dataHasLoaded){
				return (triggerarray)
			} else {
				let triggerarrayMod = triggerarray
				triggerarrayMod[1] = <Preloader key='box-preloader' size='small' color='red' />
				return (triggerarrayMod)
			}	
		}


		const isLoaded = () => {
			if ( this.state.dataHasLoaded ){
				return 'loaded'
			}
		}

		let as = this.state.displayingData

		return (
			/*<Collapsible popout>
				<CollapsibleItem header={[
					this.props.boxname.replace(/\b\w/g, l => l.toUpperCase()),
					<span key={this.props.boxname + '-total-counter'} className="badge counter-badge" data-badge-caption={this.state.data.length}></span>,
					this.showNewBadge(),this.showRuimBadge(),this.showBomBadge(),this.showExcelenteBadge()
				]} children={this.state.data.map( review => <DataRow key={review.key} new={this.rowVisibilityManager()} score={review.score} date={review.date} uc={this.updateChildren}/>)}
				ref = {(CollapsibleItem) => {this.collapsible = CollapsibleItem}}/>
			</Collapsible>*/
			<div className='grid-item'>
				<Collapsible 
					ref = { (Collapsible) => { this.collapsible = Collapsible } }
					handleTriggerClick = { this.handleCollapsibleClick }
					openedClassName='open'
					triggerOpenedClassName='open'
					transitionTime={250} 
					easing='ease'
					trigger={ triggerLoader() }
					>

						{ this.state.data.slice(as[0],as[1]).map( review => 
							<DataRow 
								key={review.key} 
								isNew={ this.state.dataHasLoaded ? true : false  } 
								score={review.score}
								date={review.date}
								time={review.time}
								boxstate={this.state.isOpen}
								windowstate={this.props.isFocused} /> )
						}
						{ this.showMoreBtn() }
				</Collapsible>
			</div>
		);
	}
}

export default DataBox;
