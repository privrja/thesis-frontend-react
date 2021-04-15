import React from "react";
import Flash from "./Flash";
import styles from "../main.module.scss";
import {ENDPOINT} from "../constant/Constants";
import FlashType from "./FlashType";

const TXT_MAIL = 'txt-mail';
const TXT_CODE = 'txt-code';

class ResetPasswordComponent extends React.Component<any, any> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.setupCode = this.setupCode.bind(this);
        this.sendCode = this.sendCode.bind(this);
    }

    enterCall(e: any, call: () => void) {
        if (e.key === 'Enter') {
            call();
        }
    }

    sendCode() {
        let mail = document.getElementById(TXT_MAIL) as HTMLInputElement;
        fetch(ENDPOINT + 'user/reset', {
            method: 'POST',
            body: JSON.stringify({mail: mail.value})
        }).then(response => {
            if (response.status === 204) {
                this.flashRef.current!.activate(FlashType.OK, 'CODE send to your email');
            } else {
                response.json().then((data) => this.flashRef.current!.activate(FlashType.BAD, data.message));
            }
        }).catch(() => this.flashRef.current!.activate(FlashType.BAD));
    }

    setupCode() {
        let mail = document.getElementById(TXT_MAIL) as HTMLInputElement;
        let code = document.getElementById(TXT_CODE) as HTMLInputElement;
        fetch(ENDPOINT + 'user/generate', {
            method: 'POST',
            body: JSON.stringify({mail: mail.value, token: code.value})
        }).then(response => {
            if (response.status === 204) {
                this.flashRef.current!.activate(FlashType.OK, 'New password send to your email');
            } else {
                response.json().then((data) => this.flashRef.current!.activate(FlashType.BAD, data.message));
            }
        }).catch(() => this.flashRef.current!.activate(FlashType.BAD));
    }

    render() {
        return (
            <section className={styles.pageLogin + ' ' + styles.page}>
                <section>
                    <h2>Password reset</h2>
                    <Flash ref={this.flashRef}/>
                    <p>We send you CODE to verify on your email. Then you place CODE here and then we send to your mail
                        your new password.</p>
                    <label htmlFor={TXT_MAIL}>Email:</label>
                    <input type={'text'} id={TXT_MAIL} onKeyDown={(e) => this.enterCall(e, this.sendCode)}/>
                    <button className={styles.update} onClick={this.sendCode}>Send CODE to email</button>
                    <label htmlFor={TXT_CODE}>CODE from your email:</label>
                    <input type={'text'} id={TXT_CODE} onKeyDown={(e) => this.enterCall(e, this.setupCode)}/>
                    <button className={styles.update} onClick={this.setupCode}>Confirm</button>
                </section>
            </section>
        );
    }

}

export default ResetPasswordComponent;
