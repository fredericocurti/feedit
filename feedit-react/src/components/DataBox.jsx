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

class DataBox extends React.Component {
	constructor(props){
		super(props);
		this.resetNewBadge = this.resetNewBadge.bind(this)
		this.resetMemoryBadge = this.resetMemoryBadge.bind(this)
		this.resetCounters = this.resetCounters.bind(this)
		this.handleCollapsibleClick = this.handleCollapsibleClick.bind(this)
		this.requestData = this.requestData.bind(this)
		this.badgeColors = {
			excelente: '#67e200',
			bom: '#ff9800',
			ruim: 'red'
		}


		this.state = {
			dataHasLoaded: false,
			uid : firebase.auth().currentUser.uid,
			newUnseen: 0,
			isOpen : false,
			isFocused: true,
			memoryDifference : 0,
			requested: 50,
			requestInc: 50,
			requestOffset: 0,
			total: 0,
			data: [],
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
		/* Create reference to messages in Firebase Database */
		this.boxRef = firebase.database()
			.ref('users/'+ this.state.uid +'/data/machines/' + this.props.boxname)

		this.boxRef.child('entries')
			.orderByChild('date')
			.limitToLast(50)
			.on('child_added', snapshot => {
		/* Update React state when message is added at Firebase Database */
			let review = { 
				key : snapshot.key,
				score: snapshot.val().score,
				date: moment(snapshot.val().date).format('LTS'),
				time: moment(snapshot.val().date).format('L')
			}

			var datas = this.state.data
			datas.unshift(review)

			var total = this.state.total
			total ++
			this.setState( { 
				total : total,
				data: datas
				} )

			// Handles live added data
			if(this.state.dataHasLoaded){
				console.log("New data added to box " + this.props.boxname)
				this.increaseCounters(review.score)
				this.setState({
					newUnseen : this.state.newUnseen + 1,
					requestOffset : this.state.requestOffset + 1
				})
			}
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
			console.log(' requested initial data loaded @ ' + this.props.boxname + ', total: ' + this.state.total)
			this.setState ( { dataHasLoaded : true } )
			// checks for a counter difference
			this.checkMemory()
		}
	})

		window.addEventListener("beforeunload", (ev) => {  
			ev.preventDefault();
			setMemory(this.state.uid,this.props.boxname,this.state.total)
		})
	}
	
	componentWillUnmount(){
		setMemory(this.state.uid,this.props.boxname,this.state.total)
		this.setState( { dataHasLoaded : false })
	}

	increaseCounters(score){
		this.state.counters[score] ++
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

	// -------------------------------

	requestData(){
		console.log(this.state.isOpen,this.state.isFocused,this.isNew())
		if (this.state.dataHasLoaded){
			let newData = []

			this.setState(
				{ requested: this.state.requested + this.state.requestInc,
				dataHasLoaded: false 
				}, () => {
				this.boxRef.child('entries')
				.orderByChild('date')
				.limitToLast( this.state.requested + this.state.requestOffset )
				.once('value', snapshot => {
					console.log('requested more data')
					snapshot.forEach( (snapshot) => {

						let review = { 
							key : snapshot.key,
							score: snapshot.val().score,
							date: moment(snapshot.val().date).format('LTS'),
							time: moment(snapshot.val().date).format('L'),
						};

						newData.unshift(review)
					})
					
					newData = newData
						.slice(
						this.state.requested - this.state.requestInc + this.state.requestOffset,
						newData.length)
					this.setState({dataHasLoaded : true})
					this.setState({ data: this.state.data.concat(newData) });
					
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


	render () {
		var triggerarray = [
					this.props.boxname.replace(/\b\w/g, l => l.toUpperCase()),
					<span key={this.props.boxname + '-total-counter'} className="badge counter-badge" data-badge-caption={this.state.total}></span>,
					<div className='counters' key={'counters-'+this.props.boxname}>
						{[
						this.showRuimBadge(),
						this.showBomBadge(),
						this.showExcelenteBadge(),
						]}
					</div>,
					this.showNewBadge(),
					this.showMemoryBadge(),

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

		var showMoreBtn = () => {
			if (this.state.total > this.state.requested){
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

		const isLoaded = () => {
			if ( this.state.dataHasLoaded ){
				return 'loaded'
			}
		}

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
					ref = { (Collapsible) => { this.collapsible = Collapsible }}
					handleTriggerClick = { this.handleCollapsibleClick }
					openedClassName='open'
					triggerClassName='waves-effect waves-subtle' 
					triggerOpenedClassName='waves-effect waves-subtle open'
					transitionTime={250} 
					easing='ease'
					trigger = { triggerLoader() }
					>

						{ this.state.data.map( review => 
							<DataRow 
								key={review.key} 
								isNew={this.isNew()} 
								score={review.score}
								date={review.date}
								time={review.time}
								boxstate={this.state.isOpen}
								windowstate={this.props.isFocused} /> )
						}
						{ showMoreBtn() }
				</Collapsible>
			</div>
		);
	}
}

export default DataBox;
