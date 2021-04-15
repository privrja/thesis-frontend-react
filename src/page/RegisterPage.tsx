import React from "react";
import styles from "../main.module.scss";
import Flash from "../component/Flash";
import {Field, Form, Formik, FormikHelpers} from "formik";
import FlashType from "../component/FlashType";
import {ENDPOINT} from "../constant/Constants";
import {Link} from "react-router-dom";
import {TOKEN, USER_NAME} from "../constant/ApiConstants";
import Helper from "../helper/Helper";
import FetchHelper from "../helper/FetchHelper";
import PopupYesNo from "../component/PopupYesNo";

interface Values {
    name: string;
    password: string;
    password2: string;
    conditions: boolean;
    cap: string;
}

const BAD_CAP = 'Something bad happen with Cap';

interface State {
    question: string;
}

class RegisterPage extends React.Component<any, State> {

    flashRef: React.RefObject<Flash>;
    popupRef: React.RefObject<PopupYesNo>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.popupRef = React.createRef();
        this.state = {question: ''};
    }

    componentDidMount(): void {
        fetch(ENDPOINT + 'cap', {
            credentials: 'include',
            method: 'GET'
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    this.setState({question: data.question});
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
                credentials: "include",
                method: 'POST',
                body: JSON.stringify({name: values.name, password: values.password, answer: values.cap})
            }).then(response => {
                if (response.status === 201) {
                    this.flashRef.current!.activate(FlashType.OK);
                    fetch(ENDPOINT, {
                        method: "GET",
                        headers: {'x-auth-token': values.name + ':' + values.password},
                    }).then(response => {
                        if (response.status === 204) {
                            const token = response.headers.get('x-auth-token');
                            if (token) {
                                localStorage.setItem(TOKEN, token);
                                localStorage.setItem(USER_NAME, values.name);
                                this.flashRef.current!.activate(FlashType.OK);
                                Helper.resetUserStorage();
                                if (response.headers.get('x-condition') !== "1") {
                                    this.popupRef.current!.activateWithoutText();
                                } else {
                                    FetchHelper.refresh(this.props.history);
                                }
                            } else {
                                this.flashRef.current!.activate(FlashType.BAD);
                            }
                        } else {
                            this.flashRef.current!.activate(FlashType.BAD);
                        }
                        values.password2 = '';
                        values.password = '';
                    }).catch(() => {
                        values.password2 = '';
                        values.password = '';
                        this.flashRef.current!.activate(FlashType.BAD)
                    });
                } else {
                    response.json().then(data => {
                        this.flashRef.current!.activate(FlashType.BAD, data.message);
                        values.password2 = '';
                        values.password = '';
                    }).catch(() => {
                        values.password2 = '';
                        values.password = '';
                        this.flashRef.current!.activate(FlashType.BAD)
                    });
                }
            });
        }
    }

    render() {
        return (
            <section className={styles.pageLogin + ' ' + styles.page}>
                <section>
                    <h2>Registration</h2>
                    <Flash textBad='Registration failure!' textOk='Registration successful!' ref={this.flashRef}/>
                    <PopupYesNo label={'You need to agree with'}
                                defaultText={'<Link to=\'/condition\'>Terms and conditions</Link>'}
                                onYes={FetchHelper.conditionsOk} onNo={FetchHelper.conditionsKo} ref={this.popupRef}/>
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

                            <label htmlFor={'cap'}>Write three letter code for {this.state.question} <a
                                href={'https://en.wikipedia.org/wiki/Amino_acid'}>Wiki</a></label>
                            <Field id={'cap'} name={'cap'}/>

                            <label htmlFor="conditions">
                                <Field id="conditions" name="conditions" type="checkbox"/>
                                I agree with <Link to={'/condition'} target="_blank"
                                                   rel={'noopener noreferrer'}>terms and conditions</Link></label>
                            <button type="submit">Register</button>
                        </Form>
                    </Formik>
                    <Link to={'/login'}>Already have an account? Login here</Link>
                </section>
            </section>
        );
    }

}

export default RegisterPage;
