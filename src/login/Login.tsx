import React, {useState} from 'react';
import {Alert, Button, Container, Form, FormControl, FormGroup, FormLabel, ModalTitle, Row} from "react-bootstrap";
import {useFormik} from "formik";
import * as Yup from 'yup';
import firebase from "firebase/compat";
import {useHistory} from "react-router-dom";

const validationScheme = Yup.object().shape({
    email: Yup.string()
        .email('Die E-Mail muss gültig sein')
        .required('Das E-Mail Feld darf nicht leer sein'),
    password: Yup.string()
})

const Login = () => {
    const history = useHistory();

    const onSubmit = ({email, password}: { email: string, password: string }) => {
        firebase.app().auth().signInWithEmailAndPassword(email, password).then(() => history.push('/')).catch(errorHandling)
    }
    const [error, setError] = useState({
        email: '',
        password: ''
    }); 

    const formik = useFormik({
        validateOnChange: false,
        validateOnBlur: true,
        validationSchema: validationScheme,
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit
    })

    const errorHandling = (err: any) => {
        console.log(err.code)
        switch (err.code) {
            case 'auth/invalid-email':
                setError({
                    ...error,
                    email: 'Die eingegebene Email ist nicht valid'
                });
                break;
            case 'auth/user-not-found':
                setError({
                    ...error,
                    email: 'Dieses Konto existiert nicht'
                })
                break;
            case 'auth/wrong-password':
                setError({
                    ...error,
                    password: 'Das eingegebene Passwort ist nicht korrekt'
                })

        }
    }
    return (
        <Container>
            <ModalTitle>Login</ModalTitle>
            <br/>
            <Form onSubmit={(e) => {
                e.preventDefault();
                formik.handleSubmit();
            }}>
                <Row>
                    <FormGroup>
                        <FormLabel>E-Mail Adresse</FormLabel>
                        <FormControl type={'email'} name={'email'} isInvalid={!!formik.errors.email || !!error.email}
                                     placeholder={'Email Adresse'} onChange={formik.handleChange}/>
                        <Alert variant={'danger'} show={!!formik.errors.email || !!error.email}>{formik.errors.email || error.email}</Alert>
                    </FormGroup>
                </Row>
                <Row>
                    <FormGroup>
                        <FormLabel>Passwort</FormLabel>
                        <FormControl type={'password'} name={'password'} isInvalid={!!formik.errors.password || !!error.password}
                                     placeholder={'Passwort'} onChange={formik.handleChange}/>
                        <Alert variant={'danger'} show={!!formik.errors.password || !!error.password}>{formik.errors.password || error.password}</Alert>
                    </FormGroup>
                </Row>
                <br/>
                <Button type={'submit'}>Einloggen</Button>
                <br/>
            </Form>
        </Container>
    );
};

export default Login;