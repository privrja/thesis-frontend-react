import * as React from "react";
import "react-app-polyfill/ie11";
import styles from "../main.module.scss"
import {CONTAINER, ENDPOINT, SSEQUENCE} from "../constant/ApiConstants";
import Flash from "../component/Flash";
import PopupYesNo from "../component/PopupYesNo";
import ListComponent, {ListState} from "../component/ListComponent";
import {ServerEnumHelper} from "../enum/ServerEnum";

class SequencePage extends ListComponent<any, ListState> {

    constructor(props: any) {
        super(props);
        this.state = {list: [], selectedContainer: this.props.match.params.id};
    }

    findName(key: number): string {
        return this.find(key).modificationName;
    }

    getEndpoint() {
        return ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + SSEQUENCE;
    }

    render() {
        return (
            <section className={styles.page}>
                <section className={styles.pageTable}>
                    <h1>Sequences</h1>
                    <PopupYesNo label={"Really want to delete sequence?"} onYes={this.delete} ref={this.popupRef}/>
                    <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>
                    {this.state.list.length > 0 ?
                        <table>
                            <thead>
                            <tr>
                                <th>Id</th>
                                <th>Sequence name</th>
                                <th>Type</th>
                                <th>Formula</th>
                                <th>Mass</th>
                                <th>Family</th>
                                <th>N</th>
                                <th>C</th>
                                <th>Branch</th>
                                <th>Identifier</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.list.map(sequence => (
                                <tr key={sequence.id}>
                                    <td>{sequence.id}</td>
                                    <td>{sequence.sequenceName}</td>
                                    <td>{sequence.sequenceType}</td>
                                    <td>{sequence.formula}</td>
                                    <td>{sequence.mass}</td>
                                    <td>{sequence.family}</td>
                                    <td>{sequence.nModification}</td>
                                    <td>{sequence.cModification}</td>
                                    <td>{sequence.bModification}</td>
                                    <td>{sequence.identifier ? <a href={ServerEnumHelper.getLink(sequence.source, sequence.identifier)}
                                           target={'_blank'}
                                           rel={'noopener noreferrer'}>{ServerEnumHelper.getFullId(sequence.source, sequence.identifier)}</a> : '' }
                                    </td>
                                    <td>
                                        {this.state.editable === sequence.id ? <button className={styles.update}
                                                                                       onClick={() => this.update(sequence.id)}>Update</button> :
                                            <div/>}
                                        {this.state.editable === sequence.id ?
                                            <button className={styles.delete} onClick={this.editEnd}>Cancel</button> :
                                            <div/>}
                                        <button className={styles.update}>Detail</button>
                                        <button className={styles.delete}
                                                onClick={() => this.popup(sequence.id)}>Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        : <div/>
                    }
                </section>
            </section>
        )
    }

    create(values: any): void {
        /* Empty on purpose */
    }

    update(key: number): void {
        /* Empty on purpose */
    }

}

export default SequencePage;
