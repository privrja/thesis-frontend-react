import React from "react";
import {ENDPOINT, TOKEN} from "../constant/ApiConstants";
import Flash from "./Flash";
import FlashType from "./FlashType";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import styles from "../main.module.scss";

class DeleteAccount extends React.Component<any, any> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.delete = this.delete.bind(this);
    }

    delete() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'user', {
                method: 'DELETE',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK);
                } else {
                    response.json().then(data => this.flashRef.current!.activate(FlashType.BAD, data.message)).catch(() => this.flashRef.current!.activate(FlashType.BAD));
                }
            }).catch(() => this.flashRef.current!.activate(FlashType.BAD));
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    render() {
        return (
            <section>
                <h3>Delete account</h3>
                <Flash ref={this.flashRef}/>
                <button className={styles.delete} onClick={this.delete}>Delete</button>
            </section>
        );
    }

}

export default DeleteAccount;
