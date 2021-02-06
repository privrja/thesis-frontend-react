import ListComponent, {ListState} from "../component/ListComponent";
import {ENDPOINT} from "../constant/ApiConstants";
import PopupYesNo from "../component/PopupYesNo";
import Flash from "../component/Flash";
import styles from "../main.module.scss";
import React from "react";
import {SelectInput} from "../component/SelectInput";
import {PermissionEnumHelper} from "../enum/PermissionEnum";

const SEL_EDIT_MODE = 'sel-edit-mode';

interface Container {
    containerName: string
    visibility: string
}

interface State extends ListState {
    container: Container;
}

interface Props {
    containerId: number;
}

class Collaborator extends ListComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {list: [], container: {containerName: '', visibility: ''}, selectedContainer: this.getSelectedContainer()};
    }

    create(values: any): void {
    }

    delete(key: number): void {
    }

    list(): void {
        this.defaultListTransformation(ENDPOINT + 'container/' + this.props.containerId,
                response => this.setState({container: {containerName: response.containerName, visibility: response.visibility}, list: response.collaborators}));
    }

    update(key: number): void {
    }

    containerH() {
        return this.state.container.containerName + ' - ' + this.state.container.visibility;
    }

    render() {
        return (
            <section>
                <h1>Container {this.state.container ? this.containerH() : ''}</h1>
                <PopupYesNo label={"Realy want to remove user from container?"} onYes={this.delete} ref={this.popupRef}/>
                <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>
                {this.state.container ? <h2 id='collaborators'>Collaborators</h2> : ''}
                {this.state.container ?
                    <table>
                        <thead>
                        <tr>
                            <th>User name</th>
                            <th>Mode</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.list.map(collaborator => (
                            <tr>
                                <td>{collaborator.nick}</td>
                                <td onClick={() => this.edit(collaborator.id)}>{this.state.editable === collaborator.id ?
                                    <SelectInput id={SEL_EDIT_MODE} name={SEL_EDIT_MODE} options={PermissionEnumHelper.getOptions()}/> : collaborator.mode}</td>
                                <td>
                                    {this.state.editable === collaborator.id ? <button className={styles.update} onClick={() => this.update(collaborator.id)}>Update</button> : <div/>}
                                    {this.state.editable === collaborator.id ? <button className={styles.delete} onClick={this.editEnd}>Cancel</button> : <div/>}
                                    <button className={styles.delete} onClick={() => this.popup(collaborator.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    : ''}
            </section>
        );
    }

}

export default Collaborator;
