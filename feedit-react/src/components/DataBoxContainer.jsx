import React, { Component } from 'react';
import firebase from 'firebase'
import Masonry from 'react-masonry-component'
import DataBox from './DataBox.jsx'
import MediaQuery from 'react-responsive'

var Store = require('../helpers/store')

class DataBoxContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            isFocused: true,
            dataFetched: false 
        }
  }
  
    componentWillMount() {
        this.userUid = firebase.auth().currentUser.uid
        this.fetchData()
        window.onfocus = () => {
			this.setState( { isFocused : true })
		}
		window.onblur = () => {
			this.setState( { isFocused : false })
		}
    }

    fetchData(token){
        const url = 'https://febee-2b942.firebaseio.com/users/' +
        this.userUid + '/data/machines.json?shallow=true'
        fetch(url).then(response => {
            response.json().then( (responseJSON) => {
                this.setResponse(responseJSON)
            })
        });
    }

    setResponse(response){
        if (response){
           Store.setAmount(Object.keys(response).length)         
        }
        this.setState( { boxes : response,  dataFetched: true}, () => { this.renderDataBoxes() })
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
                            userUid={this.userUid}
                        />
                    )
                }
            }
        } else if (this.state.dataFetched) {
            return <h4> Ainda não existe nenhum feedback para esse usuário, por favor configure
                        os aparelhos corretamente </h4>
        }
        this.setState({boxArray : boxArray})
    }



  render() {
    const masonryOptions = {
        transitionDuration: 150,
        enableResizableChildren: true,
        // gutter: 40,
        // columnWidth:{ width : 20 + '%' }
    }

        const masonryStyle = {
    }

    return (
      <div className='col s12' style={{marginBottom: 100,marginTop:40}}>
        <MediaQuery minDeviceWidth={1224}>
        
            <Masonry
                enableResizableChildren={true}
                className={'masonry'} // default '' 
                elementType={'div'} // default 'div'
                style={masonryStyle}
                options={masonryOptions} // default {}
                disableImagesLoaded={false} // default false
                updateOnEachImageLoad={false}  // default false and works only if disableImagesLoaded is false
            >
                { this.state.boxArray }
            </Masonry>
        </MediaQuery>
        
        <MediaQuery maxDeviceWidth={1224}>
            { this.state.boxArray }
        </MediaQuery>



      </div>
    );
  }
}



export default DataBoxContainer;