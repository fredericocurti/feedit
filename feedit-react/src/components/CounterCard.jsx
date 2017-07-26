import React, { Component } from 'react';
import Paper from 'material-ui/Paper'
import CircularProgress from 'material-ui/CircularProgress';
import Divider from 'material-ui/Divider'


import moment from 'moment'

import Store from '../helpers/store.js'
let colors = Store.getStore('colors')

export default class CounterCard extends React.Component {
    constructor(props) {
        super(props)
        this.switchOpen = this.switchOpen.bind(this)
        this.handleClick = this.handleClick.bind(this)
        this.state = {
          day : '',
          week: '',
          lasthour : '',
          lastplace: '',
          always : '',
          ready: false,
          open: false,
          cursorPos: {}
        }
  }
  
    componentWillMount(){
    
      Store.subscribe('reviews', this.onReviewReceived = () => {
        // console.log('Data received @ store', Store.getStore('reviews'))
        this.data = Store.getStore('reviews')
        this.calculate()

        if (this.props.scoreType == 'total'){
          let counter = Store.getStore('totalCountersSum').total
          this.setState( { always : counter } )
        } else {
          let counter = Store.getStore('totalCountersSum')[this.props.scoreType]
          this.setState( { always : counter } )
        }

      })

      if (Store.isReady()){
        this.onReviewReceived()
      }


      // Store.subscribe('reviews_update', this.onCountersReceived = () => {

      // })

      // if (Store.getStore('totalCounterSum' != { total : 0, excelente:0, bom: 0, ruim: 0 })) {
      //   this.onCountersReceived()
      // } 

    }    
    
    componentDidMount() {
      
    }

    componentWillUnmount() {
        Store.unsubscribe('reviews',this.onReviewReceived)
    }
    
    calculate(){
      
        const isTotal = () => {
          if (this.props.scoreType == 'total'){ return true }
        }

        // console.log('counter data',this.data)
        let keys = Object.keys(this.data)
        // console.log(keys)
        let todayReviews = 0
        let weekReviews = 0
        let newest = { timestamp : 0 }

        for (let i = 0; i < keys.length; i++){
            this.data[keys[i]].forEach((element) => {
              if (element.score == this.props.scoreType || isTotal() ){
                  let time = moment(element.timestamp)
                  if ( element.timestamp > newest.timestamp){
                    newest = element
                  }
                  if ( time.isSame(moment(), 'day') ){
                      todayReviews ++
                      weekReviews ++
                  } else if ( time.isAfter(moment().subtract(7,'days').startOf('day'))){
                      // console.log('is within last 7 days')
                      weekReviews ++
                  }
              }

            })
        }

        //         lasthour: this.data.date

        this.setState({ 
          day : todayReviews,
          week : weekReviews,
          ready: true,
          lasthour : moment(newest.timestamp).fromNow(),
          lastplace : newest.place
        })
       
    }

    switchOpen(){
      this.setState( { open : !this.state.open })
    }

    handleClick(e){
      // Get Cursor Position 
      let cursorPos = {
        top: e.clientY,
        left: e.clientX,
        // Prevent Component duplicates do ripple effect at the same time 
        time: Date.now()
      }
      this.setState({ cursorPos: cursorPos })
    }

    render() {
      const color = () => {
        if (this.props.scoreType !== 'total'){
          return colors[this.props.scoreType]
        } else {
          return '#00d6ff'
        }
      }

      const getClass = () => {
        if (!this.state.open){
          return 'card card-content ' + this.props.scoreType + '-card'
        } else {
          return 'card card-content ' + this.props.scoreType + '-card open'

        }

      }

      const style = { 
        backgroundColor: color(),
        color: 'white',
        fontSize : 1+'rem',
        padding: '15px',
      }

      const output = () => {
        if (this.state.ready){
            return (
              <div style={style} 
                className={getClass()}
                onClick={this.switchOpen}
              >
                    <div style={{overflow:'auto'}}>
                      <div className='left' style={{paddingTop:5}}>
                        <span  style={{fontSize:1+'em',textTransform:'capitalize'}}>
                          <span className={this.state.open ? 'ccbutton open' : 'ccbutton'}> ► </span> {"\u00A0"} {this.props.scoreType} 
                        </span>
                      </div>
                      <div className='right'>
                        <span  style={{fontSize:1.7+'em'}}>
                            <b> { this.state.always } </b>
                        </span>
                      </div>
                    </div>
                    { this.state.open
                    ? <span>
                        • Ultima avaliação: <br/><b>{ this.state.lasthour } </b>
                        no local <b> {this.state.lastplace.replace(/\b\w/g, l => l.toUpperCase())} </b> <br/>
                        • Hoje: <b> { this.state.day } </b> <br/>
                        • Últimos 7 dias: <b> { this.state.week } </b> <br/>
                      </span>
                     : null }
              </div>
              )
        } else {
          return (
            <Paper zDepth={2} style={style} className={getClass()}>
              <CircularProgress size={30} color='white' 
                style={{ margin: '0 auto',display: 'block'}}
              />
            </Paper>
          )
        }

      }

      return output()
    }
}
