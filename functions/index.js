var functions = require('firebase-functions');
// const cors = require('cors')({origin:true});

// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions
//

// exports.helloWorld = functions.https.onRequest((request, response) => {
//  cors(request,response, () => {response.send("Hello from Firebase!");
// });
// })

exports.setCounters = functions.database.ref('/users/{uid}/data/machines/{machine}/entries/{entryid}')
    .onWrite(event => {
        const score = event.data.child('score').val()
        const counterRef = event.data.ref.parent.parent.child('counters').child(score)
        
        return counterRef.transaction((current) => {
            return (current || 0) + 1
        })
})