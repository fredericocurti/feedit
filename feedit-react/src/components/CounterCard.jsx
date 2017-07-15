import React, { Component } from 'react';
import Paper from 'material-ui/Paper'
import CircularProgress from 'material-ui/CircularProgress';
import Divider from 'material-ui/Divider'


import moment from 'moment'

const Store = require('../helpers/store.js')
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
      Store.subscribe('reviews', () => {
        // console.log('Data received @ store', Store.getStore('reviews'))
        this.data = Store.getStore('reviews')
        this.calculate()
      })

      Store.subscribe('counters', () => {
    
        if (this.props.scoreType == 'total'){
          let counter = Store.getStore('counters')
          console.log(counter)
          let sum = counter.excelente + counter.bom + counter.ruim
          this.setState( { always : sum } )
        } else {
          let counter = Store.getStore('counters')[this.props.scoreType]
          this.setState( { always : counter } )
        }
      })

    }    
    
    componentDidMount() {
      
    }

    componentWillUnmount() {
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

      const getClass = () =>{
          return 'card card-content ' + this.props.scoreType + '-card'
      }

      const style = { 
        backgroundColor: color(),
        color: 'white',
        fontSize : 1+'rem',
        padding: '15px',
      }

      const output = () => {
        if (this.state.ready){
          switch (this.state.open){
            case false:
            return (
              <div style={style} 
                className={getClass()}
                onClick={this.switchOpen}
              >
                    <div style={{overflow:'auto'}}>
                      <div className='left' style={{paddingTop:5}}>
                        <span  style={{fontSize:1+'em',textTransform:'capitalize'}}>
                          <span className='ccbutton'> ► </span> {"\u00A0"} {this.props.scoreType} 
                        </span>
                      </div>
                      <div className='right'>
                        <span  style={{fontSize:1.7+'em'}}>
                            <b> { this.state.always } </b>
                        </span>
                      </div>
                    </div>
              </div>
              )
            
            case true:
            return(
              <div style={style} className={getClass() + ' open'} onClick={this.switchOpen}>
                    <div style={{overflow:'auto'}}>
                      <div className='left' style={{paddingTop:5}}>
                        <span  style={{fontSize:1+'em',textTransform:'capitalize'}}>
                          <span className='ccbutton open'> ► </span> {"\u00A0"} {this.props.scoreType} 
                        </span>
                      </div>
                      <div className='right'>
                        <span  style={{fontSize:1.7+'em'}}>
                            <b> { this.state.always } </b>
                        </span>
                      </div>
                    </div>
                      Ultima avaliação: <br/><b>{ this.state.lasthour } </b>
                      no local <b> {this.state.lastplace.replace(/\b\w/g, l => l.toUpperCase())} </b> <br/>
                      Hoje: <b> { this.state.day } </b> <br/>
                      Últimos 7 dias: <b> { this.state.week } </b> <br/>
              </div>
            )
          }
          

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
