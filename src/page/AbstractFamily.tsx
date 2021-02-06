import ListComponent, {ListState} from "../component/ListComponent";
import {ENDPOINT} from "../constant/ApiConstants";
import PopupYesNo from "../component/PopupYesNo";
import Flash from "../component/Flash";
import styles from "../main.module.scss";
import React from "react";
import TextInput from "../component/TextInput";

interface Props {
    containerId: number;
    type: string;
}

class Family extends ListComponent<Props, ListState> {

    constructor(props: Props) {
        super(props);
        this.state = {list: [], selectedContainer: this.getSelectedContainer()};
    }

    create(values: any): void {
    }

    delete(key: number): void {
    }

    list(): void {
        this.defaultList(ENDPOINT + 'container/' + this.props.containerId + '/' + this.props.type +'/family');
    }

    update(key: number): void {
    }

    render() {
        return (
            <section>
                <PopupYesNo label={"Realy want to remove family from container?"} onYes={this.delete} ref={this.popupRef}/>
                <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>
                { console.log(this.state.list)}
                { this.state.list.length > 0 ? <h2 id={this.props.type + 'Families'}>{this.props.type.charAt(0).toUpperCase() + this.props.type.substr(1)} Families</h2> : '' }
                {this.state.list.length > 0 ?
                    <table>
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Family</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.list.map(family => (
                            <tr>
                                <td>{family.id}</td>
                                <td onClick={() => this.edit(family.id)}>{this.state.editable === family.id ? <TextInput id={'sel-edit-' + this.props.type + '-family'} name={'sel-edit-' + this.props.type + '-family'} value={family.family} /> : family.family}</td>
                                <td>
                                    {this.state.editable === family.id ? <button className={styles.update} onClick={() => this.update(family.id)}>Update</button> : <div/>}
                                    {this.state.editable === family.id ? <button className={styles.delete} onClick={this.editEnd}>Cancel</button> : <div/>}
                                    <button className={styles.delete} onClick={() => this.popup(family.id)}>Delete</button>
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

export default Family;
