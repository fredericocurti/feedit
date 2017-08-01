import firebase from 'firebase'
import moment from 'moment'
import Notifications from './notifications'
import _ from 'lodash'

const EventEmitter = require('events').EventEmitter
const emitter = new EventEmitter();
emitter.setMaxListeners(20)

var store = {
    isReady : false,
    user : null,
    databoxes : {},
    boxCount : 0,
    loadedBoxCount : 0,
    doughnutHeight:0,
    colors : {
        excelente: '#2afc00',
        bom: '#ffb74d',
        ruim: '#ff0000',
        total: 'lightskyblue'
    },
    totalCountersSum : { total : 0, excelente:0, bom: 0, ruim: 0 },
    reviews: {},
    newReviews : {},
    machines : []
    }

window.emitter = emitter

var isEven = false

export default window.store = {
    start : function(user) {
        store.user = user
        moment.locale('pt-BR')
		let oneWeekAgo = moment().subtract(7,'d').valueOf()
        
        console.log('Store started')
        // Shallow request to get the machine names
        const url = 'https://febee-2b942.firebaseio.com/users/' +
                    store.user.uid + 
                    '/data/machines.json?shallow=true'

        fetch(url).then(response => {
            response.json().then((responseJSON) => {
                if (responseJSON){
                    console.log('Store fetched user boxes', responseJSON)
            
                    store.machines = Object.keys(responseJSON)
                    store.boxCount = store.machines.length
                    emitter.emit('machines_update')
                    
                    // begin machine data process
                    store.machines.forEach((boxName) => {
                        let machineRef = firebase.database()
                            .ref('/users/'+ store.user.uid +'/data/machines/' + boxName)
                        
                        let box = {}
                            box['reviews'] = {}
                            box['totalCounters'] = { total : 0, excelente:0, bom: 0, ruim: 0 }
                            box['childAddedIsReady'] = false
                            box['reviewDeletionInProgress'] = false
                            box['newUnseen'] = 0

                        store.databoxes[boxName] = box

                        // Loads starting data
                        machineRef.child('entries')
                        .orderByChild('date')
                        .startAt(oneWeekAgo)
                        .once('value',snapshot => {
                            snapshot.forEach((child) => {
                                store.databoxes[boxName].reviews[child.key] = (this.formatReview(boxName,child,false))
                            })
                            // data for filtering components
                            store.reviews[boxName] = _.values(store.databoxes[boxName].reviews)
                        })

                        // Loads total counters and emits updates
                        machineRef.child('counters')
                        .once('value', snapshot => {
                            snapshot.forEach((item) => {
                                store.databoxes[boxName].totalCounters[item.key] = item.val()
                                store.databoxes[boxName].totalCounters.total += item.val()
                                store.totalCountersSum[item.key] += item.val()
                                store.totalCountersSum.total += item.val()
                            })

                            emitter.emit(`databoxes_${boxName}_update`)
                            store.loadedBoxCount ++

                            if (store.loadedBoxCount === store.boxCount){
                                store.isReady = true
                                emitter.emit('reviews_update')
                                Notifications.setup((status) => {
                                    console.log('NOTIFICATION STATUS : ' + status)
                                    // if (status != 'granted'){
                                    //     this.setState({dialogOpen:true})
                                    // } else {
                                    //     this.setState({dialogOpen:false})
                                    // }
                                })
                            }
                        })

                        // Listens for newly added data
                        machineRef.child('entries')
                        .orderByChild('date')
                        .limitToLast(1)
                        .on('child_added', snapshot => {
                            // console.log(store.databoxes[boxName].reviewDeletionInProgress)
                            if (store.databoxes[boxName].childAddedIsReady &&
                                !store.databoxes[boxName].reviewDeletionInProgress) {
                                    store.databoxes[boxName].reviews[snapshot.key] = (this.formatReview(boxName,snapshot,true))
                                    store.databoxes[boxName].newUnseen ++
                                    store.databoxes[boxName].totalCounters[snapshot.val().score] ++
                                    store.databoxes[boxName].totalCounters.total ++
                                    Notifications.handleReview(this.formatReview(boxName,snapshot,true))
                                    emitter.emit(`databoxes_${boxName}_update`)
                                    emitter.emit('reviews_update')
                            } else {
                                store.databoxes[boxName].childAddedIsReady = true
                            }
                        })
                    })
                }
            })
        })

    },

    getStore : function(storeName) {
        if ( arguments.length === 0 ){
            return store
        } else {
            return store[storeName]
        }
    },

    getBox : function(boxName){
        return store.databoxes[boxName]
    },
    
    removeReview : function(boxName,key){
        console.log('attempting to remove review ID ' + key + ' @ box ' + boxName)
        store.databoxes[boxName].reviewDeletionInProgress = true
        let ref = firebase.database().ref('/users/' + store.user.uid + '/data/machines/' + boxName)
            let entry = store.databoxes[boxName].reviews[key]
            let score = entry.score
            let confirmDialog = window.confirm('Tem certeza que deseja remover a avaliação ' + _.capitalize(entry.score) + ' no local ' + 
            _.capitalize(entry.place) + ' ?')

            if (confirmDialog){
                delete store.databoxes[boxName].reviews[key]
                store.databoxes[boxName].totalCounters[score] --
                store.databoxes[boxName].totalCounters.total --
                store.totalCountersSum[score] --
                store.totalCountersSum.total --
                ref.child('entries').child(key).remove().then(() => {
                    ref.child('counters').child(score).transaction( (currentCount) => {
                        return currentCount - 1
                    }).then( () => {
                        console.log(`removed key ${key} from store and database, emitting updates`)
                        emitter.emit('reviews_update')
                        emitter.emit(`databoxes_${boxName}_update`)
                        store.databoxes[boxName].reviewDeletionInProgress = false

                    })
                })
            }

    },

    resetUnseen : function(boxName){
        store.databoxes[boxName].newUnseen = 0
    },

    setRowAsSeen : function(key,boxName){
        store.databoxes[boxName].reviews[key].isNew = false
    },

    isReady : function(){
      return store.isReady
    },

    subscribe: function(storeName,callback) {
        emitter.addListener( storeName + '_update', callback)
    },

    unsubscribe: function(storeName,callback) {
        emitter.removeListener( storeName + '_update',callback)
    },

    resetBox: function(boxName){
        store.loadedBoxCount --
        this.resetUnseen(boxName)
    },

    setHeight : function(height){
        if (store.doughnutHeight != height){
            store.doughnutHeight = height
            emitter.emit('doughnutHeight_update')
        }

    },

    formatReview : (name,child,isnew) => {
    let reviewMoment = moment(parseInt(child.val().date))
    return {
 
            key : child.key,
            score: child.val().score,
            date: reviewMoment.format('L'),
            time: reviewMoment.format('LTS'),
            timestamp : parseInt(child.val().date),
            place: name,
            isNew : isnew,
    
    }
    }

}