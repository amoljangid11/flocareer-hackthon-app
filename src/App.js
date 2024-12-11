import React, { useEffect, useState } from "react";

const App = () => {
  const [issuesDetected, setIssuesDetected] = useState([]);

  // Detect external screens
  const detectExternalScreens = () => {
    if (navigator?.mediaDevices?.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia({ video: true })
        .then(stream => {
          const videoTrack = stream.getVideoTracks()[0];
          const settings = videoTrack.getSettings();
          if (settings.width && settings.height && (settings.width > window.screen.width || settings.height > window.screen.height)) {
            addIssue("External screen detected.");
          }
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => console.error("Screen sharing permissions not granted.", err));
    } else {
      console.warn("getDisplayMedia API is not supported in this browser.");
    }
  };

  // Detect multiple input devices (keyboard and mouse)
  const detectMultipleInputDevices = () => {
    navigator.permissions.query({ name: "hid" }).then(result => {
      if (result.state === "granted" || result.state === "prompt") {
        navigator.hid.getDevices().then(devices => {
          if (devices.length > 2) { // Assuming 1 keyboard and 1 mouse is normal
            addIssue("Multiple input devices detected.");
          }
        });
      } else {
        console.warn("Permission to access HID devices is not granted.");
      }
    });
  };

  // Detect remote desktop applications
  const detectRemoteDesktopApps = () => {
    // Use the Clipboard API to detect shared clipboard as an indicator of remote desktop software
    navigator.permissions.query({ name: "clipboard-read" }).then(result => {
      if (result.state === "granted" || result.state === "prompt") {
        navigator.clipboard.readText().then(text => {
          if (text.includes("remote-desktop") || text.includes("teamviewer") || text.includes("anydesk")) {
            addIssue("Remote desktop service detected.");
          }
        });
      } else {
        console.warn("Clipboard permissions not granted.");
      }
    });
  };

  // Add an issue to the list of detected issues
  const addIssue = (issue) => {
    setIssuesDetected(prevIssues => [...new Set([...prevIssues, issue])]);
  };

  useEffect(() => {
    detectExternalScreens();
    detectMultipleInputDevices();
    detectRemoteDesktopApps();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>System Monitoring</h1>
      {issuesDetected.length > 0 ? (
        <div style={{ backgroundColor: "#ffcccc", padding: "10px", border: "1px solid red" }}>
          <h2>Issues Detected:</h2>
          <ul>
            {issuesDetected.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{ backgroundColor: "#ccffcc", padding: "10px", border: "1px solid green" }}>
          <h2>No issues detected.</h2>
        </div>
      )}
    </div>
  );
};

export default App;