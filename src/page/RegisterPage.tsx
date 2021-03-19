import React from "react";
import styles from "../main.module.scss";
import Flash from "../component/Flash";
import {Field, Form, Formik, FormikHelpers} from "formik";
import FlashType from "../component/FlashType";
import {ENDPOINT, URL_PREFIX} from "../constant/ApiConstants";

interface Values {
    name: string;
    password: string;
    password2: string;
    conditions: boolean;
    cap: string;
}

const BAD_CAP = 'Something bad happen with Cap';

interface State {
    regToken: string;
    question: string;
}

class RegisterPage extends React.Component<any, State> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.state = {question: '', regToken: ''}
    }

    componentDidMount(): void {
        fetch(ENDPOINT + 'cap', {
            method: 'GET'
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    this.setState({regToken: response.headers.get('reg-token') ?? '', question: data.question});
                }).catch(() => this.flashRef.current!.activate(FlashType.BAD, BAD_CAP));
            }
        }).catch(() => this.flashRef.current!.activate(FlashType.BAD, BAD_CAP));
    }

    checkEmpty(value: string, message: string) {
        if (value === null || value === undefined || value === '') {
            this.flashRef.current!.activate(FlashType.BAD, message);
            return false;
        }
        return true;
    }

    checkPasswords(password: string, password2: string, message: string) {
        if (password !== password2) {
            this.flashRef.current!.activate(FlashType.BAD, message);
            return false;
        }
        return true;
    }

    register(values: Values) {
        values.name = values.name.trim();
        if (!values.conditions) {
            this.flashRef.current!.activate(FlashType.BAD, 'You need to agree with terms and conditions');
            return;
        }
        let check = this.checkEmpty(values.name, 'Name is empty');
        check = check && this.checkEmpty(values.password, 'Password is empty');
        check = check && this.checkEmpty(values.password2, 'Password is empty');
        check = check && this.checkPasswords(values.password, values.password2, 'Password aren\'t the same');
        if (check) {
            fetch(ENDPOINT + 'register', {
                method: 'POST',
                body: JSON.stringify({name: values.name, password: values.password, answer: values.cap}),
                headers: {'reg-token': this.state.regToken}
            }).then(response => {
                if (response.status === 201) {
                    this.flashRef.current!.activate(FlashType.OK);
                } else {
                    response.json().then(data => {
                        this.flashRef.current!.activate(FlashType.BAD, data.message)
                    })
                }
            });
        }
        values.password2 = '';
        values.password = '';
    }

    render() {
        return (
            <section className={styles.pageLogin + ' ' + styles.page}>
                <section>
                    <h1>Registration</h1>

                    <Flash textBad='Registration failure!' textOk='Registration sucessful!' ref={this.flashRef}/>

                    <Formik
                        initialValues={{
                            name: '',
                            password: '',
                            password2: '',
                            conditions: false,
                            cap: ''
                        }}
                        onSubmit={(
                            values: Values,
                            {setSubmitting}: FormikHelpers<Values>
                        ) => {
                            setTimeout(() => {
                                this.register(values);
                                setSubmitting(false);
                            }, 500);
                        }}
                    >
                        <Form>
                            <label htmlFor="name">Name:</label>
                            <Field id="name" name="name" placeholder='Your Nick Name'/>

                            <label htmlFor="mail">E-mail:</label>
                            <Field id="mail" name="mail" placeholder='Not required'/>

                            <label htmlFor="password">Password:</label>
                            <Field id="password" name="password" type="password" placeholder='******'/>

                            <label htmlFor="password">Password check:</label>
                            <Field id="password2" name="password2" type="password" placeholder='******'/>

                            <label htmlFor={'cap'}>Write three letter code for {this.state.question}</label>
                            <Field id={'cap'} name={'cap'}/>

                            <label htmlFor="conditions">
                                <Field id="conditions" name="conditions" type="checkbox"/>
                                I'm agree with <a href={URL_PREFIX + 'condition'} target="_blank"
                                                  rel={'noopener noreferrer'}>terms and conditions</a></label>
                            <button type="submit">Register</button>
                        </Form>
                    </Formik>
                    <a href={URL_PREFIX + 'login'}>Already have an account? Login here.</a>
                </section>
            </section>
        );
    }

}

export default RegisterPage;
