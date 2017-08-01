import React,{Component} from 'react';
import {Line} from 'react-chartjs-2';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider'
import Paper from 'material-ui/Paper'
import CircularProgress from 'material-ui/CircularProgress'
import FontIcon from 'material-ui/FontIcon';

import moment from 'moment'
import MediaQuery from 'react-responsive'

import Store from '../../helpers/store.js'
import _ from 'lodash'

let colors = Store.getStore('colors')


export default class LineChart extends Component {
	constructor(props){
		super(props)
        this.filter = this.filter.bind(this)
        this.toggleOpen = this.toggleOpen.bind(this)
        this.state = {
            box : 'todas',
            open: true,
            value : 6,
            hoursAgo : 6,
            data : {},
            loaded: false,
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
    Store.subscribe('reviews', this.onReviewReceived = () => {
        this.reviews = Store.getStore('reviews')
        this.boxes = Object.keys(this.reviews)
        if (!this.state.loaded){
            this.filter()
        } else {
            this.update = setTimeout(() => { this.filter() }, 2000)
        }
    })

    if (Store.isReady){
        this.onReviewReceived()
    }

  }

  componentDidMount(){
  }

  componentWillUnmount(){
    Store.unsubscribe('reviews', this.onReviewReceived)
    clearTimeout(this.update)
  }
  
  componentDidUpdate(){
  }

// 
    toggleOpen(){
        this.setState({ open : !this.state.open })
    }


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
        this.setState({ loaded : true, showing: false })
    }

    let newData = {}
    newData['datasets'] = []
    newData['labels'] = []

    for (i; i < hoursAgo; i++) {
        let newTime = currentTime.clone().subtract(i,'h')
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
          paddingLeft : 0,
          marginTop: 20,
          paddingRight: 0,
          paddingBottom: 0
        }

    // let mobileconfig = this.config
    // mobileconfig.options['animation'] = {
    //     duration: 0, // general animation time
    // }
    // mobileconfig.options['hover'] = {
    //     mode: 'nearest',
    //     intersect: true,
    //     animationDuration: 0, // duration of animations when hovering an item
    // }
    // mobileconfig.options['responsiveAnimationDuration'] = 0 // animation duration after a resize}

    return (
        <Paper zDepth={1} className='chart-card-inner'>
            <div className='paper-title small'>
                <MenuItem 
                    disabled 
                    style={{paddingLeft:50,paddingRight:0}} 
                    leftIcon={
                        <FontIcon className="material-icons chart-card-btn" onClick={this.toggleOpen}>
                        { this.state.open ? 'keyboard_arrow_down' : 'keyboard_arrow_right' }
                        </FontIcon>
                        } 
                    primaryText={
                        [<span key='doughnut-title' style={{color:'black'}}>Frequência</span>,
                        this.state.loaded && this.state.open
                        ?   <span key='doughnut-fields'>
                                <SelectField
                                    className='right'
                                    value={this.state.box}
                                    onChange={this.handleBoxChange}
                                    style={{width: 150,fontSize: 15}}
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
                                    style={{width: 180,fontSize: 15}}
                                >
                                    <MenuItem value={6} primaryText='6 horas atrás'/>
                                    <MenuItem value={12} primaryText='12 horas atrás'/>
                                    <MenuItem value={24} primaryText='24 horas atrás'/>
                                    <MenuItem value={48} primaryText='48 horas atrás'/>
                                </SelectField>
                            </span>
                        : null
                        ]}
                />
            </div>

            


        <div ref={ (div) => this.div = div} >

        <MediaQuery minDeviceWidth={1224}>
            { this.state.open && this.state.loaded
            ? <div style={{padding:15}}>
                <Line data={this.state.data}  options={this.config.options} height={80} />
            </div>
            : null }
        </MediaQuery>

        <MediaQuery maxDeviceWidth={1224}>
          {/*<div>You are a tablet or mobile phone</div>*/}
            { this.state.open && this.state.loaded
            ? <div style={{padding:15}}>
                <Line data={this.state.data}  options={this.config.options} height={200} />
            </div>            : null }
        </MediaQuery>


        </div>
        {/*{ this.state.showing ?
            <div className='row center'>
                <a className='btn red darken-2' 
                onClick={this.filter}>Mostrar gráfico</a>
            </div>
            : null
        }*/}

      </Paper>
    );
  }
}


