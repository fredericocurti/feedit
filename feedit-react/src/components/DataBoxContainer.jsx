import React, { Component } from 'react';
import DataBox from './DataBox'
import firebase from 'firebase'
import Masonry from 'react-masonry-component'


class DataBoxContainer extends React.Component {
	constructor(props){
		super(props);
        this.state = {
            boxes : [],
            isFocused: true
        }
	}

    fetchData(token){
        const url = 'https://febee-2b942.firebaseio.com/users/'+
        firebase.auth().currentUser.uid+'/data/machines.json?shallow=true'
        fetch(url).then(response => {
            response.json().then( (responseJSON) => {
                this.setResponse(responseJSON)
            })
        });

    }

    setResponse(response){
        this.setState( { boxes : response })
        this.renderDataBoxes()
}

    componentDidUpdate(){
    }

	componentWillMount(){
        firebase.auth().currentUser.getIdToken().then(
            (Token) => {
                this.fetchData(Token)
            }
        )
        this.fetchData()
        window.onfocus = () => {
			console.log('focused')
			this.setState( { isFocused : true })
		}
		window.onblur = () => {
			console.log('unfocused')
			this.setState( { isFocused : false })
		}
  	}

    
    renderDataBoxes(){
        var boxArray = []
        if (this.state.boxes != null){
            var boxKeys = Object.keys(this.state.boxes)
            for (var i = 0; i < boxKeys.length; i ++){
                if (boxKeys[i] != 'error'){
                    boxArray.push(<DataBox key={boxKeys[i]} boxname={boxKeys[i]} isFocused={this.state.isFocused}/>)
                }
            }
        } else {
            return <h4> Ainda não existe nenhum feedback para esse usuário, por favor configure
                        os aparelhos corretamente </h4>
        }
        return boxArray
    }


onItemClick(event) {
    event.currentTarget.style.backgroundColor = '#ccc';
    console.log("btn clicked")
}

	render () {
        const masonryOptions = {
            transitionDuration: 175,
            enableResizableChildren: true,
            // gutter: 40,
            // columnWidth:{ width : 20 + '%' }
        }
            const masonryStyle = {
        }

		return (
            <div className='col s12'>
            <Masonry
                enableResizableChildren={true}
                className={'masonry'} // default '' 
                elementType={'div'} // default 'div'
                style={masonryStyle}
                options={masonryOptions} // default {}
                disableImagesLoaded={false} // default false
                updateOnEachImageLoad={false}  // default false and works only if disableImagesLoaded is false

            >
                { this.renderDataBoxes() }
            </Masonry>
            
                    <a onClick={this.onItemClick} className='btn waves-effect waves-light'>REFRESH</a>

            </div>
        )
	}
}

export default DataBoxContainer;
