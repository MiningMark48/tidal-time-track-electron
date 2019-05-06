const {ipcRenderer, remote} = require('electron');
const jquery = require('jquery');
// const firebase = require('firebase');

const firebaseconfig = require('./firebaseconfig');
const csshandler = require('./util/csshandler');
const snackbarhandler = require('./util/snackbarhandler');

const snackbar = document.querySelector('#snackbar');
const emailField = document.querySelector('#email');
const passwordField = document.querySelector('#password');
const signInButton = document.querySelector('#btnSignIn');
const resetPasswordButton = document.querySelector('#btnResetPW');

var preferences = ipcRenderer.sendSync('getPreferences');

var version;
var snackbarTime = 3;

function doLoad() {
  // Initialize Firebase
  firebase.initializeApp(firebaseconfig.getFirebaseConfig());
  console.log("LOADED");
}

function getPrefs() {
  preferences = ipcRenderer.sendSync('getPreferences');
}

function updatePrefs() {
  changeCSS();
  console.log('Preferences were updated.');
}

function changeCSS() {
  let prefStyles = preferences["styles"];
  let useCustom = (prefStyles["theme"] === 'custom');

  if(!useCustom) csshandler.changeCSS(prefStyles["theme"]);

  csshandler.setCustomStyle('bg', document.body, prefStyles["styles_color_background"], useCustom);
  csshandler.setCustomStyle('fc', document.body, prefStyles["styles_color_font"], useCustom);

}

signInButton.addEventListener('click', function() {
  firebase.auth().signInWithEmailAndPassword(emailField.value, passwordField.value).then(function() {
    // remote.getCurrentWindow().close();
    remote.getCurrentWindow().loadFile('./src/index.html');
    // snackbarhandler.show("Success", snackbarTime);
  }).catch(function(error) {
    if (error != null) {
      snackbarhandler.show("Invalid email/password", snackbarTime);
      console.log(error.message);
      return;
    }
  })
});

resetPasswordButton.addEventListener('click', function() {
  firebase.auth().sendPasswordResetEmail(emailField.value).then(function() {
    snackbarhandler.show("Password reset successfully sent to " + emailField.value, snackbarTime);
  }).catch(function(error) {
    if (error != null) {
      snackbarhandler.show("Invalid email", snackbarTime);
      console.log(error.message);
      return;
    }
  })
});

// IPC Messages
ipcRenderer.on('do-initial-load', (event) => {
  changeCSS();
  doLoad();
});

ipcRenderer.on('preferencesUpdated', (event, preferences) => {
    getPrefs();
    console.log('Preferences were reloaded.');
    updatePrefs();
});
