import React, { Component } from 'react';
import DataBox from './DataBox'
import firebase from 'firebase'
import Masonry from 'react-masonry-component'


class DataBoxContainer extends React.Component {
	constructor(props){
		super(props);
        this.state = {
            boxes : []
        }
	}

    fetchData(){
        const url = 'https://febee-2b942.firebaseio.com/'+firebase.auth().currentUser.uid+'/data/feedbacks.json?shallow=true'
        fetch(url).then(response => {
            response.json().then(response2 => 
            this.setResponse(response2))
        });
    }

    setResponse(response){
    this.setState( {boxes : response })
}

    componentDidUpdate(){
        console.log("DataBoxContainer updated")
        this.renderDataBoxes()
    }

	componentWillMount(){
        this.fetchData()
  	}

    

    renderDataBoxes(){
        var boxarray = []
        if (this.state.boxes != null){
            for (var i = 0; i < Object.keys(this.state.boxes).length; i ++){
                boxarray.push(<DataBox key={Object.keys(this.state.boxes)[i]} boxname={Object.keys(this.state.boxes)[i]}/>)
            }
        } else {
            return <h4> Ainda não existe nenhum feedback para esse usuário, por favor configure
                        os aparelhos corretamente </h4>
        }

        return boxarray
    }


onItemClick(event) {
    event.currentTarget.style.backgroundColor = '#ccc';
    console.log("btn clicked")
}



	render () {
        const masonryOptions = {
            transitionDuration: 200,
            enableResizableChildren: true
        }
            const masonryStyle = {
        }

		return (
            <div className='col s12'>
            <Masonry
                enableResizableChildren={true}
                className={'masonry'} // default ''
                elementType={'ul'} // default 'div'
                style={masonryStyle}
                options={masonryOptions} // default {}
                disableImagesLoaded={false} // default false
                updateOnEachImageLoad={false} // default false and works only if disableImagesLoaded is false

            >
                { this.renderDataBoxes() }
            </Masonry>
            
                    <a onClick={this.onItemClick} className='btn waves-effect waves-light'>REFRESH</a>

            </div>
        )
	}
}

export default DataBoxContainer;
