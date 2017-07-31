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
import _ from 'lodash'
import Store from '../helpers/store.js'
import VirtualList from 'react-virtual-list';

let colors = Store.getStore('colors')

class DataBox extends React.Component {

// COMPONENT FUNCTIONS --------------------------------------------------------

	constructor(props){
		super(props);
		this.resetNewBadge = this.resetNewBadge.bind(this)
		this.resetMemoryBadge = this.resetMemoryBadge.bind(this)
		this.handleCollapsibleClick = this.handleCollapsibleClick.bind(this)
		this.requestOlderData = this.requestOlderData.bind(this)
		this.setRowAsSeen = this.setRowAsSeen.bind(this)
		this.deleteRow = this.deleteRow.bind(this)
		this.badgeColors = {
			excelente: colors.excelente,
			bom: colors.bom,
			ruim: colors.ruim
		}

		this.initialLoaded = false
		this.virtualListLoaded = false
							
		this.state = {
			dataHasLoaded: false,
			uid : this.props.userUid,
			newUnseen: 0,
			isOpen : false,
			isFocused: true,
			collapsibleReady: false,
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
			this.setState({ data : _.values(store.reviews).reverse() , counters : store.totalCounters},() => {
				this.setState({dataHasLoaded : true, requested : store.reviews.length, newUnseen : store.newUnseen})
			})
			this.initialLoaded = true
		}

		Store.subscribe(`databoxes_${this.props.boxname}`, this.onDataboxReceived = () => {
			let store = Store.getBox(this.props.boxname)
			this.setState({ counters: store.totalCounters, data : _.values(store.reviews).reverse()},() => {
				this.setState({
					dataHasLoaded : true, 
					requested : store.reviews.length,
					newUnseen : store.newUnseen
				})
			})

			if (!this.initialLoaded){
				setTimeout ( this.checkMemory(), 3000)
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

	componentDidMount() {
		this.setState({collapsibleReady:true})
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
		this.setState ({ displayingData: dD })

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

						let review = Store.formatReview(this.props.boxname,snapshot,false)
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

	deleteRow(key){
		Store.removeReview(this.props.boxname,key)
	}

	setRowAsSeen(key){
		Store.setRowAsSeen(key,this.props.boxname)
		let seenReview = _.find(this.state.data,{ key : key })
		let index = this.state.data.indexOf(seenReview)
		let newData = this.state.data
		newData[index].isNew = false
		this.setState({ data : newData })
	}


	checkMemory(){
		const currentLength = this.state.counters.total
		var memoryPromise = getMemory(this.props.boxname)
		memoryPromise.then(snapshot => {
			let memoryLength = snapshot.val()
			if (memoryLength != currentLength && memoryLength < currentLength){
				// console.log('there is a dif @ ' + this.props.boxname)
				const difference = currentLength - memoryLength
				this.setState({ memoryDifference : difference }, () => {
					let newData = this.state.data
					for (let i = 0; i < difference; i ++){
						console.log(newData[i])
						newData[i].isNew = true
					}
					this.setState({ data : newData })
				})

			

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


    getColor(score){
		return colors[score]
	}

	getVirtualList(){
		let slice = this.state.displayingData
		if (this.state.collapsibleReady && this.state.dataHasLoaded && !this.virtualListLoaded){
			// console.log('collapsible ready, creating list')
		const MyList = ({
			virtual,
			itemHeight,
		}) => (
			<div style={virtual.style}> {
			 	virtual.items.map( (review) => {
					this.isEven = !this.isEven
					return <DataRow
						deleteRow={this.deleteRow}
						setRowAsSeen={this.setRowAsSeen}
						key={review.key}
						color={this.getColor(review.score)}
						isNew={review.isNew} 
						review={review}
						boxstate={this.state.isOpen}
						windowstate={this.props.isFocused}
					/> 
				 }

				)}
				{ this.showMoreBtn() }
			</div>
			);

			const options = {
			container: this.collapsible.refs.inner,
			 // use this scrollable element as a container
			initialState: {
				firstItemIndex: 0, // show first ten items
				lastItemIndex: 12,  // during initial render
				}
			}

			let MyVirtualList = VirtualList(options)(MyList)
			this.VirtualList = MyVirtualList
			this.virtualListLoaded = true
			return <MyVirtualList
						items={this.state.data.slice(slice[0],slice[1])}
						itemHeight={30}
						itemBuffer={15}
					/>
		} else if (this.virtualListLoaded === true){
			
			return <this.VirtualList
						items={this.state.data.slice(slice[0],slice[1])}
						itemHeight={30}
						itemBuffer={15}
					/>
		} else {
			return null
		}
	}
	

// RENDER FUNCTION --------------------------------------------------------

	render () {

		let as = this.state.displayingData
				
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
					lazyRender={false}
					>
					{ this.getVirtualList() }


				</Collapsible>
			</div>
				/* /* <Collapsible 
					ref = { (Collapsible) => { this.collapsible = Collapsible } }
					handleTriggerClick = { this.handleCollapsibleClick }
					openedClassName='open'
					triggerOpenedClassName='open'
					transitionTime={250} 
					easing='ease'
					trigger={ triggerLoader() }
					>

			// 			{ this.state.data.length > 0 
			// 			? 
			// 			this.state.data.slice(as[0],as[1]).map( review => 
			// 				<DataRow
			// 					deleteRow={this.deleteRow}
			// 					key={review.key}
			// 					color={this.getColor(review.score)}
			// 					isNew={ this.state.dataHasLoaded ? true : false  } 
			// 					review={review}
			// 					boxstate={this.state.isOpen}
			// 					windowstate={this.props.isFocused} /> )
			// 			: <h5 style={{padding:10}}> Ainda não existem avaliações nessa caixa </h5>}
			// 			{ this.showMoreBtn() }
			// 	</Collapsible>
			// </div> */
		)
	}
}

export default DataBox;
