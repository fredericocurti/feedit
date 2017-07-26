import firebase from 'firebase'
import moment from 'moment'
import Notifications from './notifications'
import _ from 'lodash'

const EventEmitter = require('events').EventEmitter
const emitter = new EventEmitter();

var store = {
    isReady : false,
    user : null,
    databoxes : {},
    boxCount : 0,
    loadedBoxCount : 0,
    doughnutHeight:0,
    colors : {
        excelente: '#00ff3e',
        bom: '#ffb43d',
        ruim: '#ff0000',
        total: 'lightskyblue'
    },
    totalCountersSum : { total : 0, excelente:0, bom: 0, ruim: 0 },
    reviews: {},
    newReviews : {},
    machines : []
    }

window.logStore = () => {
    console.log(store)
}

export default {
    start : function(user) {
        store.user = user
        moment.locale('pt-BR')
		let oneWeekAgo = moment().subtract(7,'d').valueOf()
        
        console.log('STORE STARTING')
        // Shallow request to get the machine names
        const url = 'https://febee-2b942.firebaseio.com/users/' +
                    store.user.uid + 
                    '/data/machines.json?shallow=true'

        fetch(url).then(response => {
            response.json().then((responseJSON) => {
                if (responseJSON){
                    console.log('STORE GOT MACHINES', responseJSON)
            
                    store.machines = Object.keys(responseJSON)
                    store.boxCount = store.machines.length
                    emitter.emit('machines_update')
                    
                    // begin machine data process
                    store.machines.forEach((boxName) => {
                        let machineRef = firebase.database()
                            .ref('/users/'+ store.user.uid +'/data/machines/' + boxName)
                        
                        let box = {}
                            box['reviews'] = []
                            box['totalCounters'] = { total : 0, excelente:0, bom: 0, ruim: 0 }
                            box['childAddedIsReady'] = false
                            box['newUnseen'] = 0

                        store.databoxes[boxName] = box

                        // Loads starting data
                        machineRef.child('entries')
                        .orderByChild('date')
                        .startAt(oneWeekAgo)
                        .once('value',snapshot => {
                            snapshot.forEach((child) => {
                                store.databoxes[boxName].reviews.unshift(this.review(boxName,child))
                            })
                            // data for filtering components
                            store.reviews[boxName] = store.databoxes[boxName].reviews
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

                            store.isReady = true

                            emitter.emit(`databoxes_${boxName}_update`)
                            store.loadedBoxCount ++

                            if (store.loadedBoxCount === store.boxCount){
                                emitter.emit('reviews_update')
                            }
                        })

                        // Listens for newly added data
                        machineRef.child('entries')
                        .orderByChild('date')
                        .limitToLast(1)
                        .on('child_added', snapshot => {
                            if (store.databoxes[boxName].childAddedIsReady){
                                store.databoxes[boxName].reviews.unshift(this.review(boxName,snapshot))
                                store.databoxes[boxName].newUnseen ++
                                store.databoxes[boxName].totalCounters[snapshot.val().score] ++
                                store.databoxes[boxName].totalCounters.total ++
                                Notifications.notify(this.review(boxName,snapshot))
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
        if ( arguments.length === 0){
            return store
        } else {
            return store[storeName]
        }
    },

    getBox : function(boxName){
        return store.databoxes[boxName]
    },

    resetUnseen : function(boxName){
        store.databoxes[boxName].newUnseen = 0
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

    review : (name,child) => {
    let reviewMoment = moment(parseInt(child.val().date))
    return {
        key : child.key,
        score: child.val().score,
        date: reviewMoment.format('L'),
        time: reviewMoment.format('LTS'),
        timestamp : parseInt(child.val().date),
        place: name
    }
}

}