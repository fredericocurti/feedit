import React from 'react';
import {Doughnut,Chart} from 'react-chartjs-2';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider'

import moment from 'moment'


var Store = require('../../helpers/store')

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
    console.log('dougnut props',this.props)
    
    this.state = {
      value: 1,
      data: {
          labels: [
            'Excelente',
            'Bom',
            'Ruim'
          ],
          datasets: [{
            data: [0,0,0],
            backgroundColor: [
            '#00ff3e',
            '#3dcdff',
            '#ff0000'
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
    Store.subscribe('counters', () => {
      let data = this.state.data
      let counters = Store.getStore('counters')
      if (this.state.value === 1){
        data.datasets[0].data = [
            counters.excelente,
            counters.bom,
            counters.ruim 
        ]
        data.text = 
            this.state.data.datasets[0].data[0] +
            this.state.data.datasets[0].data[1] + 
            this.state.data.datasets[0].data[2]
            
        this.setState({data : data})
      }
    })
  
    Store.subscribe('reviews', () => {
      this.reviews = Store.getStore('reviews')
      if (this.state.value === 2 || this.state.value === 3){
        this.recalculate(this.state.value)
      }
    })


    
  }

  componentWillUnmount(){
    // Store.unsubscribe('counters')
  }

  componentDidUpdate(){
  }

  handleChange = (event, index, value) => {
    this.setState({value})
    this.recalculate(value)
  }

  recalculate(value){
    console.log('recalculating')
    console.log(value)
    let data = this.state.data
    let newCounters = { excelente: 0, bom:0, ruim :0}
      
    if (value == 1){
      let counters = Store.getStore('counters')
      data.datasets[0].data = [counters.excelente,counters.bom,counters.ruim]
        

    } else if (value == 2){

      let keys = Object.keys(this.reviews)
      for (let i = 0; i < keys.length; i++){
          this.reviews[keys[i]].forEach((element) => {
              let time = moment(element.timestamp)
              // if ( time.isSame(moment(), 'day') ){
              //     newCounters[element.score] ++
              // }
              if ( time.isAfter(moment().subtract(7,'days').startOf('day'))){
                  // console.log('is within last 7 days')
                  newCounters[element.score] ++
              }
          })
      }
      data.datasets[0].data = [newCounters.excelente,newCounters.bom,newCounters.ruim]

    } else if (value == 3){
      let keys = Object.keys(this.reviews)
      for (let i = 0; i < keys.length; i++){
          this.reviews[keys[i]].forEach((element) => {
              let time = moment(element.timestamp)
              if ( time.isSame(moment(), 'day') ){
                  newCounters[element.score] ++
              }
          })
      }
      data.datasets[0].data = [newCounters.excelente,newCounters.bom,newCounters.ruim] 
    }

    console.log('recalculated data')
    data.text = 
        this.state.data.datasets[0].data[0] +
        this.state.data.datasets[0].data[1] + 
        this.state.data.datasets[0].data[2]

      this.setState({data : data})

  }

  render() {
    return (
      <div>
        <ul className='grey-text left'> Distribuição total das notas </ul>
          <DropDownMenu className='right' value={this.state.value} onChange={this.handleChange}>
            <MenuItem value={1} primaryText="Sempre" />
            <MenuItem value={2} primaryText="Últimos 7 dias"/>
            <MenuItem value={3} primaryText="Hoje" />
          </DropDownMenu>   
        
        <Doughnut data={this.state.data} height={150} />
      </div>
    );
  }
}


