import firebase from "firebase";
import _ from "lodash";
import {renderApp, renderEvents, renderGuests} from "./render";

const login = (state) => {
    // Create the Google Sign-in provider and fire the pop-up
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
    .then(authResult => {
        // After auth, we initialize the database and get the user's specific data
        state.db = firebase.firestore();   
        renderApp(state, authResult);           
    })
    .catch(err => {
        console.error(err);
    });
}

const addGuest = (e, state) => {
    event.preventDefault();
    console.log("Add Guest");
    const firstNameField = document.getElementById("new-guest-first");
    const lastNameField = document.getElementById("new-guest-last");
    const emailField = document.getElementById("new-guest-email");
    state.db.collection(`users/${state.user.uid}/events/${state.selectedEvent}/guests`)
    .add({
        firstName: firstNameField.value,
        lastName: lastNameField.value,
        email: emailField.value,
        arrived: false
    })
    .then( () => {
        console.log(`Added ${emailField.value}`);
        firstNameField.value = "";
        lastNameField.value = "";
        emailField.value = "";
    });
}

const addEvent = (e, state) => {
    event.preventDefault();
    console.log("Add Event");
    const eventNameField = document.getElementById("new-event-name");
    const path = (`users/${state.user.uid}/events`);
    state.db.collection(path)
    .add({
        name: eventNameField.value
    })
    .then( () => {
        console.log(`Added ${eventNameField.value}`);
        eventNameField.value = "";
    });
}

const getUser = (state, user, callback) => {
    state.db.collection("users")
    .doc(user.uid)
    .set({
        email: user.email
    })
    .then( () => {
        state.db.collection("users")
        .doc(user.uid)
        .onSnapshot(snapshot => {
                let record = snapshot.data();
                record.uid = user.uid;
                callback(record);
            }
        )
    });
    
}

const getEvents = (state, callback) => {
    const id = state.user.uid;
    const path = (`users/${id}/events`)
    state.db.collection(path)
    .onSnapshot(snapshot => {
        let events = {};
        snapshot.forEach(record => {
            events[record.id] = record.data();
        });
        return callback(events);
    });
}

const selectEvent = (state, id) => {
    state.selectedEvent = id;
    getGuests(state, id, guests => {
        state.guests = guests;
        renderGuests(state);
    });
}

const getGuests = (state, eventId, callback) => {
    const path = `users/${state.user.uid}/events/${eventId}/guests`;
    state.db.collection(path)
    .onSnapshot(snapshot => {
        let guests = {};
        if(snapshot.empty) { 
            console.log("EMPTY GUESTLIST");
            return callback(guests); 
        }
        snapshot.forEach(record => {
            guests[record.id] = record.data();
            return callback(guests);
        });
    });
}

const checkIn = (state, guest, id) => {
    const path = `users/${state.user.uid}/events/${state.selectedEvent}/guests`;
    state.db.collection(path)
    .doc(id)
    .set({
        arrived: !guest.arrived
    }, {merge: true});
}


    
export {
    login,
    getUser,
    getEvents,
    selectEvent,
    getGuests,
    addGuest,
    addEvent,
    checkIn
}