import React from "react";
import { Button, Col, Container, Form, FormControl, FormGroup, FormLabel, ModalTitle, Row } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import firebase from "firebase/compat";
import { useHistory } from "react-router-dom";

const validationSchema = Yup.object().shape({
    email: Yup.string().required("Das Email Feld darf nicht leer sein").email(),
    password: Yup.string()
        .required("Das Passwort Feld darf nicht leer sein")
        .min(6, "Das Passwort muss mindestens 6 Zeichen enthalten"),
    confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Die Passwörter stimmen nicht überein"),
});

const SignUp = () => {
    const history = useHistory();

    const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
        const { user } = await firebase.app().auth().createUserWithEmailAndPassword(email, password);
        if (user) {
            await firebase.firestore().collection("users").doc(user.uid).set({
                activities: [],
                tasks: [],
                fastTasks: [],
            });
            firebase
                .app()
                .auth()
                .signInWithEmailAndPassword(email, password)
                .then(() => history.push(""));
        }
    };

    const formik = useFormik({
        initialValues: {
            password: "",
            confirmPassword: "",
            email: "",
        },
        validateOnBlur: false,
        validateOnChange: true,
        validationSchema,
        onSubmit: handleSubmit,
    });

    return (
        <Container>
            <ModalTitle>Konto erstellen</ModalTitle>
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                    formik.handleSubmit(e);
                }}
            >
                <Row>
                    <FormGroup>
                        <FormLabel>Email Adresse</FormLabel>
                        <FormControl
                            type={"email"}
                            name={"email"}
                            placeholder={"Email Adresse"}
                            onChange={formik.handleChange}
                        />
                    </FormGroup>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <FormLabel>Passwort</FormLabel>
                            <FormControl
                                type={"password"}
                                name={"password"}
                                placeholder={"Passwort"}
                                onChange={formik.handleChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <FormLabel>Passwort bestätigen</FormLabel>
                            <FormControl
                                type={"password"}
                                name={"confirmPassword"}
                                placeholder={"Passwort bestätigen"}
                                onChange={formik.handleChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <br />
                <Button type={"submit"}>Konto erstellen</Button>
            </Form>
        </Container>
    );
};

export default SignUp;
