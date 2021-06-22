# GreenwichTogether
Greenwich Together - a community app:

In order to run this App on your machine, please follow the following installation instructions.

## 1. Install Git Bash

https://git-scm.com/downloads
Make sure to download the correct file for your machine.

## 2. Install Node.js

https://nodejs.org/en/download/

## 3. Install npm
Go to the root of the project and put the following command into the console:
```
npm install
```
## 4. Install expo cli
Go back to the root of your project and put the following command into the console:
```
npm install expo-cli --global
```
## 5. Install the Amazon Amplify dependencies
A detailed guide on starting on an existing project can be found on the following url:<br />
https://aws.amazon.com/blogs/mobile/amplify-cli-adds-scaffolding-support-for-amplify-apps-and-authoring-plugins/ <br />
However, I will give a brief overview on the process:
```
npm install -g @aws-amplify/cli
```
Then:
```
amplify configure
```
The console will prompt you to provide your administrator access key and secret access key, ask an already setup admin to provide you with these keys.
Finally, we put:
```
amplify init
```
There is no other required setup, the amplify files have already been configured.

## 6. Install Agora.io dependencies
Follow the following guide:<br />
https://www.npmjs.com/package/react-native-agora

## 7. Start the app:
```
npm start
```
