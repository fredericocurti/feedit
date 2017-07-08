import React from 'react';
import {Doughnut} from 'react-chartjs-2';

var Store = require('../../helpers/store')

export default class DoughnutChart extends React.Component {
	constructor(props){
		super(props)
    console.log('dougnut props',this.props)
    
    this.state = {
      labels: [
        'Excelente',
        'Bom',
        'Ruim'
      ],
      datasets: [{
        data: [1,1,1],
        backgroundColor: [
        '#67e200',
        '#ff9800',
        '#ff0000'
        ],
        hoverBackgroundColor: [
        '#67e200',
        '#ff9800',
        '#ff0000'
        ]
      }]
    }

  }

  componentWillMount(){
    Store.subscribe('counters', () => {
      let state = this.state
      let counters = Store.getStore('counters')
      state.datasets[0].data = [
        counters.excelente,
        counters.bom,
        counters.ruim
        ]
        this.setState({state : state})

      })
  }

  componentWillUnmount(){
    Store.unsubscribe('counters')
  }

  render() {
    return (
      <div>
        <Doughnut data={this.state} height={200} />
      </div>
    );
  }
}


