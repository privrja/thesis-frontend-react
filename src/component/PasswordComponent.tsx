import React from "react";
import styles from "../main.module.scss";
import Flash from "./Flash";
import FlashType from "./FlashType";
import {ENDPOINT, TOKEN} from "../constant/ApiConstants";
import {ERROR_LOGIN_NEEDED, ERROR_SOMETHING_GOES_WRONG} from "../constant/FlashConstants";

const TXT_PASSWORD_2 = 'txt-password2';
const TXT_PASSWORD = 'txt-password';
const PASSWORD = 'password';

class PasswordComponent extends React.Component<any, any> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.changePassword = this.changePassword.bind(this);
    }

    changePassword() {
        let password = document.getElementById(TXT_PASSWORD) as HTMLInputElement;
        let password2 = document.getElementById(TXT_PASSWORD_2) as HTMLInputElement;
        if (password.value === password2.value) {
            let token = localStorage.getItem(TOKEN);
            if (token) {
                fetch(ENDPOINT + 'user', {
                    method: 'PUT',
                    headers: {'x-auth-token': token},
                    body: JSON.stringify({password: password.value})
                }).then(response => {
                    if (response.status === 204) {
                        this.flashRef.current!.activate(FlashType.OK);
                    } else {
                        this.flashRef.current!.activate(FlashType.BAD, ERROR_SOMETHING_GOES_WRONG);
                    }
                })
            } else {
                this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
            }
        } else {
            this.flashRef.current!.activate(FlashType.BAD, 'Passwords aren\'t same');
        }
    }

    enterCall(e: any, call: () => void) {
        if (e.key === 'Enter') {
            call();
        }
    }

    render() {
        return (
            <section>
                <h3>Change Password</h3>
                <Flash ref={this.flashRef}/>
                <label htmlFor={TXT_PASSWORD}>Password:</label>
                <input type={PASSWORD} id={TXT_PASSWORD} onKeyDown={(e) => this.enterCall(e, this.changePassword)}/>
                <label htmlFor={TXT_PASSWORD_2}>Repeat password:</label>
                <input type={PASSWORD} id={TXT_PASSWORD_2} onKeyDown={(e) => this.enterCall(e, this.changePassword)}/>
                <button className={styles.update} onClick={this.changePassword}>Change</button>
            </section>
        );
    }

}

export default PasswordComponent;
