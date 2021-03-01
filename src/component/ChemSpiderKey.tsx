import React from "react";
import Flash from "./Flash";
import styles from "../main.module.scss";
import {ENDPOINT} from "../constant/ApiConstants";
import FlashType from "./FlashType";

class ChemSpiderKey extends React.Component<any, any> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.setupKey = this.setupKey.bind(this);
    }

    setupKey() {
        let apiKey = document.getElementById('txt-key') as HTMLInputElement;
        fetch(ENDPOINT + 'chemspider/key', {
            method: 'POST',
            body: JSON.stringify({apiKey: apiKey.value})
        }).then(response => {
            if (response.status === 204) {
                this.flashRef.current!.activate(FlashType.OK);
            } else {
                response.json().then((data: any) => this.flashRef.current!.activate(FlashType.BAD, data.message));
            }
        });
    }

    render() {
        return (
            <section>
                <h3>Set ChemSpider Key</h3>
                <Flash ref={this.flashRef}/>
                <label htmlFor={'txt-key'}>API Key:</label>
                <input type={'text'} id={'txt-key'}/>
                <button className={styles.update} onClick={this.setupKey}>Change</button>
            </section>
        );
    }

}

export default ChemSpiderKey;
