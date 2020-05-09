const functions = require('firebase-functions');
const stripe = require('stripe')('pk_test_VLgTWVFCVB1AzsOkSTeeRa5P00Z5r56N8D');

const admin = require('firebase-admin');
admin.initializeApp();


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.sendRecycleRequestAcceptedOrCancelledNotification = functions.firestore
    .document('Recycle_Request/{requestId}')
    .onUpdate((change,context) => {


        var recycleRequestId = context.params.requestId
        var requesterUserId = change.after.data().userId
        
        //when someone accepted to collect the recycle request
        if(change.before.data().accepted_collect_by === "" && change.after.data().accepted_collect_by !== ""){
            var acceptorUserId = change.after.data().accepted_collect_by
            //get user detail
            var getUser = admin.firestore().collection("Users").doc(requesterUserId).get().then(
                requestUserdocumentSnapshot=>{
                    if(requestUserdocumentSnapshot.exists){

                        //get accepting user detail
                        var getAcceptingUser = admin.firestore().collection("Users").doc(acceptorUserId).get().then(
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
        }else if(change.before.data().accepted_collect_by !== "" && change.after.data().accepted_collect_by === ""){
            //when someone cancel volunteer for the recycle request

            var acceptorUserId2 = change.before.data().accepted_collect_by

            //get user detail
            var getUser2 = admin.firestore().collection("Users").doc(requesterUserId).get().then(
                requestUserdocumentSnapshot=>{
                    if(requestUserdocumentSnapshot.exists){

                        //get accepting user detail
                        var getAcceptingUser = admin.firestore().collection("Users").doc(acceptorUserId2).get().then(
                            acceptingUserdocumentSnapshot=>{

                                if(acceptingUserdocumentSnapshot.exists){
                                    var messagingToken = requestUserdocumentSnapshot.data().cloudMessagingId
                                    var acceptingUserName = acceptingUserdocumentSnapshot.data().lastName + " "+ acceptingUserdocumentSnapshot.data().firstName
                                    var address = change.after.data().address

                                    if(messagingToken !== ""){
                                        // Notification details.
                                        const payload = {
                                            notification: {
                                            title: acceptingUserName+' has cancelled volunteer to collect your recycle request',
                                            body: 'Your Recycle Request at '+address+' will now be made available for community to volunteer for collection!'
                                            }
                                        };

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
            
        }else{
            return null
        }
})


exports.sendNotificationWhenRecycleRequestCollectionIsDone = functions.firestore
    .document('Recycle_Request_History/{id}')
    .onCreate((snap, context) => {
        // When there are recycle request history added to firestore db
        const newDoc = snap.data()
        
        
        var requesterUserId = newDoc.user_requested.userId
        var acceptorUserId = newDoc.user_collected.userId

        //get user detail
        var getUser = admin.firestore().collection("Users").doc(requesterUserId).get().then(
            requestUserdocumentSnapshot=>{
                if(requestUserdocumentSnapshot.exists){

                    //get accepting user detail
                    var getAcceptingUser = admin.firestore().collection("Users").doc(acceptorUserId).get().then(
                        acceptingUserdocumentSnapshot=>{

                            if(acceptingUserdocumentSnapshot.exists){
                                var messagingToken = requestUserdocumentSnapshot.data().cloudMessagingId
                                var acceptingUserName = acceptingUserdocumentSnapshot.data().lastName + " "+ acceptingUserdocumentSnapshot.data().firstName
                                var address = newDoc.address

                                if(messagingToken !== ""){
                                    // Notification details.
                                    const payload = {
                                        notification: {
                                        title: acceptingUserName+' has completed collecting your recycle request',
                                        body: 'Your Recycle Request at '+address+' is collected successfully!'
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
});

exports.sendNotificationWhenNewChatMessagesIsFound = functions.firestore
    .document('Chat_Room/{chatRoomId}/MessagesList/{messageId}')
    .onCreate((snap, context) => {
        // When there are new message
        const newMessageDoc = snap.data()
        
        
        var senderId = newMessageDoc.userSend
        var message = newMessageDoc.message

        // Update the lastest message
        var updateLastestMessageOfTheRoom = admin.firestore().collection("Chat_Room").doc(context.params.chatRoomId).update({
            "lastMessage": message,
            "lastMessageSendBy": senderId
             })
            .then(function() {
            

                //get Chat Room to find another person in the chat room and send him notification
                var getChatRoom = admin.firestore().collection("Chat_Room").doc(context.params.chatRoomId).get().then(
                    chatRoomdocumentSnapshot=>{
                        if(chatRoomdocumentSnapshot.exists){
                            var user1 = chatRoomdocumentSnapshot.data().chatUsers[0]
                            var user2 = chatRoomdocumentSnapshot.data().chatUsers[1]
                            

                            var userIdOfUserThatNeedToBeNotify = ""
                            if(senderId === user1){
                                userIdOfUserThatNeedToBeNotify = user2
                            }else{
                                userIdOfUserThatNeedToBeNotify = user1
                            }

                            //get the token of user that need to be notify
                            var getSenderUserDetail = admin.firestore().collection("Users").doc(userIdOfUserThatNeedToBeNotify).get().then(
                                senderUserdocumentSnapshot=>{
                                    var getAcceptingUser = admin.firestore().collection("Users").doc(userIdOfUserThatNeedToBeNotify).get().then(
                                        acceptingUserdocumentSnapshot=>{
                
                                            if(acceptingUserdocumentSnapshot.exists && senderUserdocumentSnapshot.exists){
                                                var senderName = senderUserdocumentSnapshot.data().lastName + " "+ senderUserdocumentSnapshot.data().firstName
                                                var messagingToken = acceptingUserdocumentSnapshot.data().cloudMessagingId
                                                
                
                                                if(messagingToken !== ""){
                                                    // Notification details.
                                                    const payload = {
                                                        notification: {
                                                        title: senderName+' just sent you a message!',
                                                        body: message
                                                        }
                                                    };
                
                
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


                                });
                            
                            return getSenderUserDetail
                        }else{
                            return null
                        }
                    }
                ).catch(err=>{
                    console.log("Error getting Doc",err)
                    return null
                })
                
                return getChatRoom
            });
        return updateLastestMessageOfTheRoom
});

exports.getStripePaymentIntent = functions.https.onCall((data, context) => {
    
    const paymentIntent = stripe.paymentIntents.create({
        amount: 10,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: { uid: 'some_userID' }
    });
    
    var clientSecret = paymentIntent.getClientSecret();


    return {
        secretKey: clientSecret
      };
      
});