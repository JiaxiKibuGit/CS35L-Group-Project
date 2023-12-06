
import React, {useState, useEffect} from 'react';
import {initializeApp} from 'firebase/app';
import {getDatabase, ref, get, set, push, limitToLast} from 'firebase/database';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';




//firebase config
export const firebaseConfig = {
  apiKey: "AIzaSyATM-7r3rmpU6WOOPSpy1XU-db0Cj-nAW4",
  authDomain: "ucladance-c16e6.firebaseapp.com",
  projectId: "ucladance-c16e6",
  storageBucket: "ucladance-c16e6.appspot.com",
  messagingSenderId: "23121829941",
  appId: "1:23121829941:web:a54c810e7e2c26763e517c",
  measurementId: "G-58SW1QF39G",
};
//initialize firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase();

/* AUTHORIZATON HANDLERS */

//Google Auth
export async function signIn() {
  const googleProvider = new GoogleAuthProvider();
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;

    // Check if user exists in the database, if not create a new user profile
    const userRef = ref(db, 'users/' + user.uid);
    get(userRef).then((snapshot) => {
      if (!snapshot.exists()) {
        set(userRef, {
          email: user.email,
          'events followed': {},
          'orgs followed': {}
        });
      }
    });

    window.location.replace("/profile");
  } catch (error) {
    console.error("Error during sign in: ", error);
    // Handle errors here, such as displaying a message to the user
  }
}

//go to signin if not logged in, go to profile
export function PLHandler() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      window.location.replace("/profile");
    } else {
      signIn();
    }
  });
}

//CHECK FOR AUTH TO USE HOSTING EVENT PAGE
export function CheckIfAuth() {
  auth.onAuthStateChanged((user) => {
    if (user) {
    } else {
      window.location.replace("/NLI");
    }
  });
}

//USER INFORMATON MODIFIER
export function useGetName() {
  const [currentName, setCurrentName] = useState("");

  useEffect(() => {
    const x = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentName(user.displayName);
      } else {
        setCurrentName("Sign In");
      }
    });
    return () => x();
  }, []);

  return currentName;
}
export function useGetEmail() {
  const [currentEmail, setCurrentEmail] = useState("");

  useEffect(() => {
    const x = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentEmail(user.email);
      } else {
        setCurrentEmail("Sign In");
      }
    });
    return () => x();
  }, []);

  return currentEmail;
}

export function useGetPFP() {
  const [currentPFP, setCurrentPFP] = useState("");

  useEffect(() => {
    const x = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentPFP(user.photoURL);
      } else {
        setCurrentPFP("Sign In");
      }
    });
    return () => x();
  }, []);

  return currentPFP;
}

/* TEAM DATABASE READ FUNCTIONS */

//1=NAME, 2=DESCRIPTION, 3=PHOTO, 4=VIDEO, 5=MEMBERS
export async function GetTeamInfo(teamid, choice) {
    let teamName = [];
    const dbRef = ref(db, '/teams/' + teamid+'/');
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            switch (choice) {
                case 1:
                    teamName.push(snapshot.val()["team_name"]);
                    break;
                case 2:
                    teamName.push(snapshot.val()["about_me"]);
                    break;
                case 3:
                    teamName.push(snapshot.val()["key_image"]);
                    break;
                case 4:
                    teamName.push(snapshot.val()["vidlink"]);
                    break;
                case 5:
                    teamName.push(snapshot.val()["memberlist"]);
                    break;
                default:
                    teamName = "error";
            }
        } else {
            console.log("Team not found");
            return null; // or throw an error as per your error handling strategy
        }
    } catch (error) {
        console.error('Error fetching team: ', error);
        throw error; // Re-throw the error for handling in the calling component
    }

    return teamName;
}



// GET SEARCH LIST FOR TEAMS
export async function GetSearchList() {
  const dbRef = ref(db, "/teams/");
  let team_and_members = [];

  try {
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
      let teamData = snapshot.val();
      for (let i = 1; i < Object.keys(teamData).length + 1; i++) {
        const name = teamData[i]["team_name"];
        const team = i;
        team_and_members.unshift({ name, team }); // add team:teamid

        let members = teamData[i]["memberlist"];
        for (const name in members) {
          const team = members[name];
          team_and_members.push({ name, team }); // add member:teamid
        }
      }
    } else {
      console.log("No data found at /teams/");
    }
  } catch (error) {
    console.error("Error fetching team data:", error);
  }
  return team_and_members;
}


//CREATE EVENT
export function createEvent(eventData) {
  const eventsRef = ref(db, "events");
  return push(eventsRef, eventData)
    .then((response) => {
      console.log("Event created successfully.");
      return response; // Return the response which contains the reference to the new event
    })
    .catch((error) => {
      console.error("Error creating event: ", error);
      throw error;
    });
}

//GET EVENT
export async function getEvent(eventId) {
  const db = getDatabase();
  const eventRef = ref(db, `events/${eventId}`);

  try {
    const snapshot = await get(eventRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("Event not found");
      return null; // or throw an error as per your error handling strategy
    }
  } catch (error) {
    console.error("Error fetching event: ", error);
    throw error; // Re-throw the error for handling in the calling component
  }
}

//GET LIST OF EVENTS
export async function GetEventList() {
    const dbRef = ref(db, '/events/');
    let eventInfo = [];
  
    try {
      const snapshot = await get(dbRef);
  
      if (snapshot.exists()) {
        let eventData = snapshot.val()
        for (const i in eventData) {
          const name = eventData[i]["name"];
          const location = eventData[i]["location"];
          const time = eventData[i]["startTime"];
          const date = eventData[i]["startDate"]
          const org = eventData[i]["organization"]
          const unix = eventData[i]["startUnixDate"]
          const description = eventData[i]["description"]
          eventInfo.push({name, location, date, time, org, unix, description}); // add team:teamid
  
          let members = eventData[i]["memberlist"];
          for (const name in members) {
            const team = members[name];
            eventInfo.push({ name, team }); // add member:teamid
          }
        }
  
      } else {
        console.log('No data found at /teams/');
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
    return eventInfo;
}
