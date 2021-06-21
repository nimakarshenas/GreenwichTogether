import React, {useState, useEffect} from "react";
import { View, SafeAreaView, Text, StyleSheet, KeyboardAvoidingView, Keyboard,  TouchableWithoutFeedback, Linking, Platform, VirtualizedList } from "react-native";
import { Input } from 'react-native-elements';
import { Button } from 'react-native-elements';
import API, { graphqlOperation } from '@aws-amplify/api';
import  {messagesByChannelId } from '../graphql/queries';
import '@aws-amplify/pubsub';
import { createMessage } from '../graphql/mutations';
import { onCreateMessage } from '../graphql/subscriptions';
import { Auth } from '@aws-amplify/auth';




const ContactScreen = () => {

  /*state containing the list of message 
  object between the users*/
  /* Message object follows from GraphQL schema and has the following form,
  where the type of the object attribute is shown in between the curly braces:
  message: {
    id: {string}
    channelID: {string}
    author: {string}
    body: {string}
    createdAt: {AWSDateTime}
    updatedAt: {AWSDateTime} see Amplify documentation for info on how to handle 
  } */
  const [messages, setMessages] = useState([]);

  //This state contains the content inside the "Type your message here" input
  const [messageBody, setMessageBody] = useState('');


  /* This contains the current users info that 
  is derived from the authentication flow, the object has the following form:
  userInfo: attributes : {
    email: "XXXX@XXXXX.com",
    email_verified: true,
    family_name: "Karshenas",
    name: "Nima",
    phone_number: "+44XXXXXXXX",
    phone_number_verified: false,
    sub: "819a8126-30e4-43ab-8b0b-8bb7f41c07d8",
  },
  id: "us-west-2:4e6ab2fc-aa46-4f0e-8a89-af5d7cfd98b5",
  username: "819a8126-30e4-43ab-8b0b-8bb7f41c07d8",
  } 
  }*/
  const [userInfo, setUserInfo] = useState({});


  /* FUNCTIONS FOR VIRTUALISED LIST */
  const getItem = (data, index) => ({
    body: data[index].body,
    author: data[index].author
  });
  const getItemCount = (data) => data.length;


    
  /* This is the function called when the call button is pressed, 
  pop-up with option to dial the number specified*/
  const dialCall = async () => {
 
    let phoneNumber = '';
    //This process has slightly different syntax in Android and iOS
    // Phone number currently set to council helpline
    if (Platform.OS === 'android') {
      phoneNumber = 'tel:${02088548888}';
    }
    else {
      phoneNumber = 'telprompt:${02088548888}';
    }
    //Open the prompt to call the number
    Linking.openURL(phoneNumber);
  };

  /* When the message input detects a change this function is called,
  it then sets the messageBody state to what is currently inside the input*/
  const handleChange = (body) => {
    setMessageBody(body)
  };

  /* This function is called when the send button is pressed,
  We essentially create a graphQL mutation to upload the message to the server,
  the channel id is set to the username which is essentially the user id,
  the author attribute is the same, and finally the body of the message is 
  set to the messageBody state which contains the contents of the input box.
  The .trim() method removes whitespace from each end of the string*/
  const handleSubmit = async () => {
    const input = {
      channelID: userInfo.username,
      author: userInfo.username,
      body: messageBody.trim()
    };

    try {
      //When message is sent, the input box should become empty again
      setMessageBody('');
      //Upload the message to the server
      await API.graphql(graphqlOperation(createMessage, { input }))
    } catch (error) {
      console.warn(error);
    }
  };

  /* set the userInfo state when the page first mounts */
  useEffect(() => { 
    Auth.currentUserInfo().then((userInfo) => {
      setUserInfo(userInfo)
    })
  }, [])

  /* Queries the messages for this specific channel, sorts by date and stores
  them in the 'messages' state variable. Note this effect is called each time 
  userInfo changes, this is just a safety measure incase it changes*/
  useEffect(() => {
    
    API
      .graphql(graphqlOperation(messagesByChannelId, {
        channelID: userInfo.username,
        sortDirection: 'ASC'
      }))
      .then((response) => {
        console.log(response)
        const items = response?.data?.messagesByChannelID?.items;

        if (items) {
          setMessages(items);
        }
      })
  }, [userInfo]);

  /* When handleSubmit(){line 71} is called, it uploads the message to the server using the
  createMessage graphQL mutation,
  this method essentially adds a listener to the createMessage function, when this is called 
  in handleSubmit(), it pulls the new, updated list of messages and updates 
  the messages that can be seen on the UI.
  Note: each time messages changes this method is called, 
  this happens when this page first opens and first set of messages queried from the server,
  and then when the messages are updated in this subscription/listener*/
  useEffect(() => {
    const subscription = API
      .graphql(graphqlOperation(onCreateMessage))
      .subscribe({
        //next acts as the callback for the listener
        next: (event) => {
          /* event has the following form:
          {
            provider: { ... }, // this contains AppSync subscription metadata
            value: {
              data: {
                onCreateMessage: {
                  id: "374fdfe6-71e4-4e02-b41f-d9d78037c916",
                  channelID: "1",
                  author: "Dave",
                  body: "This should be the new message",
                  createdAt: "2020-08-01T04:43:58.335Z",
                  updatedAt: "2020-08-01T04:43:58.335Z",
                }
              }
            }
        }*/
          setMessages([...messages, event.value.data.onCreateMessage]);
        }
      });
      /* return acts as the clean up method for the effect, the function is essentially called
      as the effect is called again or is unmounting */
    return () => {
      subscription.unsubscribe();
    }
  }, [messages] /* */);


  






  /*  RENDER SECTION */



  return( 
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View
      style={styles.mainContainer}
    >
    
    {/*---------- HEADER -----------*/}
    <View style={styles.headerContainer}>
      <View style={styles.headerItemContainer}>
        <Text style={styles.headerText}>Call us instead</Text>
        <Button
            style={{alignSelf:'flex-end'}}
            type="clear"
            icon={{
              name: "call",
              size: 30,
              color: "white"
            }}
            onPress={dialCall}
            />
      </View>
    </View>

    {/* Container holding the messages*/}
    <SafeAreaView style={{flex:1, width:'100%'}}>
    <VirtualizedList
      getItem={getItem}
      getItemCount={getItemCount}
      initialNumToRender={15}
      data={messages}
      keyExtractor={messages=>messages.id}
      renderItem={({item})=>{ return(
        <View
        style={item.author == userInfo.username ? styles.messageMe : styles.messageYou}>
        {/* Change styling on whether the message is from the user or the admin */}  
        <Text style={item.author == userInfo.username ? styles.messageMeText : styles.messageYouText}>{item.body}</Text>
        </View>
      );}}/>
    </SafeAreaView>
    
    {/* COntainer holding the input box and send button */}
    <KeyboardAvoidingView style={styles.inputContainer}
    behavior="padding"> {/* This means that this container moves up with the keyboard when it is opened  */}
    <Input
      value={messageBody}
      multiline
      placeholder="Type your message here..."
      placeholderTextColor="white"
      containerStyle={{flex:5, paddingTop:10, marginBottom:-13,backgroundColor:'#c20027'}}
      inputContainerStyle={{borderRadius:30, backgroundColor:'#c20027', borderWidth:1, borderColor:'white'}}
      inputStyle={{padding:15, paddingTop:15, color:'white', fontSize:18, fontWeight:'300'}}
      onChangeText={handleChange}
    />
    <Button
      style={{alignSelf:'flex-end', flex:1, paddingTop:18, backgroundColor:'clear'}}
      type="clear"
      icon={{
        name: "send",
        size: 30,
        color: "white"
      }}
      onPress={handleSubmit}
      />
    </KeyboardAvoidingView>
    
    </View>
    </TouchableWithoutFeedback>
    
    );
};





/* -------------- STYLING GOES HERE ----------------- */
const styles = StyleSheet.create({
  
  mainContainer:{
    flex:1, justifyContent:'space-between', backgroundColor:'white', flexDirection:'column'
  },
  headerContainer:{
    zIndex:-5,
    height:90, width:'100%',  alignSelf:'flex-start', backgroundColor:'#c20027', justifyContent:'flex-end', borderBottomWidth:1, borderColor:'black'
  },
  headerItemContainer:{
    flexDirection:'row', justifyContent:'space-between'
  },
  messagesContainer:{
    flex:1, backgroundColor:'white'
  },
  messageYou: {
    marginLeft:5,
    alignSelf:"flex-start",
    marginTop:4,
    paddingHorizontal: 12,
    paddingVertical:12,
    maxWidth:250,
    backgroundColor:"#c20027",
    borderRadius:25,
    
  },
  messageYouText:{
    fontSize:16,
    fontWeight:"400",
    color:'white'
  },
  
  messageMe: {
    marginRight:5,
    marginTop:4,
    paddingHorizontal: 12,
    paddingVertical:12,
    maxWidth:250,
    borderRadius:25,
    alignSelf:"flex-end",
    backgroundColor:'white',
    color:"#c20027",
    borderWidth:1.5,
    borderColor:"#c20027",
    
  },
  messageMeText:{
    fontSize:16,
    fontWeight:"400",
    color:"#c20027"
  },

  inputContainer:{
    zIndex:-5,
    borderTopWidth:1,
    borderColor:'black',
    alignSelf:'flex-end',
    backgroundColor:'#c20027',
    flexDirection:'row'
  },

  headerText:{
    marginLeft:10,
    marginTop:5,
    alignSelf:'flex-start',
    fontSize:30,
    fontWeight:"400",
    color:'white'
  },
  
});

export default ContactScreen;
