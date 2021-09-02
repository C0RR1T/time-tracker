import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import AppNavbar from "./AppNavbar";
import { BrowserRouter, Route } from "react-router-dom";
import Switch from "react-bootstrap/Switch";
import Login from "./login/Login";
import firebase from "firebase/compat";
import SignUp from "./login/SignUp";
import TimeTracker from "./mainsite/TimeTracker";
import ManageTasks from "./mainsite/ManageTasks";

if (firebase.apps.length === 0) {
    firebase.initializeApp({
        apiKey: "AIzaSyCvz1ymHe_2OFpKD2F8593e3ITKl7xN0y4",
        authDomain: "time-tracker-5411c.firebaseapp.com",
        projectId: "time-tracker-5411c",
        storageBucket: "time-tracker-5411c.appspot.com",
        messagingSenderId: "730497288216",
        appId: "1:730497288216:web:806280737d0aff0163db6d",
        measurementId: "G-EQ7X4W13CH",
    });
}

function App() {
    const [currentUser, setCurrentUser] = useState<firebase.User | null>();

    useEffect(() => {
        firebase
            .app()
            .auth()
            .onAuthStateChanged((user) => setCurrentUser(user));
    });
    return (
        <BrowserRouter>
            <Container fluid>
                <AppNavbar />
                {!currentUser ? (
                    <Switch>
                        <Route path={"/signup"} component={SignUp} />
                        <Route exact path={"/"} component={Login} />
                    </Switch>
                ) : (
                    <Switch>
                        <Route path={"/tasks"} component={ManageTasks} />
                        <Route exact path={"/"} component={TimeTracker} />
                    </Switch>
                )}
            </Container>
        </BrowserRouter>
    );
}

export default App;
