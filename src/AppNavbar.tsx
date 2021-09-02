import React, { useEffect, useState } from "react";
import { Button, Nav, Navbar } from "react-bootstrap";
import firebase from "firebase/compat";
import { useHistory, Link } from "react-router-dom";

const AppNavbar = () => {
    const [user, setUser] = useState<firebase.User | null>();
    const history = useHistory();

    useEffect(() => {
        firebase.app().auth().onAuthStateChanged(setUser);
    }, []);

    return (
        <Navbar expand={"lg"}>
            <Navbar.Brand>Time Tracker</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse>
                <Nav className={"me-auto"}>
                    {user ? (
                        <>
                            <Nav.Link>
                                <Link to={"/"} style={{ textDecoration: "none" }} className={"nav-link"}>
                                    Zeit tracken
                                </Link>
                            </Nav.Link>
                            <Nav.Link>
                                <Link to={"/tasks"} className={"nav-link"}>
                                    Aktivitäten bearbeiten
                                </Link>
                            </Nav.Link>
                            <Nav.Link>Statistiken</Nav.Link>
                            <Nav.Link>Account</Nav.Link>
                        </>
                    ) : (
                        <>
                            <Nav.Link>Login</Nav.Link>
                        </>
                    )}
                </Nav>
                <Nav>
                    {user && (
                        <Nav.Link>
                            <Button
                                variant={"outline-primary"}
                                onClick={() =>
                                    firebase
                                        .app()
                                        .auth()
                                        .signOut()
                                        .then(() => history && history.push("/"))
                                }
                            >
                                Ausloggen
                            </Button>
                        </Nav.Link>
                    )}
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default AppNavbar;
