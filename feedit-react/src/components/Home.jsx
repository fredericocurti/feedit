import React, { Component } from 'react';
import DataBoxContainer from './DataBoxContainer'


import Paper from 'material-ui/Paper'
import CounterCard from './CounterCard'


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
        // firebase.auth().currentUser.getIdToken().then(
        //     (Token) => {
        //         this.fetchData(Token)
        //     }
        // // )

        // this.fetchData()
        
        // window.onfocus = () => {
		// 	this.setState( { isFocused : true })
		// }
		// window.onblur = () => {
		// 	this.setState( { isFocused : false })
		// }

  	}


//  ---------------------------------- // 

    /*fetchData(token){
        const url = 'https://febee-2b942.firebaseio.com/users/'+
        firebase.auth().currentUser.uid+'/data/machines.json?shallow=true'
        fetch(url).then(response => {
            response.json().then( (responseJSON) => {
                this.setResponse(responseJSON)
            })
        });
    }

    setResponse(response){
        Store.setAmount(Object.keys(response).length)
        this.setState( { boxes : response })
        this.renderDataBoxes()
    }
    
    renderDataBoxes(){
        var boxArray = []
        if (this.state.boxes != null){
            var boxKeys = Object.keys(this.state.boxes)
            for (var i = 0; i < boxKeys.length; i ++){
                if (boxKeys[i] != 'error'){
                    boxArray.push(
                        <DataBox 
                            key={boxKeys[i]} 
                            boxname={boxKeys[i]} 
                            isFocused={this.state.isFocused}
                            sendCounter={this.getChildCount}
                        />
                    )
                }
            }
        } else {
            return <h4> Ainda não existe nenhum feedback para esse usuário, por favor configure
                        os aparelhos corretamente </h4>
        }
        return boxArray
    }*/


    onItemClick(event) {
        event.currentTarget.style.backgroundColor = '#ccc';
        console.log(Store.getStore())
        console.log("btn clicked")
    }

	render () {
		return (
            <div className='col s12'>
                <div className='row'>
                    <div className='chart-card col s12 m3'>
                        <CounterCard scoreType='excelente'/>
                    </div>

                    <div className='chart-card col s12 m3'>
                        <CounterCard scoreType='bom'/>
                    </div>

                    <div className='chart-card col s12 m3'>
                        <CounterCard scoreType='ruim'/>
                    </div>

                    <div className='chart-card col s12 m3'>
                        <CounterCard scoreType='total'/>
                    </div>
                </div>

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

            {/*<Masonry
                enableResizableChildren={true}
                className={'masonry'} // default '' 
                elementType={'div'} // default 'div'
                style={masonryStyle}
                options={masonryOptions} // default {}
                disableImagesLoaded={false} // default false
                updateOnEachImageLoad={false}  // default false and works only if disableImagesLoaded is false
            >
                { this.renderDataBoxes() }
            </Masonry>*/}

            
                    <a onClick={this.onItemClick} className='btn waves-effect waves-light'>Log store</a>

            </div>
        )
	}
}

export default Home;
