import React from 'react';
import {Button, Col, Container, Form, FormControl, FormGroup, FormLabel, ModalTitle, Row} from "react-bootstrap";
import {useFormik} from "formik";
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    email: Yup.string()
        .required('Das Email Feld darf nicht leer sein')
        .email(),

})

const SignUp = () => {
    const handleSubmit = ({email, password}: {email: string, password: string}) => {

    }

    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: '',
            email: ''
        },
        validateOnBlur: false,
        validateOnChange: true,
        validationSchema,
        onSubmit: handleSubmit
    })

    return (
        <Container>
            <ModalTitle>Konto erstellen</ModalTitle>
            <Form>
                <Row>
                    <FormGroup>
                        <FormLabel>Email Adresse</FormLabel>
                        <FormControl type={'email'} name={'email'} placeholder={'Email Adresse'}/>
                    </FormGroup>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <FormLabel>Passwort</FormLabel>
                            <FormControl type={'password'} name={'password'}/>
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <FormLabel>Passwort bestätigen</FormLabel>
                            <FormControl type={'password'} name={'confirmPassword'}/>
                        </FormGroup>
                    </Col>
                </Row>
                <br/>
                <Button type={'submit'}>Konto erstellen</Button>
            </Form>
        </Container>
    );
};

export default SignUp;