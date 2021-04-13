import * as React from "react";
import "react-app-polyfill/ie11";
import {Field, Form, Formik, FormikHelpers} from "formik/dist";
import styles from "../main.module.scss"
import {
    TOKEN,
    USER_NAME
} from "../constant/ApiConstants";
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import Helper from "../helper/Helper";
import PopupYesNo from "../component/PopupYesNo";
import FetchHelper from "../helper/FetchHelper";
import {ENDPOINT} from "../constant/Constants";
import {Link} from "react-router-dom";

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
            })
    }

    render() {
        return (
            <section className={styles.pageLogin + ' ' + styles.page}>
                <section>
                    <h2>Login</h2>
                    <Flash textBad='Login failure!' textOk='Login successful!' ref={this.flashRef}/>
                    <PopupYesNo label={'You need to agree with'}
                                defaultText={'<Link href=\'/condition\'>Terms and conditions</Link>'}
                                onYes={FetchHelper.conditionsOk} onNo={FetchHelper.conditionsKo} ref={this.popupRef}/>

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

                    <p>
                        <Link to={'/register'}>Don't have an account? Register here</Link> | <Link to={'/reset'}>Reset password</Link>
                    </p>
                </section>
            </section>
        )
    }

}

export default LoginPage;
