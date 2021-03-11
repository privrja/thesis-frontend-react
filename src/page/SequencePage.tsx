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

const SORT_ID = 'id';
const SORT_SEQUENCE_NAME = 'sequenceName';
const SORT_SEQUENCE_TYPE = 'sequenceType';
const SORT_SEQUENCE = 'sequence';
const SORT_FORMULA = 'sequenceFormula';
const SORT_MASS_FROM = 'sequenceMassFrom';
const SORT_MASS_TO = 'sequenceMassTo';
const SORT_FAMILY = 'family';
const SORT_N_MODIFICATION = 'nModification';
const SORT_C_MODIFICATION = 'cModification';
const SORT_B_MODIFICATION = 'bModification';
const SORT_IDENTIFIER = 'identifier';
const SORT_MASS = 'sequenceMass';

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
                                                        this.addFilter('', SORT_ID, id.value)
                                                        , SORT_SEQUENCE_NAME, name.value)
                                                    , SORT_SEQUENCE_TYPE, sequenceType.value)
                                                , SORT_SEQUENCE, sequence.value)
                                            , SORT_FORMULA, formula.value)
                                        , SORT_MASS_FROM, massFrom.value)
                                    , SORT_MASS_TO, massTo.value)
                                , SORT_FAMILY, family.value)
                            , SORT_N_MODIFICATION, nModification.value)
                        , SORT_C_MODIFICATION, cModification.value)
                    , SORT_B_MODIFICATION, bModification.value)
                , SORT_IDENTIFIER, identifier.value);
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
                            <th onClick={() => this.sortBy(SORT_ID)}>Id {this.sortIcons(SORT_ID)}</th>
                            <th onClick={() => this.sortBy(SORT_SEQUENCE_NAME)}>Sequence name {this.sortIcons(SORT_SEQUENCE_NAME)}</th>
                            <th onClick={() => this.sortBy(SORT_SEQUENCE_TYPE)}>Type {this.sortIcons(SORT_SEQUENCE_TYPE)}</th>
                            <th onClick={() => this.sortBy(SORT_SEQUENCE)}>Sequence {this.sortIcons(SORT_SEQUENCE)}</th>
                            <th onClick={() => this.sortBy(SORT_FORMULA)}>Formula {this.sortIcons(SORT_FORMULA)}</th>
                            <th onClick={() => this.sortBy(SORT_MASS)}>Mass {this.sortIcons(SORT_MASS)}</th>
                            <th onClick={() => this.sortBy(SORT_FAMILY)}>Family {this.sortIcons(SORT_FAMILY)}</th>
                            <th onClick={() => this.sortBy(SORT_N_MODIFICATION)}>N {this.sortIcons(SORT_N_MODIFICATION)}</th>
                            <th onClick={() => this.sortBy(SORT_C_MODIFICATION)}>C {this.sortIcons(SORT_C_MODIFICATION)}</th>
                            <th onClick={() => this.sortBy(SORT_B_MODIFICATION)}>Branch {this.sortIcons(SORT_B_MODIFICATION)}</th>
                            <th onClick={() => this.sortBy(SORT_IDENTIFIER)}>Identifier {this.sortIcons(SORT_IDENTIFIER)}</th>
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
