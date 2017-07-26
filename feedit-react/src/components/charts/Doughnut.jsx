import React from 'react';
import {Doughnut,Chart} from 'react-chartjs-2';
import CircularProgress from 'material-ui/CircularProgress';

import SelectField from 'material-ui/SelectField';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';

import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import moment from 'moment'

import Store from '../../helpers/store.js'
import _ from 'lodash'

let resizilla = require('resizilla')

let colors = Store.getStore('colors')

var originalDoughnutDraw = Chart.controllers.doughnut.prototype.draw;
Chart.helpers.extend(Chart.controllers.doughnut.prototype, {
  draw: function() {
    originalDoughnutDraw.apply(this, arguments);
    
    var chart = this.chart.chart;
    var ctx = chart.ctx;
    var width = chart.width;
    var height = chart.height;

    var fontSize = (height / 114).toFixed(2);
    ctx.font = fontSize + "em Roboto";
    ctx.textBaseline = "middle";
    
    var text = chart.config.data.text,
        textX = Math.round((width - ctx.measureText(text).width) / 2),
        textY = height / 2 + 15;
    
    ctx.fillStyle = "#808080";
    ctx.fillText(text, textX, textY);
  }
});


export default class DoughnutChart extends React.Component {
	constructor(props){
		super(props)
    // console.log('dougnut props',this.props)
    this.toggleOpen = this.toggleOpen.bind(this)
    this.onDivResize = this.onDivResize.bind(this)
    this.state = {
      loaded : false,
      value: 1,
      open: true,
      data: {
          labels: [
            'Excelente',
            'Bom',
            'Ruim'
          ],
          datasets: [{
            data: [0,0,0],
            backgroundColor: [
            colors.excelente,
            colors.bom,
            colors.ruim
            ],
            hoverBackgroundColor: [
            '#00ff91',
            '#ff9800',
            '#ff0000'
            ]
          }],
          text : ''
      }
    }

  }

  componentWillMount(){
    Store.subscribe('reviews', this.onReviewReceived = () => {
      let data = this.state.data
      let counters = Store.getStore('totalCountersSum')
      this.reviews = Store.getStore('reviews')

      if (this.state.value === 2 || this.state.value === 3){
        this.recalculate(this.state.value)
      }

      if (this.state.value === 1){
        data.datasets[0].data = [
            counters.excelente,
            counters.bom,
            counters.ruim 
        ]
        data.text = _.sum(this.state.data.datasets[0].data)

        this.setState({data : data, loaded : true}, () => {
          Store.setHeight(this.div.clientHeight)
        })
      }
    })

    if ( Store.isReady ){
      this.onReviewReceived()
    }
  
    this.resizeHandler = resizilla(this.onDivResize, 350)

  }

  componentDidMount(){
  }

  componentWillUnmount(){
    Store.unsubscribe('reviews', this.onReviewReceived)
    this.resizeHandler.destroy()
  }

  componentDidUpdate(){
    // console.log('doughnut updated')
  }

  onDivResize(){
    if (this.state.open) { 
      Store.setHeight(this.div.clientHeight)
    }
  }

  handleChange = (event, index, value) => {
    this.setState({value})
    this.recalculate(value)
  }

  toggleOpen(){
    this.setState({open : !this.state.open}, () => {
      if (this.state.open){
        Store.setHeight(this.div.clientHeight)
      }
    })
  }

  recalculate(value){
    // console.log(value)
    let data = this.state.data
    let newCounters = { excelente: 0, bom:0, ruim :0 }
      
    if (value === 1){
      let counters = Store.getStore('totalCountersSum')
      data.datasets[0].data = [counters['excelente'],counters['bom'],counters['ruim']]
        

    } else if (value === 2){

      let keys = Object.keys(this.reviews)
      let l = keys.length
      let i
      for (i = 0; i < l; i++) {
          this.reviews[keys[i]].forEach((element) => {
              let time = moment(element.timestamp)
              // if ( time.isSame(moment(), 'day') ){
              //     newCounters[element.score] ++
              // }
              let sevenDaysAgo = moment().subtract(7,'days').startOf('day')
              if ( time.isAfter(sevenDaysAgo) ){
                  // console.log('is within last 7 days')
                  newCounters[element.score] ++
              }
          })
      }
  
      data.datasets[0].data = [newCounters.excelente,newCounters.bom,newCounters.ruim]

    } else if (value === 3) {
      let keys = Object.keys(this.reviews)
      let l = keys.length
      let now = moment()
      let i
      for (i = 0; i < l ; i++){
          this.reviews[keys[i]].forEach((element) => {
              let time = moment(element.timestamp)
              if ( time.isSame(now, 'day') ){
                  newCounters[element.score] ++
              }
          })
      }
      data.datasets[0].data = [newCounters.excelente,newCounters.bom,newCounters.ruim] 
    }

    data.text = _.sum(this.state.data.datasets[0].data)
    this.setState({data : data})

  }

  render() {
    const style = {
          paddingLeft : 15,
          marginTop: 20,
          paddingRight: 15,
          paddingBottom: 15
        }

    return (
      <Paper zDepth={1} className='chart-card-inner' 
        style={{
            paddingLeft : 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingTop: 0
        }}>
  
      <div ref={ (div) => this.div = div}>

        <div className='paper-title small'>
          <MenuItem disabled style={{paddingLeft:50,paddingRight:0}} leftIcon={
            <FontIcon className="material-icons" onClick={this.toggleOpen}>
            { this.state.open ? 'keyboard_arrow_down' : 'keyboard_arrow_right' }
            </FontIcon>} primaryText={
              [<span key='doughnut-title' style={{color:'black'}}>Distribuição</span>,
              this.state.open && this.state.loaded ? <SelectField
                key='dougnhut-field'
                className='right' 
                value={this.state.value} 
                onChange={this.handleChange}
                style={{width: 150, fontSize: 15}}>
                  <MenuItem value={1} primaryText="Sempre" />
                  <MenuItem value={2} primaryText="Última semana"/>
                  <MenuItem value={3} primaryText="Hoje" />
            </SelectField> : null
            ]}
          />
        </div>
        { this.state.open && this.state.loaded
        ? <div style={{padding: 15}}>
          <Doughnut data={this.state.data} height={150} />
        </div> 
        : null
        }
      </div>

      </Paper>
    );
  }
}


