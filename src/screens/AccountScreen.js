import React from "react";
import { Text, StyleSheet,View, Button } from "react-native";
//import {AmplifySignOut} from 'aws-amplify-react-native';
import { Auth, userHasAuthenticated } from 'aws-amplify';



const AccountScreen = () => {
  async function signOut() {
    try {
        await Auth.signOut();
    } catch (error) {
        console.log('error signing out: ', error);
    }
}
  return (
  <View>
  <Text style={styles.text}>AccountScreen</Text>
  <Button
    title="Sign out"
    onPress={signOut}/>
  </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 30
  }
});

export default AccountScreen;
