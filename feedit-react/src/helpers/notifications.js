
import _ from 'lodash'
import excelente_thumb  from '../img/excelente.png'
import bom_thumb from '../img/bom.png'
import ruim_thumb from '../img/ruim.png'
import grid_icon from '../img/grid.png'
import bell_crossed_inv from '../img/bell_crossed_inv.png'
import notification_sound from '../assets/pop.mp3'
import firebase from 'firebase'

import Store from './store.js'


let isReady = false

const notificationSound = new Audio(notification_sound)
const messaging = firebase.messaging()

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
        amount : 'always',
        period : 6
    },
    cache : {}
}

export default window.notifications = {
    getSettings : function(){
        return settings
    },

    getScoresAsArray : function(){
        let arr = []
         for (let [k, v] of Object.entries(settings.customSettings.grades)) {
            if (v && !arr.includes(v)) {
                arr.push(k)
            }
        }
        return arr
    },

    setSettings : function(property,value){
        settings[property] = value
    },

    saveSettings : function(){
        this.notificationSettingsRef.update(settings)
    },

    notify : function(review){
            if (isReady && settings.enabled === true){
                notificationSound.play()
                var options = { tag : 'feedit-notification' };
                
                this.registration.getNotifications(options).then((notifications) => {
                    if (notifications.length != 0){
                    notifications[0].close();
                    }

                    let notification = {
                    // actions: [{action: 'open',title: "Abrir o Aplicativo",icon:grid_icon},{action: 'mute',title: "Silenciar",icon:bell_crossed_inv}],
                    icon: this.getThumb(review.score),
                    body: 'Um cliente avaliou o local '+_.capitalize(review.place) +' como '+ _.capitalize(review.score),
                    tag: 'feedit-notification',
                    vibrate: [300,100,100]
                    }

                    this.registration.showNotification('Feedit - Nova Avaliação!',notification).then(() => {
                        setTimeout(() => {
                            this.registration.getNotifications(options).then((notifications) => {
                                try {
                                    notifications[0].close()
                                } catch(e) {
                                }
                            })
                        }, 5000)
                    })
                })
        }
    },

    setup : function(callback){
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


        
        // messaging.requestPermission().then(() => {
        //     console.log('Notifications helper ready/allowed')
        //     messaging.getToken().then((token)=> {
        //         if (token){
                    
        //         }
        //     })
        //     isReady = true
        // }).catch( (err) => {
        //     console.log('Unable to get permission to notify', err)
        // })
        
    },

    getThumb : function(score){
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
            } else if (Object.keys(snapshot.val().customSettings.machines).length != Store.getStore('machines').length) {
                settings = snapshot.val()
                console.log(Object.keys(snapshot.val().customSettings.machines))
                console.log(Store.getStore('machines'))
                settings['machines'] = {}
                Store.getStore('machines').forEach( (item) => {
                    settings.customSettings.machines[item] = true
                })
                this.notificationSettingsRef.set(settings)
                console.log('Obtained HDHS settings from firebase')
                callback()
            } else {
                settings = snapshot.val()
                console.log('Obtained notification settings from firebase')
                callback()
            }
        })
    }
}
