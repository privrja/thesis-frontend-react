import * as React from "react";
import styles from "../main.module.scss";
import {ENDPOINT} from "../constant/Constants";

class ConditionsPage extends React.Component<any> {

    componentDidMount(): void {
        fetch(ENDPOINT + 'setup/condition', {
            method: 'GET',
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => (document.getElementById('txt-condition') as HTMLTextAreaElement).value = data.text);
            }
        });
    }

    render() {
        return (
            <section className={styles.page}>
                <section>
                    <h2>Terms and Conditions</h2>
                    <textarea id={'txt-condition'} className={styles.area} disabled={true}/><br/>
                </section>
            </section>
        )
    }

}

export default ConditionsPage;

