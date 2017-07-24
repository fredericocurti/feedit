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


let Store = require('../helpers/store.js')
let colors = Store.getStore('colors')
let Notifications = require('../helpers/notifications.js')

class DataBox extends React.Component {

// COMPONENT FUNCTIONS --------------------------------------------------------

	constructor(props){
		super(props);
		this.resetNewBadge = this.resetNewBadge.bind(this)
		this.resetMemoryBadge = this.resetMemoryBadge.bind(this)
		this.resetCounters = this.resetCounters.bind(this)
		this.handleCollapsibleClick = this.handleCollapsibleClick.bind(this)
		this.requestData = this.requestData.bind(this)
		this.badgeColors = {
			excelente: colors.excelente,
			bom: colors.bom,
			ruim: colors.ruim
		}

		this.listenerIsReady = false

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
			total: 0,
			data: [],
			displayingData: [0,50],
			counters: {
				initial : 50,
				excelente: 0,
				bom: 0,
				ruim : 0
			},
		};
	}

	componentWillUpdate(){
	}
	
	componentWillMount(){
		moment.locale('pt-BR')
		let currentTime = moment().valueOf()
		let oneWeekAgo = moment().subtract(7,'d').valueOf()
		let total = this.state.total

		this.childCount = 0
		
		/* Create reference to messages in Firebase Database */
		this.boxRef = firebase.database()
			.ref('/users/'+ this.props.userUid +'/data/machines/' + this.props.boxname) 

		let startingData = this.state.data
		this.boxRef.child('entries')
			.orderByChild('date')
			.startAt( oneWeekAgo )
			.once('value', snapshot => {
				// console.log('new data received', snapshot.val())
		/* Update React state when message is added at Firebase Database */
				snapshot.forEach((child) => {
					let review = { 
						key : child.key,
						score: child.val().score,
						date: moment(parseInt(child.val().date,10)).format('L'),
						time: moment(parseInt(child.val().date,10)).format('LTS'),
						timestamp : parseInt(child.val().date),
						place: this.props.boxname
					}
					startingData.unshift(review)
					this.childCount ++
				}) 
			})
			.then(() => {
				this.setState({ 
					data: startingData,
					requested : this.childCount
				})
		})

		// counts db total and handles data after initial loading is complete
		this.boxRef.child('counters')
			.once('value', snapshot => {
				var total = 0
				let counters = this.state.counters
				snapshot.forEach( (item) => {
					total += item.val()
					counters[item.key] = item.val()
					this.setState({counters:counters})
				})
				this.setState( { total : total })
			
				if (this.state.total == this.state.data.length || this.state.requested == this.state.data.length){
					console.log(' requested initial data loaded @ ' + this.props.boxname + ',weekold amount:' + this.childCount + ' total: ' + this.state.total)
					
					Store.setLoaded()
					Store.add(this.props.boxname,this.state.data)
					Store.addCounters(this.props.boxname,this.state.counters)

					this.setState ( { dataHasLoaded : true } )
					// checks for a counter difference
					this.checkMemory()
				}
		})

		this.boxRef.child('entries')
			.orderByChild('date')
			.limitToLast(1)
			.on('child_added', snapshot => {
				if (this.listenerIsReady){
					let newData = this.state.data
					let review = { 
						key : snapshot.key,
						score: snapshot.val().score,
						date: moment(parseInt(snapshot.val().date,10)).format('L'),
						time: moment(parseInt(snapshot.val().date,10)).format('LTS'),
						timestamp : parseInt(snapshot.val().date),
						place: this.props.boxname
					}
					
					newData.unshift(review)
					this.increaseCounters(review.score)
					this.setState({ 
						data: newData,
						newUnseen : this.state.newUnseen + 1,
						requestOffset : this.state.requestOffset + 1,
						total : this.state.total + 1
					}, () => {
						Store.add(this.props.boxname,newData)
						Store.addCounters(this.props.boxname,review.score)
						Notifications.notify(review)
					})
				} else {
					this.listenerIsReady = true
					console.log('child_added listener ready')
				}

			})

		window.addEventListener("beforeunload", (ev) => {  
			ev.preventDefault();
			setMemory(this.props.userUid,this.props.boxname,this.state.total)
		})
	}
	
	componentWillUnmount(){
		setMemory(this.props.userUid,this.props.boxname,this.state.total)
	}


	// AUX FUNCTIONS --------------------------------------------------------------------


	
	increaseCounters(score){
		let newCounters = this.state.counters
		newCounters[score] ++
		this.setState({
			counters : newCounters
		})		
	}
	
	resetCounters(){
		var counters = this.state.counters
		counters.excelente = 0
		counters.bom = 0
		counters.ruim = 0
	}

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

	requestData(){
		let dD = this.state.displayingData
		dD[1] += 50
		this.setState({ displayingData : dD })

		if (this.state.dataHasLoaded && dD[1] > this.state.requested){
			let newData = []

			this.setState(
				{ requested: this.state.requested + this.state.requestInc,
				dataHasLoaded: false 
				}, () => {
				this.boxRef.child('entries')
				.orderByChild('date')
				.limitToLast( this.state.requested + this.state.requestOffset )
				.once('value', snapshot => {
					console.log('requested more data @ box',this.props.boxname)
					snapshot.forEach( (snapshot) => {

						let review = { 
							key : snapshot.key,
							score: snapshot.val().score,
							date: moment(parseInt(snapshot.val().date,10)).format('L'),
							time: moment(parseInt(snapshot.val().date,10)).format('LTS'),
							timestamp : parseInt(snapshot.val().date),
							place : this.props.boxname
						};

						newData.unshift(review)

					})
					
					newData = newData
						.slice(
						this.state.requested - this.state.requestInc + this.state.requestOffset,
						newData.length)
					
					let concatData = this.state.data.concat(newData)

					this.setState({
						dataHasLoaded : true,
						data: concatData
					})
					
					
				})
			})  

		}
	}

	checkMemory(){
		const currentLength = this.state.total
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

	isNew(){
		if (this.state.dataHasLoaded){
			return true
		} else {
			return false
		}
	}

	showMoreBtn(){
		if (this.state.total > this.state.requested || this.state.data.length > this.state.displayingData[1]){
			return (
				<div>
					<a className='btn btn-flat' 
					style={{ margin: 'auto',display:'block'}}
					onClick={this.requestData}
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
					<span key={this.props.boxname + '-total-counter'} className="badge counter-badge" data-badge-caption={this.state.total}></span>,
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
								isNew={this.isNew()} 
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
