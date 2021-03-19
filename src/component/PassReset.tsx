import React from "react";
import Flash from "./Flash";
import styles from "../main.module.scss";
import {ENDPOINT, TOKEN} from "../constant/ApiConstants";
import FlashType from "./FlashType";
import {ERROR_LOGIN_NEEDED, ERROR_SOMETHING_GOES_WRONG} from "../constant/FlashConstants";

class PassReset extends React.Component<any, any> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.mail = this.mail.bind(this);
    }

    mail() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'user/reset', {
                method: 'POST',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => this.flashRef.current!.activate(FlashType.OK, data.message));
                } else {
                    this.flashRef.current!.activate(FlashType.BAD, ERROR_SOMETHING_GOES_WRONG);
                }
            });
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    render() {
        return(
            <section>
            <h3>Reset Password</h3>
            <Flash ref={this.flashRef}/>
            <label htmlFor={'mail'}>We generate you new password a send it vie email.</label>
            <button className={styles.update} onClick={this.mail}>Generate</button>
        </section>
        );
    }

}

export default PassReset;
