import React, { useEffect, useState } from "react";
import { Alert, Button, Container, Form, FormControl, FormGroup, ModalTitle, Table } from "react-bootstrap";
import firebase from "firebase/compat";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    task: Yup.string().required("Das Feld ist erforderlich"),
});

const ManageTasks = () => {
    const [tasks, setTasks] = useState<Array<string>>([]);
    const [fastTasks, setFastTasks] = useState<Array<string>>([]);

    const onSubmit = ({ task }: { task: string }) => {
        const arr = [...tasks, task];
        firebase
            .app()
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser!.uid)
            .update({ tasks: arr })
            .then(() => setTasks(arr));
    };

    const formik = useFormik({
        initialValues: {
            task: "",
        },
        onSubmit,
        validateOnChange: false,
        validateOnBlur: true,
        validationSchema,
    });

    const changeFastTasks = (val: string, bool: boolean) => {
        let arr = [...fastTasks];
        if (bool) arr.push(val);
        else arr = arr.filter((v) => v !== val);
        firebase
            .app()
            .firestore()
            .collection("users")
            .doc(firebase.app().auth().currentUser!.uid)
            .update({
                fastTasks: arr,
            })
            .then(() => setFastTasks(arr));
    };

    useEffect(() => {
        firebase
            .app()
            .firestore()
            .collection("users")
            .doc(firebase.auth().currentUser!.uid)
            .onSnapshot((snapshot) => {
                setTasks(snapshot.get("tasks") || []);
                setFastTasks(snapshot.get("fastTasks") || []);
            });
    }, []);

    return (
        <Container>
            <ModalTitle>Deine Aktivitäten</ModalTitle>
            <Table bordered>
                <thead>
                    <th>Name der Aktivität</th>
                    <th>Als Schnell-Task benutzen</th>
                </thead>

                {tasks.map((val) => (
                    <tr key={val}>
                        <td>{val}</td>
                        <td className={"d-flex text-align-center align-items-center"}>
                            <Form.Check
                                type={"checkbox"}
                                defaultChecked={fastTasks.indexOf(val) !== -1}
                                onChange={(e) => changeFastTasks(val, e.target.checked)}
                            />
                        </td>
                    </tr>
                ))}
            </Table>
            <br />
            <Form
                onSubmit={(e) => {
                    e.preventDefault();
                    formik.handleSubmit(e);
                }}
            >
                <FormGroup>
                    <ModalTitle>Neue Aktivität</ModalTitle>
                    <br />
                    <FormControl
                        name={"task"}
                        placeholder={"Neue Aktivität"}
                        onChange={formik.handleChange}
                        isInvalid={!!formik.errors.task}
                        value={formik.values.task}
                    />
                    <Alert variant={"danger"} show={!!formik.errors.task}>
                        {formik.errors.task}
                    </Alert>
                </FormGroup>
                <br />
                <Button type={"submit"}>Neue Aktivität erstellen</Button>
            </Form>
        </Container>
    );
};

export default ManageTasks;
