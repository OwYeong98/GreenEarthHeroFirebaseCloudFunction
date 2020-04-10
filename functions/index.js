const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.sendRequestAcceptedNotification = functions.firestore
    .document('Recycle_Request/{requestId}')
    .onUpdate((change,context) => {


        var recycleRequestId = context.params.requestId
        var requesterUserId = change.after.data().userId
        console.log('test= '+change.before.data());

        console.log('acceptcollect= '+change.before.data().accepted_collect_by+" | "+"after "+ change.after.data().accepted_collect_by);
        if(change.before.data().accepted_collect_by === "" && change.after.data().accepted_collect_by !== ""){
            console.log("before is empty and after is not empty. requesterUserId: "+ requesterUserId)
            
            //get user detail
            var getUser = admin.firestore().collection("Users").doc(requesterUserId).get().then(
                requestUserdocumentSnapshot=>{
                    if(requestUserdocumentSnapshot.exists){

                        //get accepting user detail
                        var getAcceptingUser = admin.firestore().collection("Users").doc(requesterUserId).get().then(
                            acceptingUserdocumentSnapshot=>{

                                if(acceptingUserdocumentSnapshot.exists){
                                    var messagingToken = requestUserdocumentSnapshot.data().cloudMessagingId
                                    var acceptingUserName = acceptingUserdocumentSnapshot.data().lastName + " "+ acceptingUserdocumentSnapshot.data().firstName
                                    var address = change.after.data().address

                                    if(messagingToken !== ""){
                                        // Notification details.
                                        const payload = {
                                            notification: {
                                            title: acceptingUserName+' has accepted your recycle request',
                                            body: acceptingUserName+' will be your collector for your request at '+address
                                            }
                                        };

                                        console.log("send token: "+messagingToken)

                                        admin.messaging().sendToDevice(messagingToken,payload)

                                        return null
                                    }else{
                                        return null
                                    }
                                }else{
                                    return null
                                }

                            });
                        
                        return getAcceptingUser
                        
                    }else{
                        return null
                    }
                }
            ).catch(err=>{
                console.log("Error getting Doc",err)
                return null
            })

            return getUser
        }else{
            return null
        }
})