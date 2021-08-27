import React, {useEffect, useState} from 'react';
import {Button, Nav, Navbar} from "react-bootstrap";
import User from "./User";
import firebase from "firebase/compat";


const AppNavbar = () => {
    const [user, setUser] = useState<User | null>();

    useEffect(() => {
        firebase.app().auth().onAuthStateChanged(user => {
            firebase.app().firestore().collection('users').doc(user?.uid).onSnapshot(snapshot => {
                if (snapshot.data())
                    setUser(snapshot.data() as User)
            })
        })
    }, [])

    return (
        <Navbar expand={'lg'}>
            <Navbar.Brand>Time Tracker</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
            <Navbar.Collapse>
                <Nav className={'me-auto'}>
                    {
                        user && <>
                            <Nav.Link>Zeit tracken</Nav.Link>
                            <Nav.Link>Aktivitäten bearbeiten</Nav.Link>
                            <Nav.Link>Statistiken</Nav.Link>
                            <Nav.Link>Account</Nav.Link>
                        </>
                    }
                    {
                        !user && <>
                            <Nav.Link>Login</Nav.Link>
                        </>
                    }
                </Nav>
                <Nav>
                    {
                        user && <Nav.Link><Button variant={'outline-primary'}>Ausloggen</Button></Nav.Link>
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default AppNavbar;