
import _ from 'lodash'
import excelente_thumb  from '../img/excelente.png'
import bom_thumb from '../img/bom.png'
import ruim_thumb from '../img/ruim.png'
import grid_icon from '../img/grid.png'
import bell_crossed_inv from '../img/bell_crossed_inv.png'
import notification_sound from '../assets/pop.mp3'
let isReady = false

const notificationSound = new Audio(notification_sound)

export default {
    notify : function(review){
            if (isReady){
                notificationSound.play()
                var options = { tag : 'feedit-notification' };
                
                navigator.serviceWorker.ready.then((registration) => {

                registration.addEventListener('notificationclick', function(event) {  
                var messageId = event.notification.data;

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
                
                
                registration.getNotifications(options).then((notifications) => {
                    if (notifications.length != 0){
                    notifications[0].close();
                    }

                    let notification = {
                    actions: [{action: 'open',title: "Abrir o Aplicativo",icon:grid_icon},{action: 'mute',title: "Silenciar",icon:bell_crossed_inv}],
                    icon: this.getThumb(review.score),
                    body: 'Um cliente avaliou o local '+_.capitalize(review.place) +' como '+ _.capitalize(review.score),
                    tag: 'feedit-notification',
                    vibrate: [300,100,100]
                    }

                    registration.showNotification('Feedit - Nova Avaliação!',notification).then(() => {
                        setTimeout(() => {
                            registration.getNotifications(options).then((notifications) => {
                                try {
                                    notifications[0].close()
                                } catch(e) {
                                }
                            })
                        }, 5000)
                    })
                })
            })
        }
    },

    setup : function(){
        if (!Notification) {
            alert('Notificações não estão disponíveis nesse navegador. Experimente um navegador mais moderno como o Google Chrome');
        } else if (Notification.permission !== "granted"){
            Notification.requestPermission();
        } else {    
            console.log('notifications helper ready')
            isReady = true
        }
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
    }
}
