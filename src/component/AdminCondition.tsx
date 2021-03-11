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

    reset() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            FetchHelper.fetchSetup(ENDPOINT + 'setup/condition', {
                method: 'POST',
                headers: {'x-auth-token': token}
            }, this.flashRef);
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    render() {
        return (
            <section>
                <h3>Conditions</h3>
                <Flash ref={this.flashRef}/>
                <label htmlFor={'btn-reset'}>Reset conditions agreements:</label>
                <button id={'btn-reset'} className={styles.update} onClick={this.reset}>Reset</button>
            </section>
        );
    }

}

export default AdminCondition;
