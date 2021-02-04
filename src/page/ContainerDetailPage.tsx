import React from "react";
import styles from "../main.module.scss";
import {ENDPOINT, TOKEN} from "../constant/ApiConstants";
import FlashType from "../component/FlashType";
import Flash from "../component/Flash";
import PopupYesNo from "../component/PopupYesNo";
import {SelectInput} from "../component/SelectInput";
import {PermissionEnumHelper} from "../enum/PermissionEnum";

interface Container {
    containerName: string
    visibility: string
    collaborators: Collaborator[]
}

interface Collaborator {
    id: number;
    nick: string;
    mode: string;
}

interface State {
    container: Container
    editable?: number;
}

const SEL_EDIT_MODE = 'sel-edit-mode';

class ContainerDetailPage extends React.Component<any, State> {

    flashRef: React.RefObject<Flash>;
    popupRef: React.RefObject<PopupYesNo>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.popupRef = React.createRef();
        this.popup = this.popup.bind(this);
        this.edit = this.edit.bind(this);
        this.editEnd = this.editEnd.bind(this);
        this.state = {container: {containerName: '', visibility: '', collaborators: []}};
    }

    componentDidMount(): void {
        this.container();
        console.log(this.state.container);
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

    edit(containerId: number): void {
        this.setState({editable: containerId});
    }

    editEnd(): void {
        this.setState({editable: undefined});
    }

    update(key: number) {
        //TODO
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

    render() {
        return (
            <section className={styles.page}>
                <section>
                    <h1>Container { this.state.container ? this.containerH() : '' }</h1>
                    <PopupYesNo label={"Realy want to remove user from container?"} onYes={this.delete} ref={this.popupRef}/>
                    <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>
                    { this.state.container ? this.collaboratorsH()  : '' }
                    { this.state.container ?
                        <table>
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
                                    <td onClick={() => this.edit(collaborator.id)}>{ this.state.editable === collaborator.id ? <SelectInput id={SEL_EDIT_MODE} name={SEL_EDIT_MODE} options={PermissionEnumHelper.getOptions()} /> : collaborator.mode}</td>
                                    <td>
                                        { this.state.editable === collaborator.id ? <button className={styles.update} onClick={() => this.update(collaborator.id)}>Update</button> : <div/> }
                                        { this.state.editable === collaborator.id ? <button className={styles.delete} onClick={this.editEnd}>Cancel</button> : <div/> }
                                        <button className={styles.delete} onClick={() => this.popup(collaborator.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        : '' }
                </section>
            </section>
        )
    }

}

export default ContainerDetailPage;
