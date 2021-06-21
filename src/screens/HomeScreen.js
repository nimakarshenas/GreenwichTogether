import React, { useState, useEffect} from "react";
import { Text, StyleSheet, View, FlatList, Image, TouchableOpacity, Modal, Pressable, ScrollView } from "react-native";
import {API, graphqlOperation } from 'aws-amplify';
import { Auth } from 'aws-amplify';
import  {blogsByDate } from '../graphql/queries';
import '@aws-amplify/pubsub';





const HomeScreen = () => {


    //state for storing result of api pull request for list of blog objects
    const [blogs, setBlogs] = useState([]); 
    //state for controlling whether Modal JSX element is visible
    const [modalVisible, setModalVisible] = useState(false); 
    //when item in List is pressed, this state points to the Blog object that has been pressed
    const [currentmodal, setCurrentmodal] = useState([]);
    
    /*async function signOut() {
        try {
            await Auth.signOut();
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }*/

    //get request from api and sort by date - Note: This will run only when the page opens
    useEffect(() => {
        API
          .graphql(graphqlOperation(blogsByDate, {
            area:"GreenwichWest", //the area can be changed to be a user chosen variable if app is extended to more regions
            sortDirection: 'DESC' 
          }))
          .then((response) => {
            const items = response?.data?.blogsByDate?.items; 
            if (items) {
              setBlogs(items);  //update state holding the array of BlogNew objects
            }
          })
      }, []);



    // ------------- RENDERING GOES HERE ----------------------
    
    return(

    <View style={styles.mainContainer}>
        {/* MODAL setup --- when modalVisible is set to TRUE, whatever is embedded in 
        the Modal JSX element is rendered on top of all other elements, acts as a pop-up */}
        <View style={styles.modalWrap}>
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            }}>
            <View  style={styles.modalView}>
                <ScrollView style={{borderBottomWidth:0.5, borderColor:"#c20027"}}>
                    {/* Image at the top of the page */}
                    <Image
                        style={{ height:200, width:'100%', borderRadius:5,padding:5, borderWidth:2, borderColor:"#980e0e"}}
                        source={{uri: currentmodal.image}}>
                    
                    </Image>
                    <View style={{borderBottomWidth:0.5, borderColor:"#c20027", marginBottom:5}}>
                        <Text style={styles.titleModal}>{currentmodal.title}</Text>
                    </View>
                    <Text style={styles.descriptionModal}>{currentmodal.description}</Text>
                    <Text style={styles.contentModal}>{currentmodal.content}</Text>
                </ScrollView>
                {/* Close Button */}
                <Pressable
                    style={styles.button}
                    onPress={()=>{setModalVisible(!modalVisible)}}>
                    <Text style={{color:"#c20027", fontWeight:"bold"}}>Close</Text>
                </Pressable>
            </View>
            
            
        </Modal> 
        </View>

        {/* This is what can be seen when the page first opens -- MODAL NOT OPEN */}
        <View style={styles.mainContainer}>
            {/* -------- HEADER ------------*/}
            <View style={{borderBottomWidth:0.5, borderColor:"#c20027"}}>
            <Image 
            source={{uri:"https://www.london-works.com/sites/default/files/supporter-logos/royal-borough-greenwich.png"}}
            style={{height:120, width:160, alignSelf:"center", paddingTop:-100}}>

            </Image>
            </View>

            {/* List of Tiles*/}
            <FlatList data={blogs}
                keyExtractor={(blog)=> blog.id}
                renderItem = {({item}) => {
                    return(
                        
                        <View style={styles.centeredView}>
                        <View style={{marginTop:10, marginLeft:20, flexDirection:'row'}}>
                            <Text style={{ fontWeight:"600", fontSize:18, color:"#c20027"}}
                            >{item.date}</Text>
                            <View style={{borderBottomWidth:1, borderColor:"#c20027", flex:1, marginRight:10, marginBottom:8, marginLeft:5}}></View>
                        </View>
                        <TouchableOpacity style={styles.tileContainer}
                            onPress={() => {setCurrentmodal(item);
                            setModalVisible(!modalVisible)}}>
                            <View style={{borderBottomWidth:0.5, borderColor:'white'}}>
                            <Text style={styles.title}>{item.title}</Text>
                            </View>
                            <View style={{flexDirection:'row', marginTop:12}}>
                            <View style={styles.textInTileContainer}>
                                <Text style={styles.description}>{item.description}</Text>
                            </View>
                            <View style={styles.imageInTileContainer}>
                                <Image
                                    style={{flex:1, borderRadius:5}}
                                    source={{uri: item.image}}>
                                    
                                </Image>
                            </View>
                            </View>
                            
                        </TouchableOpacity>
                        </View>
                    );
                }
            }/> 
        </View>
        {/* CAN ADD A SIGN OUT BUTTON IF NEEDED*/}
        {/*<Button
            title="Sign out"
            onPress={signOut}
        />*/}
    </View>
    );
};


//--------------- STYLING GOES HERE ------------------
const styles = StyleSheet.create({
    modalView: {
        flex:1,
        overflow: 'scroll',
        marginVertical:100,
        marginHorizontal:20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 10,
        borderColor:"#c20027",
        borderWidth:5,
        alignContent:'stretch',
    },
    modalWrap:{
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 15,
    },
    mainContainer:{
        flex:1,
        paddingTop:15,
        backgroundColor: 'white',

    },
    tileContainer:{
        backgroundColor: '#c20027',
        borderRadius: 15,
        margin:15,
        paddingVertical:15,
        paddingHorizontal:15,
        shadowOpacity:0.5,
        shadowRadius:5,
    },
    textInTileContainer:{
        flex:2,
        marginRight:10,
    },
    imageInTileContainer:{
        flex:1,
        marginLeft:5,
        shadowOpacity:0.5, shadowRadius:5,
        borderRadius:5,
        marginTop:5
    },
    title:{
        fontSize:24,
        fontWeight:'bold',
        color:'white',
        paddingBottom:5,
    },
    description:{
        paddingTop:5,
        fontSize:16,
        fontWeight:'bold',
        color:'white'
    },
    titleModal:{
        marginTop:15,
        paddingBottom:10,
        fontSize:28,
        fontWeight:'bold',    
    },
    descriptionModal:{
        paddingTop:10,
        fontSize:18,
        fontWeight:'bold', 
    },
    contentModal:{
        paddingTop:10,

        fontSize:16, 
    },
    button: {
        marginTop:10,
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        alignSelf:'center'
    },
})

export default HomeScreen;
