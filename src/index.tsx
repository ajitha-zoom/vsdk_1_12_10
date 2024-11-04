/* eslint-disable no-restricted-globals */
import React from 'react';
import { createRoot } from 'react-dom/client';
import ZoomVideo from '@zoom/videosdk';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ZoomContext from './context/zoom-context';
import { devConfig } from './config/dev';
import { b64DecodeUnicode, generateVideoToken } from './utils/util';

let meetingArgs: any = Object.fromEntries(new URLSearchParams(location.search));
// Add enforceGalleryView to turn on the gallery view without SharedAddayBuffer
if (!meetingArgs.sdkKey || !meetingArgs.topic || !meetingArgs.name || !meetingArgs.signature) {
  meetingArgs = { ...devConfig, ...meetingArgs };
  meetingArgs.enforceGalleryView = !window?.crossOriginIsolated;
}

if (meetingArgs.web && meetingArgs.web !== '0') {
  ['topic', 'name', 'password', 'sessionKey', 'userIdentity'].forEach((field) => {
    if (Object.hasOwn(meetingArgs, field)) {
      try {
        meetingArgs[field] = b64DecodeUnicode(meetingArgs[field]);
      } catch (e) {
        console.log('ingore base64 decode', field, meetingArgs[field]);
      }
    }
  });
  if (meetingArgs.role) {
    meetingArgs.role = parseInt(meetingArgs.role, 10);
  } else {
    meetingArgs.role = 1;
  }
}
// enforce use <video> tag render video, https://marketplacefront.zoom.us/sdk/custom/web/modules/Stream.html#attachVideo
meetingArgs.useVideoPlayer = 1;

['enforceGalleryView', 'enforceVB', 'cloud_recording_option', 'cloud_recording_election'].forEach((field) => {
  if (Object.hasOwn(meetingArgs, field)) {
    try {
      meetingArgs[field] = Number(meetingArgs[field]);
    } catch (e) {
      meetingArgs[field] = 0;
    }
  }
});
if (meetingArgs?.telemetry_tracking_id) {
  try {
    meetingArgs.telemetry_tracking_id = b64DecodeUnicode(meetingArgs.telemetry_tracking_id);
  } catch (e) {}
} else {
  meetingArgs.telemetry_tracking_id = '';
}

/* if (!meetingArgs.signature && meetingArgs.sdkSecret && meetingArgs.topic) {
  meetingArgs.signature = generateVideoToken(
    meetingArgs.sdkKey,
    meetingArgs.sdkSecret,
    meetingArgs.topic,
    meetingArgs.password,
    meetingArgs.sessionKey,
    meetingArgs.userIdentity,
    Number(meetingArgs.role ?? 1),
    meetingArgs.cloud_recording_option,
    meetingArgs.cloud_recording_election,
    meetingArgs.telemetry_tracking_id
  );*/
let namefromPrompt = null;
let sessionName = null;
let password = null;

while (namefromPrompt == null || namefromPrompt == '') {
  namefromPrompt = prompt('Enter your name', '');
}
console.log(namefromPrompt);
meetingArgs.name = namefromPrompt;

while (sessionName == null || sessionName == '') {
  sessionName = prompt('Enter session name', '');
}
console.log(sessionName);
meetingArgs.sessionKey = sessionName;
meetingArgs.topic = sessionName;

while (password == null || password == '') {
  password = prompt('Enter password', '');
}
meetingArgs.password = password;
//fetch('https://or116ttpz8.execute-api.us-west-1.amazonaws.com/default/videosdk', {
fetch('https://bgctn3ueuc.execute-api.us-east-1.amazonaws.com/testing', {
  //fetch(`/api/`, {
  method: 'POST',
  headers: {
            'Content-Type':'application/json',
            'Accept':'application/json'
        },
  body: JSON.stringify({
    sessionName: meetingArgs.topic,
    role: meetingArgs.role,
    userIdentity: meetingArgs.name,
    sessionKey: meetingArgs.sessionKey,
    geoRegions: 'US,AU,CA,IN,CN,BR,MX,HK,SG,JP,DE,NL',
    pwd: meetingArgs.password,
    cloudRecordingOption: 1,
    cloudRecordingElection: 0
  })
})
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    console.log('ajtha signature');
    console.log(data.signature);
    meetingArgs.signature = data.signature;
    const zmClient = ZoomVideo.createClient();
const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ZoomContext.Provider value={zmClient}>
      <App meetingArgs={meetingArgs as any} />
    </ZoomContext.Provider>
  </React.StrictMode>
);

  })
  .catch((error) => {
    console.log(error);
  });

  console.log('=====================================');
  console.log('meetingArgs', meetingArgs);

  const urlArgs: any = {
    topic: meetingArgs.topic,
    name: meetingArgs.name,
    password: meetingArgs.password,
    sessionKey: meetingArgs.sessionKey,
    userIdentity: meetingArgs.userIdentity,
    role: meetingArgs.role || 1,
    cloud_recording_option: meetingArgs.cloud_recording_option || '',
    cloud_recording_election: meetingArgs.cloud_recording_election || '',
    telemetry_tracking_id: meetingArgs.telemetry_tracking_id || '',
    enforceGalleryView: 0,
    enforceVB: 0,
    web: '1'
  };
  console.log('use url args');
  console.log(window.location.origin + '/?' + new URLSearchParams(urlArgs).toString());


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
