import React, { Component } from 'react';
import DataBoxContainer from './DataBoxContainer'
import MediaQuery from 'react-responsive'

import Paper from 'material-ui/Paper'
import CounterCard from './CounterCard'

import Clock from './Clock.jsx'
import Doughnut from './charts/Doughnut.jsx'
import Gauge from './charts/Gauge.jsx'
import Line from './charts/Line.jsx'


var Store = require('../helpers/store')

class Home extends Component {
	constructor(props){
		super(props);
        this.state = {
            boxes : [],
            isFocused: true
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

	render () {
		return (
                <Paper style={{marginTop: 75, marginBottom:100, position: 'relative', zIndex : 10}} zDepth={4}>
                <h5 className='paper-title'> Visão Geral </h5>
                <div className='col s12' style={{padding:'10px 45px 45px 45px'}}>
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
                        <div className='row'>
                            <div className='chart-card col s6 m3'>
                                <CounterCard scoreType='excelente'/>
                            </div>
                            <div className='chart-card col s6 m3'>
                                <CounterCard scoreType='bom'/>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='chart-card col s6 m3'>
                                <CounterCard scoreType='ruim'/>
                            </div>

                            <div className='chart-card col s6 m3'>
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
                </Paper>
        )
	}
}

export default Home;
