  
  const _ = require('lodash')
  
  module.exports = {
      notify : function(review){
        if (!Notification) {
            alert('Notificações não estão disponíveis nesse navegador. Experimente um navegador mais moderno como o Google Chrome');
        }

        if (Notification.permission !== "granted"){
            Notification.requestPermission();
        } else {
            var options = { tag : 'feedit-notification' };
            navigator.serviceWorker.ready.then((registration) => {
            registration.getNotifications(options).then((notifications) => {
                if (notifications.length != 0){
                notifications[0].close();
                }

            setTimeout( () => {
                registration.showNotification('Feedit - Nova avaliação!', {
                actions: [{action: 'open',title: "Abrir o Aplicativo",icon: '../img/grid.png'},{action: 'mute',title: "Silenciar",icon: '../img/bell_crossed_inv.png'}],
                icon: review.score+'.png',
                body: 'Um cliente avaliou o local '+_.capitalize(review.place) +' como '+ _.capitalize(review.score),
                tag: 'feedit-notification',
                vibrate: [300,100,100]
                })})}, 500);
            });
        }
    }
  }