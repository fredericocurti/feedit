
import _ from 'lodash'
import excelente_thumb  from '../img/excelente.png'
import bom_thumb from '../img/bom.png'
import ruim_thumb from '../img/ruim.png'
import grid_icon from '../img/grid.png'
import bell_crossed_inv from '../img/bell_crossed_inv.png'
import notification_sound from '../assets/pop.mp3'
import firebase from 'firebase'
import moment from 'moment'
import logo from '../img/logo.png'

import Store from './store.js'


let isReady = false
const notificationSound = new Audio(notification_sound)

var settings = {
    enabled : true,
    modes : ['always','custom','auto'],
    mode : 'always',
    customSettings : {
        grades : {
            excelente : true,
            bom : true,
            ruim : true
        },
        machines : {},
        amount : 0,
        period : 6
    },
    counter : 0
}

export default window.notifications = {
    getSettings : function() {
        return settings
    },

    getScoresAsArray : function() {
        let arr = []
         for (let [k, v] of Object.entries(settings.customSettings.grades)) {
            if (v && !arr.includes(v)) {
                arr.push(k)
            }
        }
        return arr
    },

    getBoxnamesAsArray : function() {
        let arr = []
         for (let [k, v] of Object.entries(settings.customSettings.machines)) {
            if (v) {
                arr.push(k)
            }
        }
        return arr
    },

    isReady : function() {
        return isReady
    },

    resetCache : function() {
        this.cache = []
    },

    setSettings : function(property,value) {
        settings[property] = value
        if (property == 'mode' && value == 'always'){
            this.resetCache()
        }
    },

    saveSettings : function() {
        this.notificationSettingsRef.update(settings)
    },

    getCache : function() {
        return this.cache
    },


    handleReview : function(review) {
        switch (settings.mode) {
            case 'always':
                let notification = {
                    // actions: [{action: 'open',title: "Abrir o Aplicativo",icon:grid_icon},{action: 'mute',title: "Silenciar",icon:bell_crossed_inv}],
                    icon: this.getThumb(review.score),
                    body: 'Um cliente avaliou o local '+_.capitalize(review.place) +' como '+ _.capitalize(review.score),
                    tag: 'feedit-notification',
                    vibrate: [300,100,100]
                }
                this.notify(notification)
                break

            case 'custom':
                if (settings.customSettings.grades[review.score] && settings.customSettings.machines[review.place]){
                    this.cache.push(review)

                    this.notificationSettingsRef.child('counter').set(this.cache.length)
                        .then(() => {
                        if (this.cache.length >= settings.customSettings.amount) {
                            if (settings.customSettings.amount == 0){
                                let notification = {
                                    // actions: [{action: 'open',title: "Abrir o Aplicativo",icon:grid_icon},{action: 'mute',title: "Silenciar",icon:bell_crossed_inv}],
                                    icon: this.getThumb(review.score),
                                    body: 'Um cliente avaliou o local '+_.capitalize(review.place) +' como '+ _.capitalize(review.score),
                                    tag: 'feedit-notification',
                                    vibrate: [300,100,100]
                                }
                                this.notify(notification)
                                this.cache = []
                            } else {
                                let notification = {
                                // actions: [{action: 'open',title: "Abrir o Aplicativo",icon:grid_icon},{action: 'mute',title: "Silenciar",icon:bell_crossed_inv}],
                                icon: logo,
                                body: this.generateReviewBody(),
                                tag: 'feedit-notification',
                                vibrate: [300,100,100]
                                }
                                this.notify(notification)
                                this.cache = []
                            }                            
                        }
                    })
                }


                

                // this.notificationSettingsRef.child('cache').once('value', snapshot => {
                //     settings.cache.push(review)        
                // }).then(() => {
                //     this.notificationSettingsRef.child('cache').set(settings.cache)
                // })
                
                

        }
    },

    notify : function(notification) {
            if (isReady && settings.enabled === true){
                notificationSound.play()
                var options = { tag : 'feedit-notification' };
                
                this.registration.getNotifications(options).then((notifications) => {
                    if (notifications.length != 0) {
                    notifications[0].close();
                    }
                
                    this.registration.showNotification('Feedit',notification).then(() => {
                        setTimeout(() => {
                            this.registration.getNotifications(options).then((notifications) => {
                                try {
                                    notifications[0].close()
                                } catch(e) {
                                }
                            })
                        }, settings.mode == 'custom' ? 15000 : 7000)
                    })
                })
        }
    },

    setup : function(callback) {
        if (navigator.serviceWorker){
            navigator.serviceWorker.ready.then((registration)=>{
                this.registration = registration
                this.registration.addEventListener('notificationclick', function(event) {
                    var messageId = event.notification.data;
                    console.log(event)
                    event.notification.close();
                    if (event.action === 'open') {  
                        console.log('OPEN CLICKED')
                    }  
                    else if (event.action === 'mute') {  
                        console.log('MUTE CLICKED')
                    }  
                    else {
                    }
                }, false);
            })
            if (!Notification) {
                alert('Notificações não estão disponíveis nesse navegador. Experimente um navegador mais moderno como o Google Chrome');
            } else if (Notification.permission !== "granted"){
                callback(Notification.permission)
                Notification.requestPermission().then((response)=>{
                    callback(response)
                    if (response == 'granted'){
                        this.getSettingsFromFirebase( () => {
                            isReady = true
                        })
                    }
                })
            } else {
                this.getSettingsFromFirebase( () => {
                    isReady = true
                    callback('granted')
                })
            }
        } else {
            isReady = false
        }
    },

    getThumb : function(score) {
        switch(score){
            case 'excelente':
                return excelente_thumb
            case 'bom':
                return bom_thumb
            case 'ruim':
                return ruim_thumb
        }
    },

    getSettingsFromFirebase : function(callback){

        this.notificationSettingsRef = firebase.database()
                .ref(`/users/${firebase.auth().currentUser.uid}/settings/notifications`)

        this.notificationSettingsRef.once('value', snapshot => {
            if (!snapshot.exists()){
                console.log('Set default settings for notifications')
                settings['machines'] = {}
                Store.getStore('machines').forEach( (item) => {
                    settings.customSettings.machines[item] = true
                })
                this.notificationSettingsRef.set(settings)
                callback()
            } else {
                if ( Object.keys(snapshot.val().customSettings.machines).length != Store.getStore('machines').length) {
                    settings = snapshot.val()
                    console.log(Object.keys(snapshot.val().customSettings.machines))
                    console.log(Store.getStore('machines'))
                    settings['machines'] = {}
                    Store.getStore('machines').forEach( (item) => {
                        settings.customSettings.machines[item] = true
                    })
                    this.notificationSettingsRef.set(settings)
                    console.log('Obtained settings from firebase, but resetted boxes')
                    callback()
                } else {
                    settings = snapshot.val()
                    console.log('Obtained notification settings from firebase')
                    callback()
                }     
                
                let filtered = _.filter(_.flatMap(Store.getStore('reviews')), (review) => 
                    settings.customSettings.machines[review.place] && 
                    settings.customSettings.grades[review.score]
                )
                this.cache = filtered.slice(filtered.length - settings.customSettings.amount,filtered.length)
                settings.counter = this.cache.length
            }
        })
    },

    generateReviewBody : function(){
        let notificationBody = { boxes : {} }
        _.forEach(this.cache,(review) => {
            if (!notificationBody.boxes[review.place]){
                notificationBody.boxes[review.place] = (_.capitalize(review.place))
            }
            if (!notificationBody[review.score]){
                notificationBody[review.score] = 1
            } else {
                notificationBody[review.score] ++
            }
        })

        let notificationString = ''
        let places = _.values(notificationBody.boxes)

        for (let [k, v] of Object.entries(notificationBody)) {
            if (k != 'boxes'){
                notificationString += _.capitalize(k) + ' : ' + v + "\n"
            }
        }

        if (places.length == 1){
            notificationString += 'No local '
        } else {
            notificationString += 'Nos locais '
        }
        
        places.forEach((place) => {
            notificationString += ', ' + place    
        })
        notificationString = notificationString.replace(',','')

        let lastComma = notificationString.lastIndexOf(',');
        if (lastComma != -1){
            notificationString = notificationString.substring(0, lastComma) +
            ' e' + notificationString.substring(lastComma + 1);
        }
        // console.log(notificationString.replace(/\n/g,' BREAK '))   
        return notificationString
    },
}
