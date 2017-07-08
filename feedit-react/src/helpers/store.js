const EventEmitter = require('events').EventEmitter

const emitter = new EventEmitter();

var store = { 
    counters : {
        excelente: 0,
        bom: 0,
        ruim: 0
    },
    reviews: {}
     
    };

module.exports = {

    getStore : function(storeName) {
        return store[storeName]
    },

    subscribe: function(storeName,callback) {
        emitter.addListener( storeName+'_update',callback)
    },

    unsubscribe: function(storeName,callback) {
        emitter.removeListener( storeName+'_update',callback)
    },

    addCounters: function(count) {
        if (typeof count == 'string'){
            if (count == 'excelente'){ store.counters.excelente ++}
            else if (count == 'bom'){ store.counters.bom ++}
            else if (count == 'ruim'){ store.counters.ruim ++}
        } else {
            store.counters.excelente += count.excelente
            store.counters.bom += count.bom
            store.counters.ruim += count.ruim
        }
        emitter.emit('counters_update')
    },

    add: function(boxname,review){
        if ( !store.reviews[boxname] ){
            store.reviews[boxname] = []
            store.reviews[boxname].push(review)
        } else { 
            store.reviews[boxname].push(review) 
        }
        emitter.emit('reviews_update')
    }

}