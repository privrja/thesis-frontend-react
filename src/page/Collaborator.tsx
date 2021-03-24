import ListComponent, {ListState} from "../component/ListComponent";
import {CONTAINER, TOKEN} from "../constant/ApiConstants";
import PopupYesNo from "../component/PopupYesNo";
import Flash from "../component/Flash";
import styles from "../main.module.scss";
import React from "react";
import {SelectInput} from "../component/SelectInput";
import {PermissionEnum, PermissionEnumHelper} from "../enum/PermissionEnum";
import Creatable from "react-select/creatable";
import FlashType from "../component/FlashType";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import ContainerHelper from "../helper/ContainerHelper";
import {ENDPOINT} from "../constant/Constants";

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

const CRE_USER_ID = 'cre-user';

const SEL_NEW_MODE = 'sel-new-mode';

class Collaborator extends ListComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.users = this.users.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
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
        if (isNaN(Number(this.state.userId))) {
            this.flashRef.current!.activate(FlashType.BAD, 'User is empty or not exist');
        } else if (!mode.value) {
            this.flashRef.current!.activate(FlashType.BAD, 'Mode have bad format or is empty');
        } else {
            let token = localStorage.getItem(TOKEN);
            if (token) {
                fetch(this.getEndpoint() + '/collaborator/' + this.state.userId, {
                    method: 'POST',
                    headers: {'x-auth-token': token},
                    body: JSON.stringify({mode: mode.value}),
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

    handleInputChange(newValue: any) {
        this.setState({userId: Number(newValue.value)});
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
                        <Creatable className={styles.creatable} id={CRE_USER_ID} options={this.state.users}
                                   onChange={this.handleInputChange}/>
                        <label htmlFor={SEL_NEW_MODE}>Mode</label>
                        <SelectInput id={SEL_NEW_MODE} name={SEL_NEW_MODE} options={PermissionEnumHelper.getOptions()}
                                     selected={PermissionEnumHelper.getName(PermissionEnum.RW)}/>
                        <button type="submit" className={styles.create} onClick={this.create}>Add new user</button>
                    </div> : ''}

                {this.state.container ? <h2 id='collaborators'>Collaborators</h2> : ''}
                {this.state.container ?
                    <table>
                        <thead>
                        <tr>
                            <th onClick={() => this.sortBy('nick', this.getEndpoint(), this.transformation)}>User name</th>
                            <th onClick={() => this.sortBy('mode', this.getEndpoint(), this.transformation)}>Mode</th>
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
                    : ''}
            </section>
        );
    }

}

export default Collaborator;
