import React, { Component } from 'react';
import DataBoxContainer from './DataBoxContainer'
import MediaQuery from 'react-responsive'

import Paper from 'material-ui/Paper'
import CounterCard from './CounterCard'
import FontIcon from 'material-ui/FontIcon'

import Clock from './Clock.jsx'
import Doughnut from './charts/Doughnut.jsx'
import Gauge from './charts/Gauge.jsx'
import Line from './charts/Line.jsx'


var Store = require('../helpers/store')

class Home extends Component {
	constructor(props){
        super(props);
        this.toggleOpen = this.toggleOpen.bind(this)
        this.state = {
            boxes : [],
            isFocused: true,
            open : true
        }
	}


    componentDidUpdate(){
    }


	componentWillMount(){
    }

    onItemClick(event) {
        event.currentTarget.style.backgroundColor = '#ccc';
        console.log(Store.getStore())
        console.log("btn clicked")
    }

    toggleOpen(){
        this.setState({open : !this.state.open})
    }

	render () {
		return (
                <div className='card z-depth-5 main-card' style={{marginTop: 75, marginBottom:100, position: 'relative'}}>
                <h5 className='paper-title valign-wrapper'> 
                    <FontIcon className="material-icons" style={{marginRight: 10}}> home </FontIcon>
                    Visão Geral </h5>

                {this.state.open 
                ? 
                <div className='col s12 main-card-inner'>
                    {/*<Clock />*/}
                    <MediaQuery minDeviceWidth={1224}>
                        <div className='row'>
                            <div className='chart-card col s6 m3'>
                                <CounterCard scoreType='excelente'/>
                            </div>
                            <div className='chart-card col s6 m3'>
                                <CounterCard scoreType='bom'/>
                            </div>

                            <div className='chart-card col s6 m3'>
                                <CounterCard scoreType='ruim'/>
                            </div>

                            <div className='chart-card col s6 m3'>
                                <CounterCard scoreType='total'/>
                            </div>
                        </div>
                    </MediaQuery>
            
                    <MediaQuery maxDeviceWidth={1224}>
                    {/*<div>tablet or mobile phone</div>*/}
                        <div className='row' style={{marginBottom : 5}}>
                            <div className='chart-card col s6 m3' style={{marginTop:5}}>
                                <CounterCard scoreType='excelente'/>
                            </div>
                            <div className='chart-card col s6 m3' style={{marginTop:5}}>
                                <CounterCard scoreType='bom'/>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='chart-card col s6 m3' style={{marginTop:5}}>
                                <CounterCard scoreType='ruim'/>
                            </div>

                            <div className='chart-card col s6 m3' style={{marginTop:5}}>
                                <CounterCard scoreType='total'/>
                            </div>
                        </div>
                    </MediaQuery>

                    <div className='row'>
                        <div className='chart-card col s12 m4'>
                            <Doughnut/>
                        </div>

                        <div className='chart-card col s12 m4'>
                            <Gauge/>
                        </div>
                    </div>

                    <div className='row'>

                        <div className='chart-card col s12 m12'>
                            <Line/>
                        </div>

                    </div>
                
                <DataBoxContainer/>

    {/*            
                        <a onClick={this.onItemClick} className='btn waves-effect waves-light'>Log store</a>*/}

                </div>
                : null }
                {/* <a className='btn red' onClick={this.toggleOpen}>CLOSE</a> */}
                </div>
        )
	}
}

export default Home;
