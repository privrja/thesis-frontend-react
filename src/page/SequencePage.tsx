import * as React from "react";
import "react-app-polyfill/ie11";
import styles from "../main.module.scss"
import {
    CONTAINER,
    DECIMAL_PLACES, ELEMENT_LARGE_SMILES,
    ENDPOINT,
    SEQUENCE_EDIT,
    SEQUENCE_ID,
    SSEQUENCE,
    URL_PREFIX
} from "../constant/ApiConstants";
import Flash from "../component/Flash";
import PopupYesNo from "../component/PopupYesNo";
import ListComponent, {ListState} from "../component/ListComponent";
import {ServerEnumHelper} from "../enum/ServerEnum";
import Helper from "../helper/Helper";
import FetchHelper from "../helper/FetchHelper";
import FlashType from "../component/FlashType";
import {ERROR_SOMETHING_GOES_WRONG} from "../constant/FlashConstants";
import ContainerHelper from "../helper/ContainerHelper";
// @ts-ignore
import * as SmilesDrawer from 'smiles-drawer';
import PopupSmilesDrawer from "../component/PopupSmilesDrawer";

const TXT_FILTER_SEQUENCE_ID = 'txt-filter-sequenceId';
const TXT_FILTER_SEQUENCE_NAME = 'txt-filter-sequenceName';
const TXT_FILTER_SEQUENCE_TYPE = 'txt-filter-sequenceType';
const TXT_FILTER_SEQUENCE = 'txt-filter-sequence';
const TXT_FILTER_SEQUENCE_FORMULA = 'txt-filter-sequenceFormula';
const TXT_FILTER_SEQUENCE_MASS_FROM = 'txt-filter-sequenceMassFrom';
const TXT_FILTER_SEQUENCE_MASS_TO = 'txt-filter-sequenceMassTo';
const TXT_FILTER_SEQUENCE_FAMILY = 'txt-filter-sequenceFamily';
const TXT_FILTER_SEQUENCE_N_MODIFICATION = 'txt-filter-sequenceNModification';
const TXT_FILTER_SEQUENCE_C_MODIFICATION = 'txt-filter-sequenceCModification';
const TXT_FILTER_SEQUENCE_B_MODIFICATION = 'txt-filter-sequenceBModification';
const TXT_FILTER_SEQUENCE_IDENTIFIER = 'txt-filter-sequenceIdentifier';

let largeSmilesDrawer: SmilesDrawer.Drawer;

class SequencePage extends ListComponent<any, ListState> {

    popupSmilesRef: React.RefObject<PopupSmilesDrawer>;

    constructor(props: any) {
        super(props);
        this.popupSmilesRef = React.createRef();
        this.detail = this.detail.bind(this);
        this.clone = this.clone.bind(this);
        this.cloneTransformation = this.cloneTransformation.bind(this);
        this.filter = this.filter.bind(this);
        this.clear = this.clear.bind(this);
        this.state = {list: [], selectedContainer: this.props.match.params.id, selectedContainerName: ContainerHelper.getSelectedContainerName()};
    }

    componentDidMount(): void {
        super.componentDidMount();
        Helper.resetStorage();
        const large = document.getElementById(ELEMENT_LARGE_SMILES);
        largeSmilesDrawer = new SmilesDrawer.Drawer({
            width: large!.clientWidth,
            height: large!.clientHeight,
            compactDrawing: false,
        });
    }

    findName(key: number): string {
        return this.find(key).modificationName;
    }

    getEndpoint() {
        return ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + SSEQUENCE;
    }

    detail(key: number) {
        localStorage.setItem(SEQUENCE_EDIT, 'Yes');
        localStorage.setItem(SEQUENCE_ID, key.toString());
        document.location.href = URL_PREFIX;
    }

    clone(key: number) {
        FetchHelper.fetch(this.getEndpointWithId(key) + '/clone', 'POST', this.cloneTransformation, () => this.flashRef.current!.activate(FlashType.BAD, ERROR_SOMETHING_GOES_WRONG));
    }

    cloneTransformation() {
        this.flashRef.current!.activate(FlashType.OK);
        this.list();
    }

    filter() {
        let id = document.getElementById(TXT_FILTER_SEQUENCE_ID) as HTMLInputElement;
        let name = document.getElementById(TXT_FILTER_SEQUENCE_NAME) as HTMLInputElement;
        let sequenceType = document.getElementById(TXT_FILTER_SEQUENCE_TYPE) as HTMLInputElement;
        let sequence = document.getElementById(TXT_FILTER_SEQUENCE) as HTMLInputElement;
        let formula = document.getElementById(TXT_FILTER_SEQUENCE_FORMULA) as HTMLInputElement;
        let massFrom = document.getElementById(TXT_FILTER_SEQUENCE_MASS_FROM) as HTMLInputElement;
        let massTo = document.getElementById(TXT_FILTER_SEQUENCE_MASS_TO) as HTMLInputElement;
        let family = document.getElementById(TXT_FILTER_SEQUENCE_FAMILY) as HTMLInputElement;
        let nModification = document.getElementById(TXT_FILTER_SEQUENCE_N_MODIFICATION) as HTMLInputElement;
        let cModification = document.getElementById(TXT_FILTER_SEQUENCE_C_MODIFICATION) as HTMLInputElement;
        let bModification = document.getElementById(TXT_FILTER_SEQUENCE_B_MODIFICATION) as HTMLInputElement;
        let identifier = document.getElementById(TXT_FILTER_SEQUENCE_IDENTIFIER) as HTMLInputElement;

        let filter =
            this.addFilter(
                this.addFilter(
                    this.addFilter(
                        this.addFilter(
                            this.addFilter(
                                this.addFilter(
                                    this.addFilter(
                                        this.addFilter(
                                            this.addFilter(
                                                this.addFilter(
                                                    this.addFilter(
                                                        this.addFilter('', 'id', id.value)
                                                        , 'sequenceName', name.value)
                                                    , 'sequenceType', sequenceType.value)
                                                , 'sequence', sequence.value)
                                            , 'sequenceFormula', formula.value)
                                        , 'sequenceMassFrom', massFrom.value)
                                    , 'sequenceMassTo', massTo.value)
                                , 'family', family.value)
                            , 'nModification', nModification.value)
                        , 'cModification', cModification.value)
                    , 'bModification', bModification.value)
                , 'identifier', identifier.value);
        this.setState({filter: filter}, this.list);
    }

    clear() {
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE_ID);
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE_NAME);
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE_TYPE);
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE);
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE_FORMULA);
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE_MASS_FROM);
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE_MASS_TO);
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE_FAMILY);
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE_N_MODIFICATION);
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE_C_MODIFICATION);
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE_B_MODIFICATION);
        this.clearConcreteFilter(TXT_FILTER_SEQUENCE_IDENTIFIER);
        this.setState({lastSortOrder: undefined, lastSortParam: undefined}, this.filter);
    }

    /**
     * Show popup with large result
     * @param smiles
     */
    showLargeSmiles(smiles: string) {
        this.popupSmilesRef.current!.activate();
        SmilesDrawer.parse(smiles, function (tree: any) {
            largeSmilesDrawer.draw(tree, ELEMENT_LARGE_SMILES);
        });
    }


    render() {
        return (
            <section className={styles.page}>
                <section className={styles.pageTable}>
                    <PopupYesNo label={"Really want to delete sequence?"} onYes={this.delete} ref={this.popupRef}/>
                    <PopupSmilesDrawer id={ELEMENT_LARGE_SMILES} className={styles.popupLarge}
                                       ref={this.popupSmilesRef}/>
                    <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>
                    <h2>List of Sequences - {this.state.selectedContainerName}</h2>
                    <table>
                        <thead>
                        <tr>
                            <th onClick={() => this.sortBy('id')}>Id</th>
                            <th onClick={() => this.sortBy('sequenceName')}>Sequence name</th>
                            <th onClick={() => this.sortBy('sequenceType')}>Type</th>
                            <th onClick={() => this.sortBy('sequence')}>Sequence</th>
                            <th onClick={() => this.sortBy('sequenceFormula')}>Formula</th>
                            <th onClick={() => this.sortBy('sequenceMass')}>Mass</th>
                            <th onClick={() => this.sortBy('family')}>Family</th>
                            <th onClick={() => this.sortBy('nModification')}>N</th>
                            <th onClick={() => this.sortBy('cModification')}>C</th>
                            <th onClick={() => this.sortBy('bModification')}>Branch</th>
                            <th onClick={() => this.sortBy('identifier')}>Identifier</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_ID} placeholder={'Id'}/></td>
                            <td><input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_NAME} placeholder={'Name'}/></td>
                            <td><input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_TYPE} placeholder={'Type'}/></td>
                            <td><input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE} placeholder={'Sequence'}/></td>
                            <td><input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_FORMULA} placeholder={'Formula'}/></td>
                            <td>
                                <input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_MASS_FROM} placeholder={'Mass from'}/>
                                <input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_MASS_TO} placeholder={'Mass to'}/>
                            </td>
                            <td><input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_FAMILY} placeholder={'Family'}/></td>
                            <td><input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_N_MODIFICATION} placeholder={'N Modification'}/></td>
                            <td><input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_C_MODIFICATION} placeholder={'C Modification'}/></td>
                            <td><input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_B_MODIFICATION} placeholder={'B Modification'}/></td>
                            <td><input className={styles.filter} type={'text'} onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_IDENTIFIER} placeholder={'Identifier'}/></td>
                            <td>
                                <button onClick={this.filter}>Filter</button>
                                <button className={styles.delete} onClick={this.clear}>Clear</button>
                            </td>
                        </tr>
                        {this.state.list.length > 0 && this.state.list.map(sequence => (
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
                                <td>
                                    {this.state.editable === sequence.id ? <button className={styles.update}
                                                                                   onClick={() => this.update(sequence.id)}>Update</button> :
                                        <div/>}
                                    {this.state.editable === sequence.id ?
                                        <button className={styles.delete} onClick={this.editEnd}>Cancel</button> :
                                        <div/>}
                                    <button className={styles.update} onClick={() => this.detail(sequence.id)}>Detail
                                    </button>
                                    <button onClick={() => this.showLargeSmiles(sequence.smiles)}>Show</button>
                                    <button className={styles.create} onClick={() => this.clone(sequence.id)}>Clone
                                    </button>
                                    <button className={styles.delete}
                                            onClick={() => this.popup(sequence.id)}>Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
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
