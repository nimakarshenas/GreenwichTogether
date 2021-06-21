import * as React from "react";
import {useEffect, useState} from "react";
import { Text, StyleSheet, View, Image} from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import DropDownPicker from 'react-native-dropdown-picker';
import API, { graphqlOperation } from '@aws-amplify/api';
import  {listChannels } from '../graphql/queries';
import { Button } from 'react-native-elements';
import { Avatar } from 'react-native-paper';
import { List } from 'react-native-paper';
import { Auth } from 'aws-amplify';
import { onUpdateChannel } from "../graphql/subscriptions";
import { updateChannel } from "../graphql/mutations";
import RtcEngine from "react-native-agora";


/* Android must ask permission to use audio */
export const useRequestAudio = () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        if (
          granted['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('You can use the mic');
        } else {
          console.log('Permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
};


/* destroy rtcengine insstance when cleaning up*/
const destroyAgoraEngine = useCallback(async () => {
  await rtcEngine.destroy();
}, []);




const ChatRoom = () => {
  /* appId taken from Agora.io console*/
  const appId = "PUT_APPID_HERE";

  /* muteState set to the name of the icon, this could instead be a 
  true/false but this made things easier changing between the mute 
  and unmute icons when pressed. 
  Note: "microphone" = unmute, "microphone-slash = mute"*/
  const [muteState, setMuteState] = useState("microphone");

  /* much like the muteState, md-volume-high = sound on, 
  md-volume-mute = sound off*/
  const [soundState, setSoundState] = useState("md-volume-high");

  /* Button text for the join/leave button, it is also used to 
  keep track of the users join status*/
  const [buttonText, setButtonText] = useState("Join");

  /*open state for dropdownpicker JSX element*/
  const [open, setOpen] = useState(false);

  /* Here we store all the infor regarding a channel, it is an
  array of objects with the following form:
  channelInfo:{
    appId: {string} ---- appId for agora.io
    createdAt: {AWSdatetime} ----- when the channel was created
    id: {string} ------ unique id for each channel, used for updateChannel mutation
    label:{string} ---- What is seen on the screen of the app for channel name
    value:{string} ---- This is used for DropDownPicker Element, can be the same as label
    updatedAt:{string} --- when channel was last updated = when user last joined/left a channel
    token:{string} --- unique channel token, used for joining channel in Agora
    users:{array[string]} --- list of user names inside ther channel
  }*/
  const [channelInfo, setChannelInfo] = useState([]);

  /* current selected channel in the dropdown selector*/
  const [selectedChannel, setSelectedChannel] = useState("");

  /* store the users full name so it can be displayed in the channel*/
  const [userFullName, setUserFullName] = useState({});

  /* What channel the user has currently joined*/
  const [joinedChannel, setJoinedChannel] = useState("");

  /* change the color of the users full name when shown on the dropdown 
  that displays all the names of the users that have currently joined a
  specific channel*/
  const [muteColor, setMuteColor] = useState("#c20027");




  /* ----------- HELPER FUNCTIONS -------------*/


  /* This is a simple helper function that finds the index of an 
  object within an array of a specific 'value' attribute */
  const findindex = (ARR_OF_OBJS, CHAN_TO_FIND) => {
    for(let i=0 ; i < ARR_OF_OBJS.length ; i++ ){
      if(ARR_OF_OBJS[i].value === CHAN_TO_FIND){
        return i;
      }
    }
    return -1; 
  }
  
  /* This essentially removes a user from a channel and returns a copy 
  of the array holding the objects */
  const removeItem = (ARR_OF_OBJS, USER_TO_REMOVE, IDX_OF_OBJ) => {
    const FIN_ARR = []
    for(let i=0; i<ARR_OF_OBJS[IDX_OF_OBJ].users.length; i++){
      if(ARR_OF_OBJS[IDX_OF_OBJ].users[i] !== USER_TO_REMOVE){
        FIN_ARR.push(ARR_OF_OBJS[IDX_OF_OBJ].users[i])
      }
    }
    ARR_OF_OBJS[IDX_OF_OBJ].users = FIN_ARR;
    const copyArr = ARR_OF_OBJS;
    return copyArr;
  }


  /* This is a helper function for handleJoinPress(), we begin by finding
  the index inside the array of the channel that we have joined, we then 
  remove the user(us) from the channel's user attribute(array of names), 
  and then update the Channel information (with the user removed) through 
  a graphql mutation, this is so that the user leaving is visible to everyone
  using the app. We also leave the agora.io channel*/
  const leaveChannel = async () => {
    const idx = findindex(channelInfo, joinedChannel);
    const newChannelInfo = removeItem(channelInfo, userFullName, idx);
    const forInput = newChannelInfo[idx];

    await rtcEngine.leaveChannel();

    try {
      await API.graphql(graphqlOperation(updateChannel, {input: { id: forInput.id, users: forInput.users}}))
    } catch (error) {
      console.warn(error);
    }
    setButtonText("Join")
  }

  /* This function operates much like leaveChannel(), but instead we join
  the user to the channel both through the amplify backend and the agora.io 
  backend*/
  const joinChannel = async () =>{
    const idx = findindex(channelInfo,selectedChannel);
    const forInput = list[idx];
      
    await rtcEngine.joinChannel(forInput.token, selectedChannel, null, 0);

    /* add userFullName(us) to the list of users inside the channel we
    have decided to join */ 
    const list = channelInfo.map(item => 
      item.value === selectedChannel 
      ? {...item, users: [...item.users, userFullName]}
      : item );
    
    
    
    try {
      await API.graphql(graphqlOperation(updateChannel, {input: { id:forInput.id, users: forInput.users}}))
    } catch (error) {
      console.warn(error);
    }
    /* change the button text and the joined channel the selected channel*/
    setButtonText("Leave");
    setJoinedChannel(selectedChannel);

  };


  /* Function for obtaining initials for Avatar display*/
  const getInitials = (name) =>{
    const fullName = name.split(' ');
    const initials = fullName.shift().charAt(0) + fullName.pop().charAt(0);
    return initials;
  }



  /* ----- ALL BUTTON CONTROLS GO HERE ---- */

  /* This function is called when the join/leave button is pressed */
  const handleJoinPress = () => {
    if(buttonText==="Join" && selectedChannel != ""){
      joinChannel();
    }
    else{
      leaveChannel();
    }
  }

  /* first mute from agora, change the icon and also the colour of the text*/
  const handleMutePress = () =>{
    if (muteState==="microphone"){
      await rtcEngine.muteLocalAudioStream(true);
      setMuteState("microphone-slash")
      setMuteColor("#ECB2BE")
    }
    else{
      await rtcEngine.muteLocalAudioStream(true);
      setMuteState("microphone")
      setMuteColor("#c20007")
    }
  }

  /* similar process to handleMutePress*/
  const handleSoundPress = () =>{
    if (soundState==="md-volume-high"){
      rtcEngine.setEnableSpeakerphone(false);
      setSoundState("md-volume-mute")
    }
    else{
      rtcEngine.setEnableSpeakerphone(true);
      setSoundState("md-volume-high")
    }
  }





  /* ----- useEffect functions go here ---------*/

  /* when page first opens we request audio and pull from the Amplify backend
  the current, live information regarding the channels like what users are inside the
  channel etc. */
  useEffect(() => {
    useRequestAudio();
    /* set user info first */
    Auth.currentUserInfo().then((userInfo) => {
      const firstname = userInfo.attributes.name;
      const secondname = userInfo.attributes.family_name;
      setUserFullName(firstname + " " + secondname)
    })
    API
    .graphql(graphqlOperation(listChannels))
    .then((response) => {
      const items = response.data?.listChannels?.items;
      
      if (items) {
        setChannelInfo(items);
        
      }
    });
    
  }, [])
  
  useEffect(() => {
    
    const subscription = API
      .graphql(graphqlOperation(onUpdateChannel))
      .subscribe({
        //next acts as the callback for the listener
        next: (event) => {
          /* event has the following form:
          {
            provider: { ... }, // this contains AppSync subscription metadata
            value: {
              data: {
                onUpdateMessage: {
                  appId: {string} 
                  createdAt: {AWSdatetime} 
                  id: {string} 
                  label:{string} 
                  value:{string} 
                  updatedAt:{string} 
                  token:{string} 
                  users:{array[string]}
                }
              }
            }
        }*/
          const idx = findindex(channelInfo, joinedChannel);
          var channInfoCopy = channelInfo;
          channInfoCopy[idx] = event.value.data.onUpdateChannel;
          setChannelInfo(channInfoCopy);
        }
      });
      /* return acts as the clean up method for the effect, the function is essentially called
      as the effect is called again or is unmounting */
    return () => {
      subscription.unsubscribe();
    }
  }, [channelInfo] /* */);

  useEffect(() => {
    rtcEngine = await RtcEngine.create(appId);

    await rtcEngine.enableAudio();
    await rtcEngine.muteLocalAudioStream(false);
    await rtcEngine.setEnableSpeakerphone(true);

  
    return () => {
      destroyAgoraEngine();
    };
  }, []);
















  /* ---------------------------------- ALL RENDERING GOES HERE ------------------------------------------*/
  return (
  
    <View style={{paddingTop:30, backgroundColor:'white', flex:1, justifyContent:'space-between'}}>

    
    <View style={{flexDirection:'row', justifyContent:'space-evenly', borderBottomWidth:0.5, borderColor:'#c20027' }}>
      <Image 
        source={{uri:"https://www.london-works.com/sites/default/files/supporter-logos/royal-borough-greenwich.png"}}
        style={{height:120, width:160, alignSelf:"flex-start", marginRight:7}}>
      </Image>
      <Text 
        style={{fontSize:35, color:"#c20027", fontWeight:"200", textAlign:"left", alignSelf:"flex-end", paddingBottom:15, marginLeft:7}}>Chat{"\n"}Rooms </Text>
    </View>

    {/* MAIN BODY */} 
    <View style={{flexDirection:'row', borderBottomWidth:0.5, borderColor:'#c20027', paddingTop:10}}>
      
    <DropDownPicker

      listItemContainerStyle={{borderBottomWidth:0.5, borderColor:'#c20027', height:50, marginHorizontal:7}}
      dropDownContainerStyle={{marginLeft:7, elevation:999, borderColor:'#c20027', borderWidth:2}}
      value={selectedChannel}
      setValue={setSelectedChannel}
      open={open}
      setOpen={setOpen}
      placeholder="Choose your room!"
      items={channelInfo}
      containerStyle={{
        margin:5,
        width:"80%",
        marginLeft:7
      }}
      style={{
        height:60,
        marginLeft:7,
        marginBottom:10,
        borderRadius:15,
        borderWidth:2,
        borderColor:"#c20027",
        rippleColor:"#c20027",
        underlayColor:"#c20027"
      }}
      
      ArrowDownIconComponent={({style}) => <List.Icon icon="chevron-down" style={style} />}
      ArrowUpIconComponent={({style}) => <List.Icon icon="chevron-up" style={style} />}
      tickIconStyle={{color:"#c20027"}}
      arrowIconStyle={{color:"#c20027"}}
      textStyle={{fontSize:20, color:"#c20027", fontWeight:"600"}}
      bottomOffset={100}

    />
    <TouchableOpacity style={styles.joinButton}
      onPress={handleJoinPress}>
      <Text style={styles.joinButtonText}>{buttonText}</Text>
    </TouchableOpacity>
    </View>

    {/*list containing all the channel info */}
    <ScrollView style={{zIndex:-5}}>
      {channelInfo.map((channel) => {
        return(
          <List.Accordion 
            title={channel.label}
            description="press to expand"
            descriptionStyle={styles.accordionHeaderDescription}
            style={styles.accordionHeader}
            titleStyle={styles.accordionHeaderText}
            left={props => <List.Icon {...props} icon="account-group" color='white' />}
            right={props => <List.Icon {...props}  icon="chevron-down" color='white'/>}
          >
          {/* display all the users inside the channel*/}
          {channel.users.length !==0 ? channel.users.map((user)=>{
            return(
              <List.Item title={user} 
              titleStyle={{fontSize:26, paddingBottom:10, fontWeight:"600", color: muteColor }}
              style={{marginHorizontal:20, height:65, borderBottomWidth:1, borderBottomColor:'#c20027'}} 
              left={props => 
                <Avatar.Text {...props} 
                  size={40} 
                  color='#f6e3ba' 
                  label={getInitials(userFullName)} 
                  />}
              />
            );
          }) : <List.Item title="There are no users in this channel" titleStyle={styles.noUsers} />
          }
          </List.Accordion>
        );
      })}
    </ScrollView>

    {/*----- USER CONTROLS GO HERE -----*/}
    <View style={styles.toolbarContainer}>
      <Button
        style={styles.toolbarButtonLeft}
        type="clear"
        icon={{
          type:"font-awesome",
          name: muteState,
          size: 35,
          color: "white"
        }}
        onPress={handleMutePress}
      />
      <Button
        style={styles.toolbarButtonRight}
        type="clear"
        icon={{
          type:"ionicon",
          name: soundState,
          size: 40,
          color: "white"
        }}
        onPress={handleSoundPress}
      />

    </View>
    
    
  
    </View>
    );
};






/* ----------------- STYLING ------------------- */
const styles = StyleSheet.create({
  joinButton:{
    flexDirection:'column',
    justifyContent:'center',
    width:50,
    marginLeft:10,
    marginTop:5
  },
  joinButtonText:{
    color:"#c20027",
    fontSize:16,
    fontWeight:"600",
    alignSelf:'center',
    paddingTop:20

  },
  text: {
    alignSelf:'center',
    marginTop: 50,
    fontSize: 30
  },
  channelContainer:{
    flex:1,
    marginLeft:20,
    
  },
  channelHeader: {
    borderRadius:30,
    marginBottom:15,
    height:60,
    flex:1,
    flexDirection:'row',
    backgroundColor:"#c20027",
  },
  channelHeaderText:{
    color:'white',
    fontWeight:"100",
    fontSize:24,
    paddingLeft:20,
    paddingTop:15
  },
  channelUser:{
    height:50,
    flexDirection:'row'
  },
  accordionHeader:{
    borderRadius:15, margin:10, backgroundColor:"#c20027",
    height:70
  },
  accordionHeaderText:{
    color:'white',
    fontSize:18,
    fontWeight:"600"
  },
  accordionHeaderDescription:{
    color:"#efe9d9"
  },
  userTitle:{
    fontSize:26,
    paddingBottom:10,
    fontWeight:"600",
    color: '#c20027',
  },
  noUsers:{
    fontSize:18,
    paddingRight:30,
    fontWeight:"600",
    color: '#c20027'
  },
  toolbarContainer:{
    flexDirection:'row',
    justifyContent:'space-between',
    height:60,
    borderTopWidth:0.5,
    borderColor:'white',
    backgroundColor:'#c20027',
  },
  toolbarButtonLeft:{
    alignSelf:'flex-start', 
    paddingTop:5,
    paddingLeft:15
  },
  toolbarButtonRight:{
    alignSelf:'flex-end', 
    marginBottom:5,
    paddingRight:15
  },
  icon:{
    color:'#c20027'
  }
});

export default ChatRoom;
