import firebase from 'firebase'

export function getMemory(boxname){
    let memoryRef = firebase.database().ref(firebase.auth().currentUser.uid +
		'/data/machines/' + boxname + '/memory')
    return memoryRef.once('value')
}

export function setMemory(uid,boxname,count){
    let memoryRef = firebase.database()
        .ref(uid +'/data/machines/' + boxname + '/memory')
        .set(count)
}