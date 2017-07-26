import {Gauge} from 'gaugeJS'
import React,{Component} from 'react'
import Paper from 'material-ui/Paper'
import moment from 'moment'
import SelectField from 'material-ui/SelectField';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';

// import Divider from 'material-ui/Divider'
// import FontIcon from 'material-ui/FontIcon'

import Store from '../../helpers/store.js'
let colors = Store.getStore('colors')

export default class GaugeChart extends Component {
	constructor(props){
		super(props)
        this.refresh = this.refresh.bind(this)
        this.calculate = this.calculate.bind(this)
        this.toggleOpen = this.toggleOpen.bind(this)
        this.state = {
            value : 0,
            isEmpty : false,
            height: 200,
            loaded: false,
            open: true
        }

        this.opts = {
            angle: 0.15, /// The span of the gauge arc 
            lineWidth: 0.3, // The line thickness 
            pointer: {
                length: 0.9, // Relative to gauge radius 
                strokeWidth: 0.035 // The thickness 
            },
            percentColors: [[0.0, colors.ruim ], [0.50, colors.bom], [1.0, colors.excelente]],
            // staticZones: [
            // {strokeStyle: "#F03E3E", min: 0, max: 1000}, // Red from 100 to 130
            // {strokeStyle: "#FFDD00", min: 1000, max: 2000}, // Yellow
            // {strokeStyle: "#30B32D", min: 2000, max: 3000}, // Green
            // ],
            highDpiSupport: true,
            generateGradient: true,
            staticLabels: {
                font: "10px sans-serif",  // Specifies font
                labels: [0,25,50,75,100],  // Print labels at these values
                color: "#000000",  // Optional: Label text color
                fractionDigits: 0  // Optional: Numerical precision. 0=round off.
            },
        }
    }

    componentWillMount(){
        Store.subscribe('reviews', this.onReviewReceived = () => {
            // console.log('Data received at the gauge')
            this.data =  Store.getStore('reviews')
            if (!this.state.loaded){
                this.calculate()
            } else {
                setTimeout( () => {this.calculate()},1000)
            }
        })

        Store.subscribe('doughnutHeight', this.onHeightReceived = () => {
            // console.log('NEW HEIGHTT', Store.getStore('doughnutHeight'))
            this.setState({height : Store.getStore('doughnutHeight')})
        })

        if (Store.isReady()){
            this.onReviewReceived()
            this.onHeightReceived()
        }


    }
  
    componentDidMount(){
        var target = this.canvas // your canvas element
        this.gauge = new Gauge(target).setOptions(this.opts); // create sexy gauge!
        this.gauge.maxValue = 100; // set max gauge value 
        this.gauge.setMinValue(0);  // set min value 
        this.gauge.set(this.state.value); // set actual value 
    }

    componentDidUpdate(){
        this.gauge.set(this.state.value)
    }

    componentWillUnmount() {
        Store.unsubscribe('reviews', this.onReviewReceived)
        Store.unsubscribe('doughnutHeight', this.onHeightReceived)
    }
    

    toggleOpen(){
        this.setState({ open : !this.state.open })
    }

    calculate(){
        // console.log('gauge data',this.data)
        let keys = Object.keys(this.data)
        let score = 0
        let reviewCount = 0
        let i
        const length = keys.length

        for (i = 0; i < length; i++){
            this.data[keys[i]].forEach((element) => {
                if ( moment(element.timestamp).isSame(moment(), 'day')   ){
                    reviewCount ++
                    if (element.score === 'excelente'){ score += 1}
                    else if (element.score === 'bom'){score += 0.75}
                    else if (element.score === 'ruim'){score += 0}
                }
            })
        }

        if (reviewCount === 0){
            this.setState( { isEmpty : true, value: '?' } )
        } else {
            this.setState({ value : (score/reviewCount * 100).toFixed(1),isEmpty: false })
        }

        this.setState({loaded:true})
       
    }

    refresh(){
        this.setState({ value : 0})
    }


  render() {
    return (
        <Paper zDepth={1} className='chart-card-inner'         
        style={{
            padding: 0,
            height: this.state.open ? this.state.height : 'auto'
        }}>

        <div className='paper-title small'>
          <MenuItem disabled style={{paddingLeft:50,paddingRight:0}} leftIcon={
            <FontIcon className="material-icons" onClick={this.toggleOpen}>
            { this.state.open ? 'keyboard_arrow_down' : 'keyboard_arrow_right' }
            </FontIcon>} primaryText={
              <span key='gauge-title' style={{color:'black'}}>Desempenho hoje</span>}
          />
        </div>

        {/*{ this.state.open && this.state.loaded
        ? <div>
        </div> 
        : null
        }*/}            
            <div style={{maxHeight : 400, paddingTop: 10, display: this.state.open ? 'block' : 'none'}}>
                 <span style={{paddingLeft:20}}>Pontuação:</span><b> { this.state.value }/100 </b> 
                    <div className='center' style={{padding : 15}}
                    >
                        { this.state.isEmpty 
                        ? <div> Ainda não existe nenhuma avaliação hoje </div> 
                        : null }

                        <canvas style={{
                            width: 100+'%',
                            height: 100}}
                            ref={(canvas) => this.canvas = canvas }
                        /> 

                </div>

            </div>
        </Paper>
    )
  }


}


