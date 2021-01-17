import React from "react";
import styles from "../main.module.scss";
import {ENDPOINT, TOKEN} from "../constant/ApiConstants";
import FlashType from "../component/FlashType";
import Flash from "../component/Flash";
import PopupYesNo from "../component/PopupYesNo";

interface Container {
    containerName: string
    visibility: string
    collaborators: Collaborator[]
}

interface Collaborator {
    userId: number;
    nick: string;
    mode: string;
}

interface State {
    container: Container
}

class ContainerDetailPage extends React.Component<any, State> {

    flashRef: React.RefObject<Flash>;
    popupRef: React.RefObject<PopupYesNo>;

    constructor(props: any) {
        super(props);

        this.flashRef = React.createRef();
        this.popupRef = React.createRef();
        this.popup = this.popup.bind(this);
        this.state = {container: {containerName: '', visibility: '', collaborators: []}};
    }

    componentDidMount(): void {
        this.container();
    }

    container() {
        const token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'container/' + this.props.match.params.id, token ? {
                method: 'GET',
                headers: {'x-auth-token': token}
            } : {
                method: 'GET'
            })
                .then(response => {
                    if (response.status === 404) {
                        this.flashRef.current!.activate(FlashType.BAD, 'Not found');
                    }
                    return response;
                })
                .then(response => response.status === 200 ? response.json() : null)
                .then(response => this.setState({container: response}));
        } else {
            this.flashRef.current!.activate(FlashType.BAD, 'You need to login');
        }
    }

    popup(key: number) {
        this.popupRef.current!.key = key;
        this.popupRef.current!.activate();
    }

    delete() {
        // TODO
    }

    containerH() {
        return this.state.container.containerName + ' - '  + this.state.container.visibility;
    }

    collaboratorsH() {
        return <h2 id='collaborators'>Collaborators</h2>
    }

    collaboratorsTable() {
        return <table>
            <thead>
            <tr>
                <th>User name</th>
                <th>Mode</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {this.state.container.collaborators.map(collaborator => (
                <tr>
                    <td>{collaborator.nick}</td>
                    <td>{collaborator.mode}</td>
                    <td>
                        <button className={styles.delete} onClick={() => this.popup(collaborator.userId)}>Delete</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    }

    render() {
        return (
            <section className={styles.page}>
                <section>
                    <h1>Container { this.state.container ? this.containerH() : '' }</h1>
                    <PopupYesNo label={"Realy want to remove user from container?"} onYes={this.delete} ref={this.popupRef}/>
                    <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>
                    { this.state.container ? this.collaboratorsH()  : '' }
                    { this.state.container ? this.collaboratorsTable()  : '' }
                </section>
            </section>
        )
    }

}

export default ContainerDetailPage;
