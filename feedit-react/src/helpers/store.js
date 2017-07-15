const EventEmitter = require('events').EventEmitter

const emitter = new EventEmitter();

var store = { 
    boxCount : 0,
    loadedBoxCount : 0,
    doughnutHeight:0,
    colors:{
        excelente: '#00ff3e',
        bom: '#ffb43d',
        ruim: '#ff0000'
    },
    counters : {
        excelente: 0,
        bom: 0,
        ruim: 0,
        total : 0
    },
    reviews: {}
     
    };

module.exports = {
    getStore : function(storeName) {
        if ( arguments.length === 0){
            return store
        } else {
            return store[storeName]
        }
    },

    subscribe: function(storeName,callback) {
        emitter.addListener( storeName+'_update', callback)
    },

    unsubscribe: function(storeName,callback) {
        emitter.removeListener( storeName+'_update',callback)
    },

    addCounters: function(boxname,count) {
        // console.log( 'loaded,total',store.loadedBoxCount, store.boxCount )
        if (typeof count == 'string'){
            if (count == 'excelente'){ store.counters.excelente ++}
            else if (count == 'bom'){ store.counters.bom ++}
            else if (count == 'ruim'){ store.counters.ruim ++}
        } else {
            store.counters.excelente += count.excelente
            store.counters.bom += count.bom
            store.counters.ruim += count.ruim
        }
        if (store.loadedBoxCount === store.boxCount){
            emitter.emit('counters_update')
        }
    },

    setLoaded : function(){
        store.loadedBoxCount ++
         if (store.loadedBoxCount === store.boxCount){
            console.log('all boxes have loaded,emitting update')
            emitter.emit('reviews_update')
        }
    },

    setAmount : function(count){
        store.boxCount = count
    },

    setHeight : function(height){
        if (store.doughnutHeight != height){
            store.doughnutHeight = height
            emitter.emit('doughnutHeight_update')
        }

    },

    add: function(boxname,data){
        // console.log('store received new data')
        if ( !store.reviews[boxname] ){
            store.reviews[boxname] = data
        } else { 
            store.reviews[boxname] = data
        }

        if (store.loadedBoxCount === store.boxCount){
            emitter.emit('reviews_update')
        }
       

    }

}