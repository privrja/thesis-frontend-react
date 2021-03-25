import ListComponent, {ListState} from "./ListComponent";
import ContainerHelper from "../helper/ContainerHelper";
import PopupYesNo from "./PopupYesNo";
import Flash from "./Flash";
import styles from "../main.module.scss";
import TextInput from "./TextInput";
import React from "react";
import {ENDPOINT, SHOW_ID} from "../constant/Constants";

interface Props {
    containerId: number;
}

class OrganismComponent extends ListComponent<Props, ListState> {

    constructor(props: Props) {
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
        return ENDPOINT + 'container/' + this.props.containerId + '/organism';
    }

    update(key: number): void {
        let organism = document.getElementById('txt-edit-organism') as HTMLInputElement;
        this.defaultUpdate(this.getEndpointWithId(key), key, {organism: organism.value});
    }

    render() {
        return (
            <section>
                <PopupYesNo label={"Really want to remove"} onYes={this.delete} ref={this.popupRef}/>
                <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>

                <h2>Create new Organism</h2>
                <input type={'text'} id={'txt-new-organism'} onKeyDown={(e) => this.enterCall(e, this.create)}
                       placeholder={'New Organism'}/>
                <button onClick={this.create} className={styles.create}>Create new Family</button>

                <h2 id={'Organisms'}>Organisms - {this.state.list.length} rows</h2>
                <table>
                    <thead>
                    <tr>
                        {SHOW_ID ? <th onClick={() => this.sortBy('id')}>Id</th> : ''}
                        <th onClick={() => this.sortBy('organism')}>Organism</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.list.map(organism => (
                        <tr>
                            {SHOW_ID ? <td>{organism.id}</td> : ''}
                            <td onClick={() => this.edit(organism.id)}>{this.state.editable === organism.id ?
                                <TextInput id={'txt-edit-organism'} name={'txt-edit-organism'}
                                           value={organism.organism}/> : organism.organism}</td>
                            <td>
                                {this.state.editable === organism.id ? <button className={styles.update}
                                                                               onClick={() => this.update(organism.id)}>Update</button> :
                                    <div/>}
                                {this.state.editable === organism.id ?
                                    <button className={styles.delete} onClick={this.editEnd}>Cancel</button> : <div/>}
                                <button className={styles.delete} onClick={() => this.popup(organism.id)}>Delete
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

export default OrganismComponent;
