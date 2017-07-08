import {Gauge} from 'gaugeJS'
import React,{Component} from 'react'
import Divider from 'material-ui/Divider'

var Store = require('../../helpers/store')

export default class GaugeChart extends Component {
	constructor(props){
		super(props)
        this.state = {
            value : 0
        }
        
        this.opts = {
            angle: 0.15, /// The span of the gauge arc 
            lineWidth: 0.44, // The line thickness 
            pointer: {
                length: 0.9, // Relative to gauge radius 
                strokeWidth: 0.035 // The thickness 
            },
            colorStart: 'red',   // Colors 
            colorStop: 'red',    // just experiment with them 
            strokeColor: '#E0E0E0'   // to see which ones work best for you 
        }
    }

    componentWillMount(){
        Store.subscribe('reviews', () => {
            console.log(Store.getStore('reviews'))
        })
  }
  
    componentDidMount(){
        var target = this.canvas // your canvas element
        this.gauge = new Gauge(target).setOptions(this.opts); // create sexy gauge!
        this.gauge.maxValue = 3000; // set max gauge value 
        this.gauge.setMinValue(0);  // set min value 
        this.gauge.set(0); // set actual value 
  }

    componentDidUpdate(){
        this.gauge.set(this.state.value)
    }



  render() {
    

    return (
        <div className='center'>
            <h5 className='grey-text' > Desempenho </h5>
            <Divider/>
            <canvas ref={(canvas) => this.canvas = canvas }/> 
        </div>
    )
  }


}


