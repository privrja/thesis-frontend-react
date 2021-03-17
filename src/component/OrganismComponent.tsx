import ListComponent, {ListState} from "./ListComponent";
import {ENDPOINT} from "../constant/ApiConstants";
import ContainerHelper from "../helper/ContainerHelper";
import PopupYesNo from "./PopupYesNo";
import Flash from "./Flash";
import styles from "../main.module.scss";
import TextInput from "./TextInput";
import React from "react";

class OrganismComponent extends ListComponent<any, ListState> {

    constructor(props: any) {
        super(props);
        this.state = {list: [], selectedContainer: ContainerHelper.getSelectedContainer()};
    }

    create(): void {
        let organism = document.getElementById('txt-new-organism') as HTMLInputElement;
        this.defaultCreate(this.getEndpoint(), {organism: organism.value});
    }

    findName(key: number): string {
        return this.find(key).organism;
    }

    getEndpoint(): string {
        return ENDPOINT + 'container/' + this.state.selectedContainer + '/organism';
    }

    update(key: number): void {
        let organism = document.getElementById('txt-edit-organism') as HTMLInputElement;
        this.defaultUpdate(this.getEndpointWithId(key), key, {organism: organism.value});
    }

    render() {
        return (
            <section>
                <PopupYesNo label={"Really want to remove organism from container?"} onYes={this.delete} ref={this.popupRef}/>
                <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>

                <h2>Create new Organism</h2>
                <input type={'text'} id={'txt-new-organism'} onKeyDown={(e) => this.enterCall(e, this.create)} placeholder={'New Organism'}/>
                <button onClick={this.create} className={styles.create}>Create new Family</button>

                { this.state.list.length > 0 ? <h2 id={'Organisms'}>Organisms</h2> : '' }
                {this.state.list.length > 0 ?
                    <table>
                        <thead>
                        <tr>
                            <th onClick={() => this.sortBy('id')}>Id</th>
                            <th onClick={() => this.sortBy('organism')}>Organism</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.list.map(organism => (
                            <tr>
                                <td>{organism.id}</td>
                                <td onClick={() => this.edit(organism.id)}>{this.state.editable === organism.id ? <TextInput id={'txt-edit-organism'} name={'txt-edit-organism'} value={organism.organism} /> : organism.organism}</td>
                                <td>
                                    {this.state.editable === organism.id ? <button className={styles.update} onClick={() => this.update(organism.id)}>Update</button> : <div/>}
                                    {this.state.editable === organism.id ? <button className={styles.delete} onClick={this.editEnd}>Cancel</button> : <div/>}
                                    <button className={styles.delete} onClick={() => this.popup(organism.id)}>Delete</button>
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

export default OrganismComponent;
