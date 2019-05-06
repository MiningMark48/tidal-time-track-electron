const {ipcRenderer, remote} = require('electron');
const jquery = require('jquery');
const keytar = require('keytar');
const log = require('electron-log');
const storage = require('electron-json-storage');

const firebaseconfig = require('./firebaseconfig');
const csshandler = require('./util/csshandler');
const snackbarhandler = require('./util/snackbarhandler');

const snackbar = document.querySelector('#snackbar');
const emailField = document.querySelector('#email');
const passwordField = document.querySelector('#password');
const rememberBox = document.querySelector('#remember');
const signInButton = document.querySelector('#btnSignIn');
const resetPasswordButton = document.querySelector('#btnResetPW');

var preferences = ipcRenderer.sendSync('getPreferences');

var version;
var snackbarTime = 3;
var keytarService = "tidaltimetrack";

function doLoad() {
  // Initialize Firebase
  firebase.initializeApp(firebaseconfig.getFirebaseConfig());

  keytar.findCredentials(keytarService).then((result) => {
    let keytarCreds = result.length;
    if (keytarCreds > 0) {
      storage.get('sessionInfo', function(error, data) {
        if (error) throw error;
        emailField.value = JSON.parse(data)["email"];;
        keytar.getPassword(keytarService, emailField.value).then((result) => {
          passwordField.value = result;
        });
      });
    }
  });
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
    if (rememberBox.checked) {
      if (emailField.value && passwordField.value) {
        keytar.setPassword(keytarService, emailField.value, passwordField.value);
        let session = {
          email: emailField.value
        }
        storage.set('sessionInfo', JSON.stringify(session), function(error) {
          if (error) throw error;
        });
      }
    } else {
      keytar.deletePassword(keytarService, emailField.value);
    }

    remote.getCurrentWindow().loadFile('./src/index.html');
    log.info("%cSign in successful.", 'color: green');

    // snackbarhandler.show("Success", snackbarTime);
    // log.info("Checkbox: " + rememberBox.checked);
  }).catch(function(error) {
    if (error != null) {
      snackbarhandler.show("Invalid email/password", snackbarTime);
      log.error(error.message);
      return;
    }
  })
});

resetPasswordButton.addEventListener('click', function() {
  firebase.auth().sendPasswordResetEmail(emailField.value).then(function() {
    snackbarhandler.show("Password reset successfully sent to " + emailField.value, snackbarTime);
    log.info("%cPassword reset email sent.", 'color: blue');
  }).catch(function(error) {
    if (error != null) {
      snackbarhandler.show("Invalid email", snackbarTime);
      log.error(error.message);
      return;
    }
  })
});

emailField.addEventListener('keyup', function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    signInButton.click();
  }
});

passwordField.addEventListener('keyup', function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    signInButton.click();
  }
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
