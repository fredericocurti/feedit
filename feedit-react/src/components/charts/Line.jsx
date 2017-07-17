import React,{Component} from 'react';
import {Line} from 'react-chartjs-2';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import CircularProgress from 'material-ui/CircularProgress'
import moment from 'moment'


var Store = require('../../helpers/store')
let colors = Store.getStore('colors')
var _ = require('lodash')

export default class LineChart extends Component {
	constructor(props){
		super(props)
        this.filter = this.filter.bind(this);
        this.data = {
                    labels: [],
                    datasets: [{
                        label: "",
                        data: [
                            0
                        ],
                        fill: false,
                    }]
                }

        this.state = {
            box : 'todas',
            value : 12,
            hoursAgo : 12,
            data : this.data
        }

        this.config = {
                type: 'line',
                options: {
                    responsive: true,
                    title:{
                        display:false,
                        text:'Chart.js Line Chart'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Hora'
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Avaliações'
                            }
                        }]
                    }
                }
        }

  }

  componentWillMount(){
    Store.subscribe('reviews', () => {
        this.reviews = Store.getStore('reviews')
        this.boxes = Object.keys(this.reviews)
        setTimeout(() => { this.filter() }, 4000)
    })
  }

  componentDidMount(){
  }

  componentWillUnmount(){
  }
  
  componentDidUpdate(){
  }

// 

    handleTimeChange = (event, index, value) => {
        this.setState({ hoursAgo : value, value : value },() => {this.filter()})
    }

    handleBoxChange = (event, index, value) => {
        this.setState({ box : value },() => {this.filter()})
    }


  getBoxFilter(reviewPlace){
    if (this.state.box === 'todas'){
        return true
    } else if (reviewPlace === this.state.box) {
        return true
    }
  }

  filter(){
    let hoursAgo = this.state.hoursAgo
    let hoursArray = []
    let currentTime = moment()
    let i = 0
    let scores = ['excelente','bom','ruim','total']

    if (!this.state.loaded){
        this.setState({ loaded : true })
    }

    let newData = {}
    newData['datasets'] = []
    newData['labels'] = []

    for (i; i < hoursAgo; i++) {
        let newTime = currentTime.clone().subtract(i,'h')
        // { 
        //     timestamp : newTime.valueOf(),
        //     hour : newTime.hours()
        // }
        hoursArray.push(newTime)
    }

    let result = {}

    _.forEach(hoursArray,(hour) => {
        newData.labels.unshift(hour.hours()+':00')
        result[hour.format('DD-HH')] = { excelente: 0, bom: 0, ruim: 0, total: 0 }
    })

    Object.keys(this.reviews).forEach((key) => {
        let box = this.reviews[key]
        _.forEach(hoursArray,(hour) => {
            _.forEach(box,(review) => {
                let reviewMoment = moment(review.timestamp)
                if ( reviewMoment.isSame(hour,'hour') && this.getBoxFilter(review.place)) {
                    result[reviewMoment.format('DD-HH')][review.score] ++
                    result[reviewMoment.format('DD-HH')].total ++
                }
            })
        })
    })

    let resultArr = _.values(result).reverse()
    scores.forEach( (score) => {
        var scoreArray = []
        resultArr.forEach( (counters) =>{
            scoreArray.push(counters[score])
        })
        let scoreDataset = {
            label : _.capitalize(score),
            backgroundColor: colors[score],
            borderColor: colors[score],
            data : scoreArray,
            fill : false
        }
        newData.datasets.push(scoreDataset)
    })
    this.setState({ data : newData })

  }

  render() {
    const style = {
          paddingLeft : 15,
          marginTop: 20,
          paddingRight: 15,
          paddingBottom: 15
        }

    return (
        <Paper zDepth={2} className='chart-card-inner' style={{padding: '0 15px 15px 15px'}}>
            <ul className='grey-text left'> Frequência </ul>
            { this.state.loaded
            ?   <div>
                    <SelectField
                        className='right'
                        value={this.state.box}
                        onChange={this.handleBoxChange}
                        style={{width: 150}}
                    >
                        <MenuItem value={'todas'} primaryText='Todas' style={{color: 'lightblue'}}/>
                        <Divider/>
                    { this.boxes.map( (boxname) => 
                        <MenuItem 
                            key={boxname} 
                            value={boxname} 
                            primaryText={_.capitalize(boxname)}
                        /> 
                    )}


                    </SelectField>
                    <SelectField 
                        className='right'
                        value={this.state.value}
                        onChange={this.handleTimeChange}
                        style={{width: 180}}
                    >
                        <MenuItem value={6} primaryText='6 horas atrás'/>
                        <MenuItem value={12} primaryText='12 horas atrás'/>
                        <MenuItem value={24} primaryText='24 horas atrás'/>
                        <MenuItem value={48} primaryText='48 horas atrás'/>
                    </SelectField>
                </div>
            : null
            }
            

        <div ref={ (div) => this.div = div}>
            { this.state.loaded
            ? <Line data={this.state.data} options={this.config.options} height={100} />
            : <CircularProgress size={30} color='red' 
                style={{ margin: '0 auto',display: 'block', paddingTop:110}}
                />
            } 
        </div>

      </Paper>
    );
  }
}


