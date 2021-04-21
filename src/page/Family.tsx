import ListComponent, {ListState} from "../component/ListComponent";
import {SFAMILY} from "../constant/ApiConstants";
import PopupYesNo from "../component/PopupYesNo";
import Flash from "../component/Flash";
import styles from "../main.module.scss";
import React from "react";
import TextInput from "../component/TextInput";
import ContainerHelper from "../helper/ContainerHelper";
import {ENDPOINT, SHOW_ID} from "../constant/Constants";

interface Props {
    containerId: number;
    type: string;
}

class Family extends ListComponent<Props, ListState> {

    constructor(props: Props) {
        super(props);
        this.getNameFirstUpper = this.getNameFirstUpper.bind(this);
        this.state = {list: [], selectedContainer: ContainerHelper.getSelectedContainer(), lastSortParam: this.props.type + 'FamilyName', lastSortOrder: 'asc'};
    }

    findName(key: number): string {
        return this.find(key).family;
    }

    getEndpoint() {
        return ENDPOINT + 'container/' + this.props.containerId + '/' + this.props.type + SFAMILY
    }

    create(): void {
        let name = document.getElementById('txt-new-' + this.props.type + '-family-name') as HTMLInputElement;
        this.defaultCreate(this.getEndpoint(), {family: name.value});
    }

    update(key: number): void {
        let family = document.getElementById('txt-edit-' + this.props.type + '-family-name') as HTMLInputElement;
        this.defaultUpdate(this.getEndpointWithId(key), key, {family: family.value});
    }

    getNameFirstUpper() {
        return this.props.type.charAt(0).toUpperCase() + this.props.type.substr(1);
    }

    render() {
        return (
            <section>
                <PopupYesNo label={"Really want to remove"} onYes={this.delete} ref={this.popupRef}/>
                <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>

                <h2>Create new {this.props.type} family</h2>
                <input type={'text'} id={'txt-new-' + this.props.type + '-family-name'}
                       onKeyDown={(e) => this.enterCall(e, this.create)} placeholder={'new family name'}/>
                <button onClick={this.create} className={styles.create}>Create new family</button>

                <h2 id={this.props.type + 'families'}>{this.getNameFirstUpper()} families - {this.state.list.length} rows</h2>
                <table>
                    <thead>
                    <tr>
                        {SHOW_ID ? <th onClick={() => this.sortBy('id')}>Id {this.sortIcons('id')}</th> : ''}
                        <th onClick={() => this.sortBy(this.props.type + 'FamilyName')}>family {this.sortIcons(this.props.type + 'FamilyName')}</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.list.map(family => (
                        <tr>
                            {SHOW_ID ? <td>{family.id}</td> : ''}
                            <td onClick={() => this.edit(family.id)}>{this.state.editable === family.id ?
                                <TextInput className={styles.filter} id={'txt-edit-' + this.props.type + '-family-name'}
                                           name={'txt-edit-' + this.props.type + '-family-name'}
                                           value={family.family}/> : family.family}</td>
                            <td>
                                {this.state.editable === family.id ? <button className={styles.update}
                                                                             onClick={() => this.update(family.id)}>Update</button> :
                                    <div/>}
                                {this.state.editable === family.id ?
                                    <button className={styles.delete} onClick={this.editEnd}>Cancel</button> : <div/>}
                                <button className={styles.delete} onClick={() => this.popup(family.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>
        );
    }

}

export default Family;
