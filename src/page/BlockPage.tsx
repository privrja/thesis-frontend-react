import * as React from "react";
import "react-app-polyfill/ie11";
import styles from "../main.module.scss"
import {
    SBLOCK,
    CONTAINER,
    ENDPOINT,
    TOKEN,
    EDITOR_BACK,
    EDITOR_ITEM,
    EDITOR_SMILES,
    URL_PREFIX,
    DECIMAL_PLACES,
    EDITOR_NEW_BLOCK_NAME,
    EDITOR_NEW_BLOCK_ACRONYM,
    EDITOR_NEW_BLOCK_FORMULA,
    EDITOR_NEW_BLOCK_SMILES
} from "../constant/ApiConstants";
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import PopupYesNo from "../component/PopupYesNo";
import TextInput from "../component/TextInput";
import ListComponent, {ListState} from "../component/ListComponent";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import {ServerEnumHelper} from "../enum/ServerEnum";
import {SelectInput} from "../component/SelectInput";
import PopupSmilesDrawer from "../component/PopupSmilesDrawer";
// @ts-ignore
import * as SmilesDrawer from 'smiles-drawer';

interface State extends ListState {
    list: Block[];
}

interface Block {
    id: number;
    blockName: string;
    acronym: string;
    formula: string;
    mass: number;
    losses: string;
    smiles: string;
    uniqueSmiles: string;
    family: string;
    source: number;
    identifier: string;
}

const TXT_EDIT_BLOCK_NAME = 'txt-edit-blockName';
const TXT_EDIT_ACRONYM = 'txt-edit-acronym';
const TXT_EDIT_FORMULA = 'txt-edit-formula';
const TXT_EDIT_MASS = 'txt-edit-mass';
const TXT_EDIT_LOSSES = 'txt-edit-losses';
const TXT_EDIT_SMILES = 'txt-edit-smiles';
const TXT_EDIT_IDENTIFIER = 'txt-edit-identifier';
const SEL_EDIT_SOURCE = 'sel-edit-source';
const BLOCK_NAME = 'blockName';
const BLOCK_ACRONYM = 'acronym';
const BLOCK_FORMULA = 'formula';
const BLOCK_SMILES = 'smiles';
const TXT_FILTER_BLOCK_ID = 'txt-filter-blockId';
const TXT_FILTER_BLOCK_NAME = 'txt-filter-blockName';
const TXT_FILTER_BLOCK_ACRONYM = 'txt-filter-blockAcronym';
const TXT_FILTER_BLOCK_FORMULA = 'txt-filter-blockFormula';
const TXT_FILTER_BLOCK_MASS_FROM = 'txt-filter-blockMassFrom';
const TXT_FILTER_BLOCK_MASS_TO = 'txt-filter-blockMassTo';
const TXT_FILTER_BLOCK_LOSSES = 'txt-filter-blockLosses';
const TXT_FILTER_BLOCK_FAMILY = 'txt-filter-blockFamily';
const TXT_FILTER_BLOCK_SMILES = 'txt-filter-blockSmiles';
const TXT_FILTER_BLOCK_IDENTIFIER = 'txt-filter-blockIdentifier';

let largeSmilesDrawer: SmilesDrawer.Drawer;
const ELEMENT_LARGE_SMILES = 'popupLargeSmiles';

class BlockPage extends ListComponent<any, State> {

    popupSmilesRef: React.RefObject<PopupSmilesDrawer>;

    constructor(props: any) {
        super(props);
        this.popupSmilesRef = React.createRef();
        this.showLargeSmiles = this.showLargeSmiles.bind(this);
        this.filter = this.filter.bind(this);
        this.clear = this.clear.bind(this);
        this.state = {list: [], selectedContainer: this.props.match.params.id};
    }

    componentDidMount() {
        if (this.state.selectedContainer) {
            let key = Number(localStorage.getItem(EDITOR_ITEM));
            if (key === -1) {
                this.defaultListTransformation(this.getEndpoint(), response => {
                    this.setState({list: response});
                    (document.getElementById(BLOCK_NAME) as HTMLInputElement).value = localStorage.getItem(EDITOR_NEW_BLOCK_NAME) ?? (document.getElementById(BLOCK_NAME) as HTMLInputElement).value;
                    (document.getElementById(BLOCK_ACRONYM) as HTMLInputElement).value = localStorage.getItem(EDITOR_NEW_BLOCK_ACRONYM) ?? '';
                    (document.getElementById(BLOCK_FORMULA) as HTMLInputElement).value = localStorage.getItem(EDITOR_SMILES) ? '' : localStorage.getItem(EDITOR_NEW_BLOCK_FORMULA) ?? '';
                    (document.getElementById(BLOCK_SMILES) as HTMLInputElement).value = localStorage.getItem(EDITOR_SMILES) ?? localStorage.getItem(EDITOR_NEW_BLOCK_SMILES) ?? '';
                    this.resetStorage(key);
                });
            } else {
                this.defaultListTransformation(this.getEndpoint(), response => {
                    if (!isNaN(key)) {
                        this.setState({editable: key});
                        response.forEach((block: any, index: number, array: any[]) => {
                            if (block.id === key) {
                                array[index].smiles = localStorage.getItem(EDITOR_SMILES) ?? block.smiles;
                                array[index].uniqueSmiles = localStorage.getItem(EDITOR_SMILES) ?? block.smiles;
                            }
                        });
                    }
                    this.setState({list: response});
                    this.resetStorage(key);
                });
            }
        }
        const large = document.getElementById(ELEMENT_LARGE_SMILES);
        largeSmilesDrawer = new SmilesDrawer.Drawer({
            width: large!.clientWidth,
            height: large!.clientHeight,
            compactDrawing: false,
        });
    }

    resetStorage(key: number) {
        if (key) {
            localStorage.removeItem(EDITOR_ITEM);
            localStorage.removeItem(EDITOR_SMILES);
            localStorage.removeItem(EDITOR_BACK);
            localStorage.removeItem(EDITOR_NEW_BLOCK_NAME);
            localStorage.removeItem(EDITOR_NEW_BLOCK_ACRONYM);
            localStorage.removeItem(EDITOR_NEW_BLOCK_FORMULA);
            localStorage.removeItem(EDITOR_NEW_BLOCK_SMILES);
        }
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

    findName(key: number): string {
        return this.find(key).acronym;
    }

    getEndpoint() {
        return ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + SBLOCK;
    }

    create(): void {
        let blockName = document.getElementById(BLOCK_NAME) as HTMLInputElement;
        let acronym = document.getElementById(BLOCK_ACRONYM) as HTMLInputElement;
        let formula = document.getElementById(BLOCK_FORMULA) as HTMLInputElement;
        let smiles = document.getElementById(BLOCK_SMILES) as HTMLInputElement;
        this.defaultCreate(this.getEndpoint(), {
            blockName: blockName.value,
            acronym: acronym.value,
            formula: formula.value,
            smiles: smiles.value
        });
    }

    update(key: number) {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            let name = document.getElementById(TXT_EDIT_BLOCK_NAME) as HTMLInputElement;
            let acronym = document.getElementById(TXT_EDIT_ACRONYM) as HTMLInputElement;
            let formula = document.getElementById(TXT_EDIT_FORMULA) as HTMLInputElement;
            let mass = document.getElementById(TXT_EDIT_MASS) as HTMLInputElement;
            let losses = document.getElementById(TXT_EDIT_LOSSES) as HTMLInputElement;
            let smiles = document.getElementById(TXT_EDIT_SMILES) as HTMLInputElement;
            let source = document.getElementById(SEL_EDIT_SOURCE) as HTMLSelectElement;
            let identifier = document.getElementById(TXT_EDIT_IDENTIFIER) as HTMLInputElement;
            fetch(this.getEndpointWithId(key), {
                method: 'PUT',
                headers: {'x-auth-token': token},
                body: JSON.stringify({
                    blockName: name.value,
                    acronym: acronym.value,
                    formula: formula.value,
                    mass: mass.value,
                    losses: losses.value,
                    smiles: smiles.value,
                    source: source.value,
                    identifier: identifier.value
                })
            }).then(response => {
                if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK, 'Block ' + this.findName(key) + ' updated');
                    this.list();
                } else {
                    response.json().then(data => {
                        this.flashRef.current!.activate(FlashType.BAD, data.message);
                    });
                }
            });
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
        this.editEnd();
    }

    editor(key: number) {
        localStorage.setItem(EDITOR_BACK, URL_PREFIX + 'container/' + this.state.selectedContainer + '/block');
        localStorage.setItem(EDITOR_ITEM, key.toString());
        let smiles;
        if (key === -1) {
            smiles = (document.getElementById(BLOCK_SMILES) as HTMLInputElement).value;
            localStorage.setItem(EDITOR_NEW_BLOCK_NAME, (document.getElementById(BLOCK_NAME) as HTMLInputElement).value);
            localStorage.setItem(EDITOR_NEW_BLOCK_ACRONYM, (document.getElementById(BLOCK_ACRONYM) as HTMLInputElement).value);
            localStorage.setItem(EDITOR_NEW_BLOCK_FORMULA, (document.getElementById(BLOCK_FORMULA) as HTMLInputElement).value);
            localStorage.setItem(EDITOR_NEW_BLOCK_SMILES, (document.getElementById(BLOCK_SMILES) as HTMLInputElement).value);
        } else {
            smiles = this.find(key).smiles;
        }
        document.location.href = URL_PREFIX + 'smiles/' + smiles;
    }

    filter() {
        let id = document.getElementById(TXT_FILTER_BLOCK_ID) as HTMLInputElement;
        let name = document.getElementById(TXT_FILTER_BLOCK_NAME) as HTMLInputElement;
        let acronym = document.getElementById(TXT_FILTER_BLOCK_ACRONYM) as HTMLInputElement;
        let formula = document.getElementById(TXT_FILTER_BLOCK_FORMULA) as HTMLInputElement;
        let massFrom = document.getElementById(TXT_FILTER_BLOCK_MASS_FROM) as HTMLInputElement;
        let massTo = document.getElementById(TXT_FILTER_BLOCK_MASS_TO) as HTMLInputElement;
        let losses = document.getElementById(TXT_FILTER_BLOCK_LOSSES) as HTMLInputElement;
        let family = document.getElementById(TXT_FILTER_BLOCK_FAMILY) as HTMLInputElement;
        let smiles = document.getElementById(TXT_FILTER_BLOCK_SMILES) as HTMLInputElement;
        let identifier = document.getElementById(TXT_FILTER_BLOCK_IDENTIFIER) as HTMLInputElement;

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
                                                this.addFilter('', 'id', id.value)
                                                , 'blockName', name.value)
                                            , 'acronym', acronym.value)
                                        , 'residue', formula.value)
                                    , 'blockMassFrom', massFrom.value)
                                , 'blockMassTo', massTo.value)
                            , 'losses', losses.value)
                        , 'family', family.value)
                    , 'blockSmiles', smiles.value)
                , 'identifier', identifier.value);
        this.setState({filter: filter}, this.list);
    }

    clear() {
        this.clearConcreteFilter(TXT_FILTER_BLOCK_ID);
        this.clearConcreteFilter(TXT_FILTER_BLOCK_NAME);
        this.clearConcreteFilter(TXT_FILTER_BLOCK_ACRONYM);
        this.clearConcreteFilter(TXT_FILTER_BLOCK_FORMULA);
        this.clearConcreteFilter(TXT_FILTER_BLOCK_MASS_FROM);
        this.clearConcreteFilter(TXT_FILTER_BLOCK_MASS_TO);
        this.clearConcreteFilter(TXT_FILTER_BLOCK_LOSSES);
        this.clearConcreteFilter(TXT_FILTER_BLOCK_FAMILY);
        this.clearConcreteFilter(TXT_FILTER_BLOCK_SMILES);
        this.clearConcreteFilter(TXT_FILTER_BLOCK_IDENTIFIER);
        this.setState({lastSortOrder: undefined, lastSortParam: undefined}, this.filter);
    }

    render() {
        return (
            <section className={styles.page}>
                <section className={styles.pageTable}>
                    <PopupYesNo label={"Realy want to delete block?"} onYes={this.delete} ref={this.popupRef}/>
                    <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>
                    <PopupSmilesDrawer id={ELEMENT_LARGE_SMILES} className={styles.popupLarge}
                                       ref={this.popupSmilesRef}/>

                    {localStorage.getItem(TOKEN) !== null ?
                        <div>
                            <h2>Create new block</h2>
                            <label htmlFor={BLOCK_NAME}>Name:</label>
                            <input type={'text'} id={BLOCK_NAME} name={BLOCK_NAME}
                                   placeholder='Name'/>

                            <label htmlFor={BLOCK_ACRONYM}>Acronym:</label>
                            <input type={'text'} id={BLOCK_ACRONYM} name={BLOCK_ACRONYM}
                                   placeholder='Acronym'/>

                            <label htmlFor={BLOCK_FORMULA}>Formula:</label>
                            <input type={'text'} id={BLOCK_FORMULA} name={BLOCK_FORMULA}
                                   placeholder='Residue'/>

                            <label htmlFor={BLOCK_SMILES}>SMILES:</label>
                            <input type={'text'} id={BLOCK_SMILES} name={BLOCK_SMILES}
                                   placeholder='SMILES'/>

                            <button className={styles.update} onClick={() => this.editor(-1)}>Editor</button>
                            <button className={styles.create} onClick={this.create}>Create new Block</button>
                        </div> : ''
                    }

                    <h2>List of Blocks</h2>
                    <table>
                        <thead>
                        <tr>
                            <th onClick={() => this.sortBy('id')}>Id</th>
                            <th onClick={() => this.sortBy('blockName')}>Block name</th>
                            <th onClick={() => this.sortBy('acronym')}>Acronym</th>
                            <th onClick={() => this.sortBy('residue')}>Residue</th>
                            <th onClick={() => this.sortBy('blockMass')}>Mass</th>
                            <th onClick={() => this.sortBy('losses')}>Losses</th>
                            <th onClick={() => this.sortBy('family')}>Family</th>
                            <th onClick={() => this.sortBy('blockSmiles')}>SMILES</th>
                            <th onClick={() => this.sortBy('source')}>Identifier</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><input className={styles.filter} type={'text'} id={TXT_FILTER_BLOCK_ID} placeholder={'Id'}/></td>
                            <td><input className={styles.filter} type={'text'} id={TXT_FILTER_BLOCK_NAME} placeholder={'Name'}/></td>
                            <td><input className={styles.filter} type={'text'} id={TXT_FILTER_BLOCK_ACRONYM} placeholder={'Acronym'}/></td>
                            <td><input className={styles.filter} type={'text'} id={TXT_FILTER_BLOCK_FORMULA} placeholder={'Formula'}/></td>
                            <td>
                                <input className={styles.filter} type={'text'} id={TXT_FILTER_BLOCK_MASS_FROM} placeholder={'Mass from'}/>
                                <input className={styles.filter} type={'text'} id={TXT_FILTER_BLOCK_MASS_TO} placeholder={'Mass to'}/>
                            </td>
                            <td><input className={styles.filter} type={'text'} id={TXT_FILTER_BLOCK_LOSSES} placeholder={'Losses'}/></td>
                            <td><input className={styles.filter} type={'text'} id={TXT_FILTER_BLOCK_FAMILY} placeholder={'Family'}/></td>
                            <td><input className={styles.filter} type={'text'} id={TXT_FILTER_BLOCK_SMILES} placeholder={'Smiles'}/></td>
                            <td><input className={styles.filter} type={'text'} id={TXT_FILTER_BLOCK_IDENTIFIER} placeholder={'Identifier'}/></td>
                            <td>
                                <button onClick={this.filter}>Filter</button>
                                <button className={styles.delete} onClick={this.clear}>Clear</button>
                            </td>
                        </tr>
                        {this.state.list.length > 0 && this.state.list.map(block => (
                            <tr key={block.id}>
                                <td>{block.id}</td>
                                <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                    <TextInput value={block.blockName} name={TXT_EDIT_BLOCK_NAME}
                                               id={TXT_EDIT_BLOCK_NAME}/> : block.blockName}</td>
                                <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                    <TextInput value={block.acronym} name={TXT_EDIT_ACRONYM}
                                               id={TXT_EDIT_ACRONYM}/> : block.acronym}</td>
                                <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                    <TextInput value={block.formula} name={TXT_EDIT_FORMULA}
                                               id={TXT_EDIT_FORMULA}/> : block.formula}</td>
                                <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                    <TextInput value={block.mass.toFixed(DECIMAL_PLACES).toString()}
                                               name={TXT_EDIT_MASS}
                                               id={TXT_EDIT_MASS}/> : block.mass.toFixed(DECIMAL_PLACES)}</td>
                                <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                    <TextInput value={block.losses} name={TXT_EDIT_LOSSES}
                                               id={TXT_EDIT_LOSSES}/> : block.losses}</td>
                                <td>{block.family}</td>
                                <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                    <TextInput value={block.uniqueSmiles} name={TXT_EDIT_SMILES}
                                               id={TXT_EDIT_SMILES}/> : block.uniqueSmiles}</td>
                                <td>
                                    {this.state.editable === block.id
                                        ? <div><SelectInput id={SEL_EDIT_SOURCE} name={SEL_EDIT_SOURCE}
                                                            options={ServerEnumHelper.getOptions()}
                                                            selected={block.source.toString()}/><TextInput
                                            value={block.identifier} id={TXT_EDIT_IDENTIFIER}
                                            name={TXT_EDIT_IDENTIFIER}/></div>
                                        : <a href={ServerEnumHelper.getLink(block.source, block.identifier)}
                                             target={'_blank'}
                                             rel={'noopener noreferrer'}>{ServerEnumHelper.getFullId(block.source, block.identifier)}</a>}</td>
                                <td>
                                    {this.state.editable === block.id ? <button className={styles.update}
                                                                                onClick={() => this.update(block.id)}>Update</button> :
                                        <div/>}
                                    {this.state.editable === block.id ?
                                        <button className={styles.delete} onClick={this.editEnd}>Cancel</button> :
                                        <div/>}
                                    <button className={styles.update} onClick={() => this.editor(block.id)}>Editor
                                    </button>
                                    <button onClick={() => this.showLargeSmiles(block.uniqueSmiles)}>Show</button>
                                    <button onClick={() => {
                                        document.location.href = '/container/' + this.state.selectedContainer + '/block/' + block.id + '/usage'
                                    }}>Usage
                                    </button>
                                    <button className={styles.delete} onClick={() => this.popup(block.id)}>Delete
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

export default BlockPage;
