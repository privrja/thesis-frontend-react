import React from "react";
import Flash from "./Flash";
import styles from "../main.module.scss";
import {TOKEN} from "../constant/ApiConstants";
import FlashType from "./FlashType";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import {ENDPOINT} from "../constant/Constants";

class MailReset extends React.Component<any, any> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.mail = this.mail.bind(this);
    }

    mail() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'user/mail', {
                method: 'PUT',
                headers: {'x-auth-token': token},
                body: JSON.stringify({mail: (document.getElementById('mail') as HTMLInputElement).value ?? ''})
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK);
                } else {
                    response.json().then(data => this.flashRef.current!.activate(FlashType.BAD, data.message));
                }
            });
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    render() {
        return(
            <section>
                <h2>Change Email</h2>
                <Flash ref={this.flashRef}/>
                <label htmlFor={'mail'}>New email</label>
                <input type={'text'} id={'mail'}/>
                <button className={styles.update} onClick={this.mail}>Change</button>
            </section>
        );
    }

}

export default MailReset;
