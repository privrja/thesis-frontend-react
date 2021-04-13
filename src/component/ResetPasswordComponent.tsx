import React from "react";
import Flash from "./Flash";
import styles from "../main.module.scss";
import {ENDPOINT} from "../constant/Constants";
import FlashType from "./FlashType";

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
        let nick = document.getElementById('txt-nick') as HTMLInputElement;
        fetch(ENDPOINT + 'user/reset', {
            method: 'POST',
            body: JSON.stringify({nick: nick.value})
        }).then(response => {
            if (response.status === 204) {
                this.flashRef.current!.activate(FlashType.OK, 'CODE send to your email');
            } else {
                response.json().then((data) => this.flashRef.current!.activate(FlashType.BAD, data.message));
            }
        }).catch(() => this.flashRef.current!.activate(FlashType.BAD));
    }

    setupCode() {
        let nick = document.getElementById('txt-nick') as HTMLInputElement;
        let code = document.getElementById('txt-code') as HTMLInputElement;
        fetch(ENDPOINT + 'user/generate', {
            method: 'POST',
            body: JSON.stringify({nick: nick.value, token: code.value})
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
                    <label htmlFor={'txt-nick'}>nick:</label>
                    <input type={'text'} id={'txt-nick'} onKeyDown={(e) => this.enterCall(e, this.sendCode)}/>
                    <button className={styles.update} onClick={this.sendCode}>Send CODE to email</button>
                    <label htmlFor={'txt-code'}>CODE from your email:</label>
                    <input type={'text'} id={'txt-code'} onKeyDown={(e) => this.enterCall(e, this.setupCode)}/>
                    <button className={styles.update} onClick={this.setupCode}>Confirm</button>
                </section>
            </section>
        );
    }

}

export default ResetPasswordComponent;
