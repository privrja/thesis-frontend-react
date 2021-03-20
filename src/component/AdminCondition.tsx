import React from "react";
import Flash from "./Flash";
import styles from "../main.module.scss";
import {ENDPOINT, TOKEN} from "../constant/ApiConstants";
import FlashType from "./FlashType";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import FetchHelper from "../helper/FetchHelper";

class AdminCondition extends React.Component<any> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.reset = this.reset.bind(this);
    }

    componentDidMount(): void {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'setup/condition', {
                method: 'GET',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => (document.getElementById('txt-condition') as HTMLTextAreaElement).value = data.text);
                }
            }).catch(() => this.flashRef.current!.activate(FlashType.BAD));
        }
    }

    reset() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            FetchHelper.fetchSetup(ENDPOINT + 'setup/condition', {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify({text: (document.getElementById('txt-condition') as HTMLTextAreaElement).value})
            }, this.flashRef);
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    render() {
        return (
            <section>
                <h2>Conditions</h2>
                <Flash ref={this.flashRef}/>
                <textarea id={'txt-condition'} className={styles.area}/><br/>
                <label htmlFor={'btn-reset'}>Reset conditions agreements:</label>
                <button id={'btn-reset'} className={styles.update} onClick={this.reset}>Save and Reset</button>
            </section>
        );
    }

}

export default AdminCondition;
