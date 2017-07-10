import React, { Component } from 'react';
import Paper from 'material-ui/Paper'
import CircularProgress from 'material-ui/CircularProgress';
import Divider from 'material-ui/Divider'

import moment from 'moment'

const Store = require('../helpers/store.js')

export default class CounterCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
          day : '',
          week: '',
          lasthour : '',
          always : '',
          ready: false,
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
          lasthour : moment(newest.timestamp).fromNow()
        })
       
    }

    render() {
      const color = () => {
        if (this.props.scoreType == 'excelente'){
          return '#00ff3e'
        } else if ( this.props.scoreType == 'bom' ){
          return '#3dcdff'
        } else if ( this.props.scoreType == 'ruim' ){
          return 'red'
        } else {
          return '#ff0088'
        }
      }

      const getClass = () =>{
        if (this.props.scoreType == 'excelente'){
          return 'card-content excelente-card'
        } else if ( this.props.scoreType == 'bom' ){
          return 'card-content bom-card'
        } else if ( this.props.scoreType == 'ruim' ){
          return 'card-content ruim-card'
        } else {
          return 'card-content total-card'
        }
      }

      const style = { 
        backgroundColor: color(),
        color: 'white',
        minHeight : 100,
        fontSize : 1+'rem'
      }

      const output = () => {
        if (this.state.ready){

          return (
          <Paper zDepth={2} style={style} className={getClass()}>

            <div className='center' style={{paddingTop: 5}}> 
              <b> {this.props.scoreType.replace(/\b\w/g, l => l.toUpperCase())} </b>
            </div>

            <div style={{padding: 15}} >
              Ultima avaliação: <b> <br/> { this.state.lasthour } </b> <br/>
              Hoje: <b> { this.state.day } </b> <br/>
              Últimos 7 dias: <b> { this.state.week } </b> <br/>
              Total : <b> { this.state.always } </b><br/>

            </div>
          </Paper>
          )

        } else {
          return (
            <Paper zDepth={2} style={style} className={getClass()}>
              <CircularProgress color='white' 
                style={{paddingTop: 30, margin: '0 auto',display: 'block'}}
              />
            </Paper>
          )
        }

      }

      return output()
    }
}
