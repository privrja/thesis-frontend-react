import * as React from "react";
import styles from "../main.module.scss"
import {CONTAINER, ELEMENT_LARGE_SMILES, SEQUENCE_EDIT, SEQUENCE_ID, SSEQUENCE} from "../constant/ApiConstants";
import ListComponent, {ListState} from "../component/ListComponent";
import Helper from "../helper/Helper";
import {ServerEnumHelper} from "../enum/ServerEnum";
import FetchHelper from "../helper/FetchHelper";
import {
    SORT_B_MODIFICATION,
    SORT_C_MODIFICATION,
    SORT_FAMILY,
    SORT_ID, SORT_IDENTIFIER, SORT_N_MODIFICATION, SORT_ORGANISM,
    SORT_SEQUENCE,
    SORT_SEQUENCE_FORMULA, SORT_SEQUENCE_MASS,
    SORT_SEQUENCE_NAME,
    SORT_SEQUENCE_TYPE,
    SORT_USAGES, TXT_FILTER_ORGANISM,
    TXT_FILTER_SEQUENCE,
    TXT_FILTER_SEQUENCE_B_MODIFICATION,
    TXT_FILTER_SEQUENCE_C_MODIFICATION,
    TXT_FILTER_SEQUENCE_FAMILY,
    TXT_FILTER_SEQUENCE_FORMULA,
    TXT_FILTER_SEQUENCE_ID,
    TXT_FILTER_SEQUENCE_IDENTIFIER,
    TXT_FILTER_SEQUENCE_MASS_FROM,
    TXT_FILTER_SEQUENCE_MASS_TO,
    TXT_FILTER_SEQUENCE_N_MODIFICATION,
    TXT_FILTER_SEQUENCE_NAME,
    TXT_FILTER_SEQUENCE_TYPE, TXT_FILTER_SEQUENCE_USAGES
} from "../constant/DefaultConstants";
import {DECIMAL_PLACES, ENDPOINT, URL_PREFIX} from "../constant/Constants";
import FlashType from "../component/FlashType";
import {ERROR_SOMETHING_GOES_WRONG} from "../constant/FlashConstants";
// @ts-ignore
import * as SmilesDrawer from 'smiles-drawer';
import PopupSmilesDrawer from "../component/PopupSmilesDrawer";
import PopupYesNo from "../component/PopupYesNo";
import Flash from "../component/Flash";

interface State extends ListState {
    blockId: number;
    block?: any;
}

let largeSmilesDrawer: SmilesDrawer.Drawer;

class BlockUsagePage extends ListComponent<any, State> {

    popupSmilesRef: React.RefObject<PopupSmilesDrawer>;

    constructor(props: any) {
        super(props);
        this.popupSmilesRef = React.createRef();
        this.filter = this.filter.bind(this);
        this.clear = this.clear.bind(this);
        this.clone = this.clone.bind(this);
        this.cloneTransformation = this.cloneTransformation.bind(this);
        this.state = {
            list: [],
            selectedContainer: this.props.match.params.id,
            blockId: this.props.match.params.blockId
        };
    }

    componentDidMount(): void {
        if (this.state.selectedContainer) {
            this.list();
            FetchHelper.fetch(ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + '/block/' + this.state.blockId, 'GET', (response) => this.setState({block: response}));
        }
        Helper.resetStorage();
        const large = document.getElementById(ELEMENT_LARGE_SMILES);
        largeSmilesDrawer = new SmilesDrawer.Drawer({
            width: large!.clientWidth,
            height: large!.clientHeight,
            compactDrawing: false,
        });
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

    clone(key: number) {
        FetchHelper.fetch(ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + SSEQUENCE + '/' + key + '/clone', 'POST', this.cloneTransformation, () => this.flashRef.current!.activate(FlashType.BAD, ERROR_SOMETHING_GOES_WRONG));
    }

    delete(key: number): void {
        this.defaultDelete(ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + SSEQUENCE + '/' + key, key);
    }

    cloneTransformation() {
        this.flashRef.current!.activate(FlashType.OK);
        this.list();
    }

    filter() {
        Helper.sequenceFilter(this, true);
    }

    clear() {
        Helper.sequenceClear(this, true);
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
                    <PopupYesNo label={"Really want to delete"} onYes={this.delete} ref={this.popupRef}/>
                    <PopupSmilesDrawer id={ELEMENT_LARGE_SMILES} className={styles.popupLarge}
                                       ref={this.popupSmilesRef}/>
                    <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>
                    <h2>Usages of {this.state.block?.acronym}</h2>
                    <table>
                        <thead>
                        <tr>
                            <th onClick={() => this.sortBy(SORT_ID)}>Id {this.sortIcons(SORT_ID)}</th>
                            <th onClick={() => this.sortBy(SORT_SEQUENCE_NAME)}>Sequence
                                name {this.sortIcons(SORT_SEQUENCE_NAME)}</th>
                            <th onClick={() => this.sortBy(SORT_SEQUENCE_TYPE)}>Type {this.sortIcons(SORT_SEQUENCE_TYPE)}</th>
                            <th onClick={() => this.sortBy(SORT_SEQUENCE)}>Sequence {this.sortIcons(SORT_SEQUENCE)}</th>
                            <th onClick={() => this.sortBy(SORT_SEQUENCE_FORMULA)}>Formula {this.sortIcons(SORT_SEQUENCE_FORMULA)}</th>
                            <th onClick={() => this.sortBy(SORT_SEQUENCE_MASS)}>Mass {this.sortIcons(SORT_SEQUENCE_MASS)}</th>
                            <th onClick={() => this.sortBy(SORT_FAMILY)}>Family {this.sortIcons(SORT_FAMILY)}</th>
                            <th onClick={() => this.sortBy(SORT_ORGANISM)}>Organism {this.sortIcons(SORT_ORGANISM)}</th>
                            <th onClick={() => this.sortBy(SORT_N_MODIFICATION)}>N {this.sortIcons(SORT_N_MODIFICATION)}</th>
                            <th onClick={() => this.sortBy(SORT_C_MODIFICATION)}>C {this.sortIcons(SORT_C_MODIFICATION)}</th>
                            <th onClick={() => this.sortBy(SORT_B_MODIFICATION)}>Branch {this.sortIcons(SORT_B_MODIFICATION)}</th>
                            <th onClick={() => this.sortBy(SORT_IDENTIFIER)}>Identifier {this.sortIcons(SORT_IDENTIFIER)}</th>
                            <th onClick={() => this.sortBy(SORT_USAGES)}>Block usages {this.sortIcons(SORT_USAGES)}</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_ID}
                                       placeholder={'Id'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_NAME}
                                       placeholder={'Name'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_TYPE}
                                       placeholder={'Type'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE}
                                       placeholder={'Sequence'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_SEQUENCE_FORMULA} placeholder={'Formula'}/></td>
                            <td>
                                <input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_SEQUENCE_MASS_FROM} placeholder={'Mass from'}/>
                                <input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_SEQUENCE_MASS_TO} placeholder={'Mass to'}/>
                            </td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_FAMILY}
                                       placeholder={'Family'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_ORGANISM}
                                       placeholder={'Organism'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_SEQUENCE_N_MODIFICATION} placeholder={'N Modification'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_SEQUENCE_C_MODIFICATION} placeholder={'C Modification'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_SEQUENCE_B_MODIFICATION} placeholder={'B Modification'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)}
                                       id={TXT_FILTER_SEQUENCE_IDENTIFIER} placeholder={'Identifier'}/></td>
                            <td><input className={styles.filter} type={'text'}
                                       onKeyDown={(e) => this.enterCall(e, this.filter)} id={TXT_FILTER_SEQUENCE_USAGES}
                                       placeholder={'Usages'}/></td>
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
                                <td>{sequence.organism}</td>
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

}

export default BlockUsagePage;
