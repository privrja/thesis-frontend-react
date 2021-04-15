import React from "react";
import Flash from "./Flash";
import styles from "../main.module.scss";
import {TOKEN} from "../constant/ApiConstants";
import FlashType from "./FlashType";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import {ENDPOINT} from "../constant/Constants";
import TextInput from "./TextInput";

interface State {
    mail: string;
}

class MailReset extends React.Component<any, State> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.mail = this.mail.bind(this);
        this.removeMail = this.removeMail.bind(this);
        this.state = {mail: ''};
    }

    componentDidMount(): void {
        this.getMail();
    }

    getMail() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'user/mail', {
                method: 'GET',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => this.setState({mail: data.mail}));
                }
            });
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    enterCall(e: any, call: () => void) {
        if (e.key === 'Enter') {
            call();
        }
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

    removeMail() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'user/mail', {
                method: 'DELETE',
                headers: {'x-auth-token': token},
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK);
                    this.setState({mail: ''});
                } else {
                    response.json().then((data: any) =>
                        this.flashRef.current!.activate(FlashType.BAD, data.message)
                    ).catch(() => this.flashRef.current!.activate(FlashType.BAD));
                }
            }).catch(() => this.flashRef.current!.activate(FlashType.BAD));
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    render() {
        return(
            <section>
                <h2>Change email</h2>
                <Flash ref={this.flashRef}/>
                <label htmlFor={'mail'}>New email</label>
                <TextInput id={'mail'} value={this.state.mail} name={'mail'} onKeyDown={(e: any) => this.enterCall(e, this.mail)}/>
                <button className={styles.update} onClick={this.mail}>Change</button>
                <button className={styles.delete} onClick={this.removeMail}>Remove</button>
            </section>
        );
    }

}

export default MailReset;
