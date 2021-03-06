import React from "react";
import Flash from "./Flash";
import styles from "../main.module.scss";
import {TOKEN} from "../constant/ApiConstants";
import FlashType from "./FlashType";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import {ENDPOINT} from "../constant/Constants";
import TextInput from "./TextInput";

interface State {
    apiKey: string;
}

class ChemSpiderKey extends React.Component<any, State> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.setupKey = this.setupKey.bind(this);
        this.removeKey = this.removeKey.bind(this);
        this.state = {apiKey: ''};
    }

    componentDidMount(): void {
        this.getKey();
    }

    getKey() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'chemspider/key', {
                method: 'GET',
                headers: {'x-auth-token': token},
            }).then(response => {
                if (response.status === 200) {
                    response.json().then((data: any) => this.setState({apiKey: data.apiKey}));
                }
            })
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
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

    removeKey() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'chemspider/key', {
                method: 'DELETE',
                headers: {'x-auth-token': token},
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK);
                    this.setState({apiKey: ''});
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
        return (
            <section>
                <h2>Set ChemSpider apikey</h2>
                <Flash ref={this.flashRef}/>
                <label htmlFor={'txt-key'}>API Key:</label>
                <TextInput className={styles.txtLarger} id={'txt-key'} onKeyDown={(e) => this.enterCall(e, this.setupKey)} name={'txt-key'}
                           value={this.state.apiKey}/>
                <button className={styles.update} onClick={this.setupKey}>Change</button>
                <button className={styles.delete} onClick={this.removeKey}>Remove</button>
            </section>
        );
    }

}

export default ChemSpiderKey;
