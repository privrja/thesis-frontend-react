import React from "react";
import Flash from "./Flash";
import styles from "../main.module.scss";
import {TOKEN} from "../constant/ApiConstants";
import FlashType from "./FlashType";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import {ENDPOINT} from "../constant/Constants";

class ChemSpiderKey extends React.Component<any, any> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.setupKey = this.setupKey.bind(this);
    }

    setupKey() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            let apiKey = document.getElementById('txt-key') as HTMLInputElement;
            fetch(ENDPOINT + 'chemspider/key', {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify({apiKey: apiKey.value})
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK);
                } else {
                    response.json().then((data: any) => this.flashRef.current!.activate(FlashType.BAD, data.message));
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

    render() {
        return (
            <section>
                <h2>Set ChemSpider Key</h2>
                <Flash ref={this.flashRef}/>
                <label htmlFor={'txt-key'}>API Key:</label>
                <input type={'text'} id={'txt-key'} onKeyDown={(e) => this.enterCall(e, this.setupKey)}/>
                <button className={styles.update} onClick={this.setupKey}>Change</button>
            </section>
        );
    }

}

export default ChemSpiderKey;
