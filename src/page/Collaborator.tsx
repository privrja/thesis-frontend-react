import ListComponent, {ListState} from "../component/ListComponent";
import {CONTAINER, TOKEN} from "../constant/ApiConstants";
import PopupYesNo from "../component/PopupYesNo";
import Flash from "../component/Flash";
import styles from "../main.module.scss";
import React from "react";
import {SelectInput} from "../component/SelectInput";
import {PermissionEnum, PermissionEnumHelper} from "../enum/PermissionEnum";
import FlashType from "../component/FlashType";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import ContainerHelper from "../helper/ContainerHelper";
import {ENDPOINT} from "../constant/Constants";
import TextInput from "../component/TextInput";

const SEL_EDIT_MODE = 'sel-edit-mode';

interface Container {
    containerName: string
    visibility: string
}

interface State extends ListState {
    container: Container;
    users: any[];
    userId?: number;
}

interface Props {
    containerId: number;
}

const TXT_USER_ID = 'cre-user';
const SEL_NEW_MODE = 'sel-new-mode';

class Collaborator extends ListComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.users = this.users.bind(this);
        this.transformation = this.transformation.bind(this);
        this.state = {
            list: [],
            container: {containerName: '', visibility: ''},
            selectedContainer: ContainerHelper.getSelectedContainer(),
            users: [],
        };
    }

    findName(key: number): string {
        return this.find(key).nick;
    }

    getEndpoint(): string {
        return ENDPOINT + CONTAINER + '/' + this.props.containerId;
    }

    transformation(response: any) {
        this.setState({
            container: {
                containerName: response.containerName,
                visibility: response.visibility
            }, list: response.collaborators
        });
    }

    list(): void {
        this.defaultListTransformation(this.getEndpoint(), this.transformation);
    }

    componentDidMount(): void {
        super.componentDidMount();
        this.users();
    }

    create(): void {
        let mode = document.getElementById(SEL_NEW_MODE) as HTMLSelectElement;
        let user = document.getElementById(TXT_USER_ID) as HTMLInputElement;
        if (!user.value) {
            this.flashRef.current!.activate(FlashType.BAD, 'User is empty');
        } else if (!mode.value) {
            this.flashRef.current!.activate(FlashType.BAD, 'Mode have bad format or is empty');
        } else {
            let token = localStorage.getItem(TOKEN);
            if (token) {
                fetch(this.getEndpoint() + '/collaborator', {
                    method: 'POST',
                    headers: {'x-auth-token': token},
                    body: JSON.stringify({user: user.value, mode: mode.value}),
                }).then(response => {
                    if (response.status === 201) {
                        this.flashRef.current!.activate(FlashType.OK);
                        this.list();
                    } else {
                        this.badResponse(response);
                    }
                });
            } else {
                this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
            }
        }
    }

    update(key: number): void {
        let mode = document.getElementById(SEL_EDIT_MODE) as HTMLSelectElement;
        this.defaultUpdate(this.getEndpoint() + '/collaborator/' + key, key, {mode: mode.value});
    }

    delete(key: number): void {
        this.defaultDelete(this.getEndpoint() + '/collaborator/' + key, key);
    }

    containerH() {
        return this.state.container.containerName + ' - ' + this.state.container.visibility;
    }

    users() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'user', {
                method: 'GET',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => this.setState({users: data}));
                } else if (response.status === 401) {
                    localStorage.removeItem(TOKEN);
                }
            })
        }
    }

    render() {
        return (
            <section>
                <h2>Container {this.state.container ? this.containerH() : ''}</h2>
                <PopupYesNo label={"Really want to remove"} onYes={this.delete}
                            ref={this.popupRef}/>
                <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>

                {localStorage.getItem(TOKEN) !== null ?
                    <div>
                        <h2>Add new user to container</h2>
                        <TextInput name={TXT_USER_ID} id={TXT_USER_ID} value={''} />
                        <label htmlFor={SEL_NEW_MODE}>Mode</label>
                        <SelectInput id={SEL_NEW_MODE} name={SEL_NEW_MODE} options={PermissionEnumHelper.getOptions()}
                                     selected={PermissionEnumHelper.getName(PermissionEnum.RW)}/>
                        <button type="submit" className={styles.create} onClick={this.create}>Add new user</button>
                    </div> : ''}

                <h2 id='collaborators'>Collaborators - {this.state.list.length} rows</h2>
                <table>
                    <thead>
                    <tr>
                        <th onClick={() => this.sortBy('nick', this.getEndpoint(), this.transformation)}>User name {this.sortIcons('nick')}</th>
                        <th onClick={() => this.sortBy('mode', this.getEndpoint(), this.transformation)}>Mode {this.sortIcons('mode')}</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.list.map(collaborator => (
                        <tr>
                            <td>{collaborator.nick}</td>
                            <td onClick={() => this.edit(collaborator.id)}>{this.state.editable === collaborator.id ?
                                <SelectInput id={SEL_EDIT_MODE} name={SEL_EDIT_MODE}
                                             options={PermissionEnumHelper.getOptions()}
                                             selected={collaborator.mode}/> : collaborator.mode}</td>
                            <td>
                                {this.state.editable === collaborator.id ? <button className={styles.update}
                                                                                   onClick={() => this.update(collaborator.id)}>Update</button> :
                                    <div/>}
                                {this.state.editable === collaborator.id ?
                                    <button className={styles.delete} onClick={this.editEnd}>Cancel</button> :
                                    <div/>}
                                <button className={styles.delete}
                                        onClick={() => this.popup(collaborator.id)}>Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>
        );
    }

}

export default Collaborator;
