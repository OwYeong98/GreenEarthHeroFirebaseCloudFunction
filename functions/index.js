const functions = require('firebase-functions');
const stripe = require('stripe')('pk_test_VLgTWVFCVB1AzsOkSTeeRa5P00Z5r56N8D');
const moment = require('moment-timezone');

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

                                    var newNotificationDoc = {
                                        date: moment(moment.now()).tz("Asia/Kuala_Lumpur").format("YYYY-MM-DD HH:mm:ss"),
                                        userId: requesterUserId,
                                        title: acceptingUserName+' has accepted your recycle request',
                                        relatedID: recycleRequestId,
                                        type: "Recycle_Request",
                                        isRead: false
                                    }
    
                                    var addNotificationToDatabase = admin.firestore().collection('Notification').add(newNotificationDoc).then(()=>{
                                        
                                        if(messagingToken !== ""){
                                            const payload = {
                                                notification: {
                                                title: acceptingUserName+' has accepted your recycle request',
                                                body: acceptingUserName+' will be your collector for your request at '+address
                                                }
                                            };
    
                                            admin.messaging().sendToDevice(messagingToken,payload)
        
                                            return true
                                        }else{
                                            return false
                                        }
                                    }).catch((error)=>{
                                        console.log('Error updating the document:', error);
                                        return false
                                    })

                                    return addNotificationToDatabase
                                }else{
                                    return false
                                }

                            });
                        
                        return getAcceptingUser
                        
                    }else{
                        return false
                    }
                }
            ).catch(err=>{
                console.log("Error getting Doc",err)
                return false
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

                                    var newNotificationDoc = {
                                        date: moment(moment.now()).tz("Asia/Kuala_Lumpur").format("YYYY-MM-DD HH:mm:ss"),
                                        userId: requesterUserId,
                                        title: acceptingUserName+' has cancelled volunteer to collect your recycle request',
                                        relatedID: recycleRequestId,
                                        type: "Recycle_Request",
                                        isRead: false
                                    }
    
                                    var addNotificationToDatabase = admin.firestore().collection('Notification').add(newNotificationDoc).then(()=>{
                                        
                                        if(messagingToken !== ""){
                                            const payload = {
                                                notification: {
                                                title: acceptingUserName+' has cancelled volunteer to collect your recycle request',
                                                body: 'Your Recycle Request at '+address+' will now be made available for community to volunteer for collection!'
                                                }
                                            };
        
        
                                            admin.messaging().sendToDevice(messagingToken,payload)
        
                                            return true
                                        }else{
                                            return false
                                        }
                                    }).catch((error)=>{
                                        console.log('Error updating the document:', error);
                                        return false
                                    })

                                    return addNotificationToDatabase
                                }else{
                                    return false
                                }

                            });
                        
                        return getAcceptingUser
                        
                    }else{
                        return false
                    }
                }
            ).catch(err=>{
                console.log("Error getting Doc",err)
                return false
            })

            return getUser2
        }else{
            return false
        }
})

exports.sendLocationSharedByVolunteerNotification = functions.firestore
    .document('Recycle_Request/{requestId}')
    .onUpdate((change,context) => {


        var recycleRequestId = context.params.requestId
        var requesterUserId = change.after.data().userId
        
        //when someone accepted to collect the recycle request
        if(change.before.data().isLocationShared !== change.after.data().isLocationShared){
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

                                    var notifTitle = ""
                                    var message = ""

                                    if(change.after.data().isLocationShared === true){
                                        notifTitle = acceptingUserName+" shared location to you!"
                                        message = acceptingUserName+" has shared his/her location to you for recycle request at "+address
                                    }else{
                                        notifTitle = acceptingUserName+" stop sharing location to you!"
                                        message = acceptingUserName+" stop sharing his/her location to you for recycle request at "+address
                                    }

                                    var newNotificationDoc = {
                                        date: moment(moment.now()).tz("Asia/Kuala_Lumpur").format("YYYY-MM-DD HH:mm:ss"),
                                        userId: requesterUserId,
                                        title: message,
                                        relatedID: recycleRequestId,
                                        type: "Recycle_Request",
                                        isRead: false
                                    }
    
                                    var addNotificationToDatabase = admin.firestore().collection('Notification').add(newNotificationDoc).then(()=>{
                                        
                                        if(messagingToken !== ""){
                                            const payload = {
                                                notification: {
                                                title: notifTitle,
                                                body: message
                                                }
                                            };
    
                                            admin.messaging().sendToDevice(messagingToken,payload)
        
                                            return true
                                        }else{
                                            return false
                                        }
                                    }).catch((error)=>{
                                        console.log('Error updating the document:', error);
                                        return false
                                    })

                                    return addNotificationToDatabase
                                }else{
                                    return false
                                }

                            });
                        
                        return getAcceptingUser
                        
                    }else{
                        return false
                    }
                }
            ).catch(err=>{
                console.log("Error getting Doc",err)
                return false
            })

            return getUser
        }else{
            return false
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

                                var newNotificationDoc = {
                                    date: moment(moment.now()).tz("Asia/Kuala_Lumpur").format("YYYY-MM-DD HH:mm:ss"),
                                    userId: requesterUserId,
                                    title: acceptingUserName+' has completed collecting your recycle request',
                                    relatedID: context.params.id,
                                    type: "Recycle_Request_History",
                                    isRead: false
                                }

                                var addNotificationToDatabase = admin.firestore().collection('Notification').add(newNotificationDoc).then(()=>{
                                    
                                    if(messagingToken !== ""){
                                        const payload = {
                                            notification: {
                                            title: acceptingUserName+' has completed collecting your recycle request',
                                            body: 'Your Recycle Request at '+address+' is collected successfully!'
                                            }
                                        };
    
                                        console.log("send token: "+messagingToken)
    
                                        admin.messaging().sendToDevice(messagingToken,payload)
    
                                        return true
                                    }else{
                                        return false
                                    }
                                }).catch((error)=>{
                                    console.log('Error updating the document:', error);
                                    return false
                                })

                                return addNotificationToDatabase
                            }else{
                                return false
                            }

                        });
                    
                    return getAcceptingUser
                    
                }else{
                    return false
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
                            var getSenderUserDetail = admin.firestore().collection("Users").doc(senderId).get().then(
                                senderUserdocumentSnapshot=>{
                                    var getReceiverUser = admin.firestore().collection("Users").doc(userIdOfUserThatNeedToBeNotify).get().then(
                                        receiverUserdocumentSnapshot=>{
                
                                            if(receiverUserdocumentSnapshot.exists && senderUserdocumentSnapshot.exists){
                                                var senderName = senderUserdocumentSnapshot.data().lastName + " "+ senderUserdocumentSnapshot.data().firstName
                                                var messagingToken = receiverUserdocumentSnapshot.data().cloudMessagingId

                                                var newNotificationDoc = {
                                                    date: moment(moment.now()).tz("Asia/Kuala_Lumpur").format("YYYY-MM-DD HH:mm:ss"),
                                                    userId: userIdOfUserThatNeedToBeNotify,
                                                    title: senderName+' just sent you a message!',
                                                    relatedID: context.params.chatRoomId,
                                                    type: "Chat_Room",
                                                    isRead: false
                                                }
            
                                                var addNotificationToDatabase = admin.firestore().collection('Notification').add(newNotificationDoc).then(()=>{
                                                    
                                                    if(messagingToken !== ""){
                                                        // Notification details.
                                                        const payload = {
                                                            notification: {
                                                            title: senderName+' just sent you a message!',
                                                            body: message
                                                            }
                                                        };
                    
                    
                                                        admin.messaging().sendToDevice(messagingToken,payload)
                    
                                                        return true
                                                    }else{
                                                        return false
                                                    }
                                                }).catch((error)=>{
                                                    console.log('Error updating the document:', error);
                                                    return false
                                                })

                                                return addNotificationToDatabase
                                                
                                                
                                            }else{
                                                return false
                                            }
                
                                        });
                                    
                                    return getReceiverUser


                                });
                            
                            return getSenderUserDetail
                        }else{
                            return false
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

exports.sendNotificationWhenItemIsBoughtBySomeone = functions.firestore
    .document('Second_Hand_Item/{itemId}')
    .onUpdate((change,context) => {

        var sellerUserId = change.after.data().postedBy
        var itemName = change.after.data().itemName
        var itemId = context.params.itemId
        
        //when someone accepted to collect the recycle request
        if(change.before.data().boughtBy === "" && change.after.data().boughtBy !== ""){
            var boughtByUserId = change.after.data().boughtBy
            //get user detail
            var getUser = admin.firestore().collection("Users").doc(boughtByUserId).get().then(
                boughtByUserdocumentSnapshot=>{
                    if(boughtByUserdocumentSnapshot.exists){
                        var buyerUserName = boughtByUserdocumentSnapshot.data().lastName + " "+ boughtByUserdocumentSnapshot.data().firstName

                        //get accepting user detail
                        var getSellerUser = admin.firestore().collection("Users").doc(sellerUserId).get().then(
                            sellerUserdocumentSnapshot=>{

                                if(sellerUserdocumentSnapshot.exists){
                                    var newNotificationDoc = {
                                        date: moment(moment.now()).tz("Asia/Kuala_Lumpur").format("YYYY-MM-DD HH:mm:ss"),
                                        userId: sellerUserId,
                                        title: `Your Item ${itemName} have been bought by ${buyerUserName}`,
                                        relatedID: itemId,
                                        type: "Item_Sale",
                                        isRead: false
                                    }

                                    var addNotificationToDatabase = admin.firestore().collection('Notification').add(newNotificationDoc).then(()=>{
                            
                                        var messagingToken = sellerUserdocumentSnapshot.data().cloudMessagingId
                                        
                                        if(messagingToken !== ""){
                                            // Notification details.
                                            const payload = {
                                                notification: {
                                                title: `Your Item ${itemName} is sold!`,
                                                body: `Your Item ${itemName} have been bought by ${buyerUserName}`
                                                }
                                            };


                                            admin.messaging().sendToDevice(messagingToken,payload)

                                            return true
                                        }else{
                                            return false
                                        }
                                    }).catch((error)=>{
                                        console.log('Error updating the document:', error);
                                        return false
                                    })
            
                                    return addNotificationToDatabase

                                    
                                }else{
                                    return null
                                }

                            });
                        
                        return getSellerUser
                        
                    }else{
                        return false
                    }
                }
            ).catch(err=>{
                console.log("Error getting Doc",err)
                return false
            })

            return getUser       
        }else{
            return false
        }
})

exports.sendNotificationWhenDeliveryDetailIsUpdated = functions.firestore
    .document('Second_Hand_Item/{itemId}')
    .onUpdate((change,context) => {

        var itemId = context.params.itemId
        var buyerUserId = change.after.data().boughtBy
        var itemName = change.after.data().itemName
        var title = ""
        var body = ""
        
        if(change.before.data().trackingNo !== change.after.data().trackingNo){
            //when someone accepted to collect the recycle request
            if(change.before.data().trackingNo === "" && change.after.data().trackingNo !== ""){
                title = "Delivery detail for your purchase is added!";
                body = "The Seller had added delivery detail for the item "+ itemName
            }else if(change.before.data().trackingNo !== "" && change.after.data().trackingNo !== ""){
                title = "Delivery detail for your purchase is updated!";
                body = "The Seller had updated delivery detail for the item "+ itemName
            }

            var getBuyerUser = admin.firestore().collection("Users").doc(buyerUserId).get().then(
                buyerUserdocumentSnapshot=>{
                    if(buyerUserdocumentSnapshot.exists){
                        var newNotificationDoc = {
                            date: moment(moment.now()).tz("Asia/Kuala_Lumpur").format("YYYY-MM-DD HH:mm:ss"),
                            userId: buyerUserId,
                            title: title,
                            relatedID: itemId,
                            type: "Item_Purchase",
                            isRead: false
                        }

                        var addNotificaationToDatabase = admin.firestore().collection('Notification').add(newNotificationDoc).then(()=>{
                            
                            var messagingToken = buyerUserdocumentSnapshot.data().cloudMessagingId
                        
                            if(messagingToken !== "" && title!==""&& body!==""){
                                // Notification details.
                                const payload = {
                                    notification: {
                                    title: title,
                                    body: body
                                    }
                                };
        
                                admin.messaging().sendToDevice(messagingToken,payload)

                                return true
                            }else{
                                return false
                            }
                        }).catch((error)=>{
                            console.log('Error updating the document:', error);
                            return false
                        })

                        return addNotificaationToDatabase
                    }else{
                        return false
                    }
                });
            
            return getBuyerUser
        }else{
            return false
        }
})

exports.updateTotalFoodAmountWhenQuantityChange = functions.firestore
    .document('Food_Donation/{foodDonationId}/Food_List/{foodId}')
    .onUpdate((change,context) => {

        var foodDonationId = context.params.foodDonationId
        console.log("food Donation ID: "+foodDonationId)
        var calculateTotalFood = admin.firestore().collection(`Food_Donation/${foodDonationId}/Food_List`).get().then(
            foodList=>{
                var totalFood = 0
                foodList.forEach((food)=>{
                    var claimedFoodQty = food.data().claimedFoodQuantity
                    var foodQuantity = food.data().foodQuantity

                    var foodLeft = foodQuantity - claimedFoodQty
                    totalFood = totalFood+foodLeft
                })

                var updateFoodAmount = admin.firestore().collection('Food_Donation').doc(foodDonationId).update({totalFoodAmount:totalFood}).then(()=>{
                    return true
                }).catch((error)=>{
                    console.log('Error updating the document:', error);
                    return false
                })

                return updateFoodAmount
            }
        ).catch((error)=>{
            console.log('Error updating the document:', error);
            return 0
        })

        return calculateTotalFood
})