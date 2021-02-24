import * as React from "react";
import styles from "../main.module.scss"
import {CONTAINER, DECIMAL_PLACES, ENDPOINT, SEQUENCE_EDIT, SEQUENCE_ID, URL_PREFIX} from "../constant/ApiConstants";
import ListComponent, {ListState} from "../component/ListComponent";
import Helper from "../helper/Helper";
import {ServerEnumHelper} from "../enum/ServerEnum";
import FetchHelper from "../helper/FetchHelper";

interface State extends ListState {
    blockId: number;
    block?: any;
}

class BlockUsagePage extends ListComponent<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            list: [],
            selectedContainer: this.props.match.params.id,
            blockId: this.props.match.params.blockId
        };
    }

    componentDidMount(): void {
        if (this.state.selectedContainer) {
            this.list();
            FetchHelper.fetch(ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + '/block/' + this.state.blockId, (response) => this.setState({block: response}));
        }
        Helper.resetStorage();
    }

    findName(key: number): string {
        return '';
    }

    getEndpoint() {
        return ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + '/block/' + this.state.blockId + '/usage';
    }

    create(): void {
        /* Empty on purpose */
    }

    update(key: number) {
        /* Empty on purpose */
    }

    detail(key: number) {
        localStorage.setItem(SEQUENCE_EDIT, 'Yes');
        localStorage.setItem(SEQUENCE_ID, key.toString());
        document.location.href = URL_PREFIX;
    }

    render() {
        return (
            <section className={styles.page}>
                <section className={styles.pageTable}>

                    {this.state.list.length > 0 ? <h2>Usages of {this.state.block?.acronym}</h2> : ''}

                    {this.state.list.length > 0 ?
                        <table>
                            <thead>
                            <tr>
                                <th onClick={() => this.sortBy('id')}>Id</th>
                                <th onClick={() => this.sortBy('sequenceName')}>Sequence name</th>
                                <th onClick={() => this.sortBy('sequenceType')}>Type</th>
                                <th onClick={() => this.sortBy('sequence')}>Sequence</th>
                                <th onClick={() => this.sortBy('sequenceFormula')}>Formula</th>
                                <th onClick={() => this.sortBy('sequenceMass')}>Mass</th>
                                <th>Family</th>
                                <th>N</th>
                                <th>C</th>
                                <th>Branch</th>
                                <th>Identifier</th>
                                <th>Block usages</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.list.map(sequence => (
                                <tr key={sequence.id}>
                                    <td>{sequence.id}</td>
                                    <td>{sequence.sequenceName}</td>
                                    <td>{sequence.sequenceType}</td>
                                    <td>{sequence.sequence}</td>
                                    <td>{sequence.formula}</td>
                                    <td>{sequence.mass.toFixed(DECIMAL_PLACES)}</td>
                                    <td>{sequence.family}</td>
                                    <td>{sequence.nModification}</td>
                                    <td>{sequence.cModification}</td>
                                    <td>{sequence.bModification}</td>
                                    <td>{sequence.identifier ?
                                        <a href={ServerEnumHelper.getLink(sequence.source, sequence.identifier)}
                                           target={'_blank'}
                                           rel={'noopener noreferrer'}>{ServerEnumHelper.getFullId(sequence.source, sequence.identifier)}</a> : ''}
                                    </td>
                                    <td>{sequence.blockUsages}</td>
                                    <td>
                                        <button className={styles.update}
                                                onClick={() => this.detail(sequence.id)}>Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        : ''
                    }
                </section>
            </section>
        )
    }

}

export default BlockUsagePage;
