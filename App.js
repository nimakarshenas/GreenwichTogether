import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from './src/screens/HomeScreen';
import ChatRoom from './src/screens/ChatRoom';
import ContactScreen from './src/screens/ContactScreen';
import AccountScreen from './src/screens/AccountScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { withAuthenticator } from 'aws-amplify-react-native';

import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#c20027',
    accent:'white',
    scale:5
  },
};

const AuthTheme = {
  button: { 
    backgroundColor:"#c20027",
    alignItems: 'center',
		padding: 16,
  },
  sectionHeaderText: {
    color:"#c20027",
    fontSize: 20,
		fontWeight: '500',
  },
  input:{
    padding: 16,
		borderWidth: 1,
		borderRadius: 3,
    borderColor: "#c20027",
    color:"#c20027"
  },
  phoneInput:{
    flex: 2,
		padding: 16,
		borderWidth: 1,
		borderRadius: 3,
    borderColor:"#c20027",
    color:"#c20027"
  },
  sectionFooterLink:{
    fontSize: 14,
    color:"#c20027",
    alignItems: 'baseline',
		textAlign: 'center',
  }
}

function MyTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBarOptions={{
        activeTintColor: '#c20027',
        inactiveTintColor: '#ff99ad'
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatRoom}
        options={{
          tabBarLabel: 'Chat Room',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          tabBarLabel: 'Message us',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message" color={color} size={size} />
          ),
        }}
      />
      {/*<Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: 'My Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />*/}
    </Tab.Navigator>
  );
}

const App = function(){
  return (
    
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <MyTabs />
      </PaperProvider>
    </NavigationContainer>
  );
};

export default withAuthenticator(App, {
  signUpConfig: {
    signUpFields: [
      { label: "First Name", key: "name", required: true, type: "string" },
      { label: "Family Name", key: "family_name", required: true, type: "string" },
    ]
  }
});