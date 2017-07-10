import {Gauge} from 'gaugeJS'
import React,{Component} from 'react'
import Divider from 'material-ui/Divider'
import moment from 'moment'
import FontIcon from 'material-ui/FontIcon'

var Store = require('../../helpers/store')

export default class GaugeChart extends Component {
	constructor(props){
		super(props)
        this.refresh = this.refresh.bind(this)
        this.state = {
            value : 0,
            isEmpty : false,
        }
        
        this.opts = {
            angle: 0.15, /// The span of the gauge arc 
            lineWidth: 0.44, // The line thickness 
            pointer: {
                length: 0.9, // Relative to gauge radius 
                strokeWidth: 0.035 // The thickness 
            },
            percentColors: [[0.0, "#ff0000" ], [0.50, "#3dcdff"], [1.0, "#00ff3e"]],
            // staticZones: [
            // {strokeStyle: "#F03E3E", min: 0, max: 1000}, // Red from 100 to 130
            // {strokeStyle: "#FFDD00", min: 1000, max: 2000}, // Yellow
            // {strokeStyle: "#30B32D", min: 2000, max: 3000}, // Green
            // ],

            generateGradient: true,
            // strokeColor: ''   // to see which ones work best for you
            staticLabels: {
                font: "10px sans-serif",  // Specifies font
                labels: [0,25,50,75,100],  // Print labels at these values
                color: "#000000",  // Optional: Label text color
                fractionDigits: 0  // Optional: Numerical precision. 0=round off.
            },
        }
    }

    componentWillMount(){
        Store.subscribe('reviews', () => {
            // console.log('Data received at the gauge')
            this.data =  Store.getStore('reviews')
            this.calculate()
        })

        Store.subscribe('reviews', () => {
            this.reviews = Store.getStore('reviews')
            console.log(this.reviews)
        })

    }
  
    componentDidMount(){
        var target = this.canvas // your canvas element
        this.gauge = new Gauge(target).setOptions(this.opts); // create sexy gauge!
        this.gauge.maxValue = 100; // set max gauge value 
        this.gauge.setMinValue(0);  // set min value 
        this.gauge.set(0); // set actual value 
    }

    componentDidUpdate(){
        this.gauge.set(this.state.value)
    }

    calculate(){
        // console.log('gauge data',this.data)
        let keys = Object.keys(this.data)
        // console.log(keys)
        let score = 0
        let reviewCount = 0

        for (let i = 0; i < keys.length; i++){
            this.data[keys[i]].forEach((element) => {
                if ( moment(element.timestamp).isSame(moment(), 'day') ){
                    reviewCount ++
                    if (element.score == 'excelente'){ score += 1}
                    else if (element.score == 'bom'){score += 0.75}
                    else if (element.score == 'ruim'){score += 0}
                }

            })
        }

        // console.log(score,reviewCount)
        // console.log( score/reviewCount * 100)

        if (reviewCount == 0){
            this.setState( { isEmpty : true, value: '?' } )
        } else {
            this.setState({ value : (score/reviewCount * 100).toFixed(1),isEmpty: false })
        }
       
    }

    refresh(){
        this.setState({ value : 0})
    }


  render() {
    const isEmpty = () => {
        if (this.state.isEmpty){
            return (<div> Ainda não existe nenhuma avaliação hoje </div>)
        }
    }

    return (
        <div>
            <div className='grey-text'> Desempenho médio hoje <br/>
            <b> Pontuação: { this.state.value }/100 </b> </div>
                
                <div className='center' style={{padding : 15, marginTop: 20}}>
                <canvas style={{width: 100+'%', height: 150}}className='gauge' ref={(canvas) => this.canvas = canvas }/>
                { isEmpty() }
            </div>

        </div>
    )
  }


}


