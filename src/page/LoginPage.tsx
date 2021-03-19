import * as React from "react";
import "react-app-polyfill/ie11";
import {Field, Form, Formik, FormikHelpers} from "formik/dist";
import styles from "../main.module.scss"
import {
    ENDPOINT,
    TOKEN,
    URL_PREFIX, USER_NAME
} from "../constant/ApiConstants";
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import Helper from "../helper/Helper";
import PopupYesNo from "../component/PopupYesNo";
import FetchHelper from "../helper/FetchHelper";

interface Values {
    name: string;
    password: string;
}

class LoginPage extends React.Component<any> {

    flashRef: React.RefObject<Flash>;
    popupRef: React.RefObject<PopupYesNo>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.popupRef = React.createRef();
        this.login = this.login.bind(this);
    }

    login(values: Values) {
        this.flashRef.current!.activate(FlashType.PENDING);
        values.name = values.name.trim();
        fetch(ENDPOINT, {
            method: "GET",
            headers: {'x-auth-token': values.name + ':' + values.password},
        })
            .then(response => {
                if (response.status === 204) {
                    const token = response.headers.get('x-auth-token');
                    if (token) {
                        localStorage.setItem(TOKEN, token);
                        localStorage.setItem(USER_NAME, values.name);
                        this.flashRef.current!.activate(FlashType.OK);
                        Helper.resetUserStorage();
                        if (response.headers.get('x-condition') !== "1") {
                            this.popupRef.current!.activate();
                        } else {
                            FetchHelper.refresh();
                        }
                    } else {
                        this.flashRef.current!.activate(FlashType.BAD);
                    }
                } else {
                    this.flashRef.current!.activate(FlashType.BAD);
                }
            })
    }

    render() {
        return (
            <section className={styles.pageLogin + ' ' + styles.page}>
                <section>
                    <h1>Login</h1>

                    <Flash textBad='Login failure!' textOk='Login sucessful!' ref={this.flashRef}/>
                    <PopupYesNo label={'You need to agree with terms and conditions'} onYes={FetchHelper.conditionsOk} onNo={FetchHelper.conditionsKo} ref={this.popupRef} />

                    <Formik
                        initialValues={{
                            name: '',
                            password: ''
                        }}
                        onSubmit={(
                            values: Values,
                            {setSubmitting}: FormikHelpers<Values>
                        ) => {
                            setTimeout(() => {
                                this.login(values);
                                setSubmitting(false);
                            }, 500);
                        }}
                    >
                        <Form>
                            <label htmlFor="name">Name:</label>
                            <Field id="name" name="name" placeholder='Your Nick Name'/>

                            <label htmlFor="password">Password:</label>
                            <Field id="password" name="password" type="password" placeholder='******'/>

                            <button type="submit">Login</button>
                        </Form>
                    </Formik>

                    <a href={URL_PREFIX + 'register'}>Don't have an account? Register here.</a>

                </section>
            </section>
        )
    }

}

export default LoginPage;
