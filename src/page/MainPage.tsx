import * as React from "react";
import * as Parallel from 'async-parallel';
import styles from "../main.module.scss";
// @ts-ignore
import * as SmilesDrawer from 'smiles-drawer';
import {OPTION_DRAW_DECAY_POINTS, OPTION_THEMES} from "../constant/SmilesDrawerConstants";
import {SelectInput} from "../component/SelectInput";
import {ServerEnum, ServerEnumHelper} from "../enum/ServerEnum";
import {SearchEnum, SearchEnumHelper} from "../enum/SearchEnum";
import IFinder from "../finder/IFinder";
import SingleStructure from "../finder/SingleStructure";
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import Canonical from "../helper/Canonical";
import PopupSmilesDrawer from "../component/PopupSmilesDrawer";
import {ENDPOINT, SELECTED_CONTAINER, TOKEN} from "../constant/ApiConstants";
import PubChemFinder from "../finder/PubChemFinder";
import FetchHelper from "../helper/FetchHelper";
import Modification from "../structure/Modification";
import ModificationComponent from "../component/ModificationComponent";
import TextInput from "../component/TextInput";

let smilesDrawer: SmilesDrawer.Drawer;
let largeSmilesDrawer: SmilesDrawer.Drawer;

const ELEMENT_CANVAS = 'drawArea';
const ELEMENT_SMILES = 'smiles';
const ELEMENT_LARGE_CANVAS = 'popupLargeSmiles';
const ERROR_NOTHING_TO_CONVERT = 'Nothing to convert';
const SMILES_UNIQUE = 'smiles/unique';

interface State {
    results: SingleStructure[];
    molecule?: SingleStructure;
    blocks: BlockStructure[];
    sequence?: SequenceStructure;
    selectedContainer?: number;
    modifications?: Modification[];
    editable?: number;
    editSame: boolean;
}

interface SequenceStructure {
    sequenceType: string;
    sequence: string;
}

interface BlockStructure {
    id: number;
    acronym: string;
    smiles: string;
    unique: string | null;
    sameAs: number | null;
    block: SingleStructure | null;
}

class MainPage extends React.Component<any, State> {

    flashRef: React.RefObject<Flash>;
    popupRef: React.RefObject<PopupSmilesDrawer>;

    constructor(props: any, context: any) {
        super(props, context);
        this.flashRef = React.createRef();
        this.popupRef = React.createRef();
        this.find = this.find.bind(this);
        this.show = this.show.bind(this);
        this.canonical = this.canonical.bind(this);
        this.unique = this.unique.bind(this);
        this.buildBlocks = this.buildBlocks.bind(this);
        this.showLargeSmiles = this.showLargeSmiles.bind(this);
        this.edit = this.edit.bind(this);
        this.editEnd = this.editEnd.bind(this);
        this.update = this.update.bind(this);
        this.state = {results: [], blocks: [], editSame: true};
    }

    componentDidMount(): void {
        this.initializeSmilesDrawers();
    }

    componentDidUpdate() {
        let small = document.getElementsByClassName(styles.canvasSmall);
        if (small.length > 1) {
            SmilesDrawer.apply({width: small[0].clientWidth, height: small[0].clientHeight, compactDrawing: false});
        }
    }

    initializeSmilesDrawers() {
        const area = document.getElementById(ELEMENT_CANVAS);
        smilesDrawer = new SmilesDrawer.Drawer({
            width: area!.clientWidth,
            height: area!.clientHeight,
            compactDrawing: false,
            drawDecayPoints: OPTION_DRAW_DECAY_POINTS,
            offsetX: area!.offsetLeft,
            offsetY: area!.offsetTop,
            themes: OPTION_THEMES,
        });
        const large = document.getElementById(ELEMENT_LARGE_CANVAS);
        largeSmilesDrawer = new SmilesDrawer.Drawer({
            width: large!.clientWidth,
            height: large!.clientHeight,
            compactDrawing: false,
        });
    }

    drawSmiles() {
        let input = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement;
        SmilesDrawer.parse(input.value, function (tree: any) {
            smilesDrawer.draw(tree, ELEMENT_CANVAS);
        });
    }

    /**
     * Handle mouse click on canvas to choose decays points
     * @param event
     */
    handle(event: React.MouseEvent) {
        const drawArea = document.getElementById(ELEMENT_CANVAS);
        const smiles = document.getElementById(ELEMENT_SMILES);
        if (drawArea && (smiles as HTMLTextAreaElement).value) {
            smilesDrawer.handleMouseClick(event);
        }
    }

    /**
     * Build blocks from structure and show them
     */
    buildBlocks() {
        this.flashRef.current!.activate(FlashType.PENDING);
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement | null;
        if (smilesInput?.value === undefined || smilesInput?.value === "") {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_NOTHING_TO_CONVERT);
            return;
        }
        let blockStructures = smilesDrawer.buildBlockSmiles();
        let sequence = {
            sequence: blockStructures.sequence,
            sequenceType: blockStructures.sequenceType
        } as SequenceStructure;
        fetch(ENDPOINT + SMILES_UNIQUE, {
            method: 'POST',
            body: JSON.stringify(blockStructures.blockSmiles.map((e: any) => {
                return {smiles: e}
            }))
        }).then(responseUnique => {
            if (responseUnique.status === 200) {
                responseUnique.json().then(async data => {
                        let selectedContainer = localStorage.getItem(SELECTED_CONTAINER);
                        if (selectedContainer) {
                            this.setState({
                                results: [],
                                blocks: data,
                                sequence: sequence,
                                selectedContainer: parseInt(selectedContainer)
                            });
                        } else {
                            this.setState({results: [], blocks: data, sequence: sequence});
                        }
                        document.location.href = '#results';
                        let finder = new PubChemFinder();
                        Parallel.map(data, async (item: any) => {
                            if (item.sameAs === null) {
                                return {
                                    id: item.id,
                                    acronym: item.id.toString(),
                                    smiles: item.smiles,
                                    unique: item.unique,
                                    sameAs: null,
                                    block: await finder.findBySmiles(item.smiles).then(data => data[0])
                                } as BlockStructure;
                            } else {
                                return {
                                    id: item.id,
                                    acronym: item.sameAs.toString(),
                                    smiles: item.smiles,
                                    unique: item.unique,
                                    sameAs: item.sameAs,
                                    block: null
                                } as BlockStructure;
                            }
                        }, 2).then(async data => {
                            data.forEach(e => {
                                if (e.sameAs !== null) {
                                    e.block = data[e.sameAs].block
                                }
                            });
                            return data;
                        }).then(data => {
                            let sequence = this.state.sequence;
                                data.forEach((block: BlockStructure) => {
                                        if (block.sameAs !== null) {
                                            if (sequence) {
                                                console.log(sequence.sequence, block.acronym, this.state.blocks[block.sameAs].acronym);
                                                sequence.sequence = this.replaceSequence(sequence?.sequence ?? '', block.id.toString(), block.sameAs.toString());
                                            }
                                        }
                                    }
                                );
                            this.setState({results: [], blocks: data, sequence: sequence});
                            return data;
                        }).then(data => {
                                Parallel.map(data, async (item: BlockStructure) => {
                                    if (item.sameAs === null && item.block) {
                                        return {
                                            id: item.id,
                                            acronym: item.id.toString(),
                                            smiles: item.smiles,
                                            unique: item.unique,
                                            sameAs: null,
                                            block: {
                                                identifier: item.block.identifier,
                                                database: item.block.database,
                                                structureName: await finder.findName(item.block.identifier, item.block.structureName),
                                                smiles: item.block.smiles,
                                                formula: item.block.formula,
                                                mass: item.block.mass
                                            }
                                        } as BlockStructure;
                                    } else {
                                        return item;
                                    }
                                }, 2).then(async data => {
                                    data.forEach(e => {
                                        if (e.sameAs !== null) {
                                            e.block = data[e.sameAs].block
                                        }
                                    });
                                    return data;
                                }).then(data => {
                                    this.setState({results: [], blocks: data});
                                    this.flashRef.current!.activate(FlashType.OK, 'Done');
                                    return data;
                                });
                            }
                        );

                        let token = localStorage.getItem(TOKEN);
                        if (this.state.selectedContainer) {
                            if (token) {
                                await FetchHelper.fetchModification(this.state.selectedContainer, {
                                    method: 'GET',
                                    headers: {'x-auth-token': token}
                                }, (response: any) => {
                                    response.then((data: Modification[]) => {
                                        this.setState({modifications: data})
                                    })
                                });
                            } else {
                                await FetchHelper.fetchModification(this.state.selectedContainer, {method: 'GET'}, (response: any) => {
                                    response.then((data: Modification[]) => {
                                        this.setState({modifications: data})
                                    });
                                });
                            }
                        }
                    }
                );
            } else {
                responseUnique.json().then(data => this.flashRef.current!.activate(FlashType.BAD, data.message));
            }
        });
    }


    /**
     * Find structures on third party databases, by data in form
     */
    async find() {
        this.setState({results: [], blocks: []});
        this.flashRef.current!.activate(FlashType.PENDING);
        let searchInput: HTMLSelectElement | null = document.getElementById('search') as HTMLSelectElement | null;
        let databaseInput: HTMLSelectElement | null = document.getElementById('database') as HTMLSelectElement | null;
        let search = Number(searchInput?.options[searchInput.selectedIndex].value);
        let database = Number(databaseInput?.options[databaseInput.selectedIndex].value);
        let searchParam: HTMLInputElement | null = document.getElementById(SearchEnumHelper.getName(search)) as HTMLInputElement | null;
        let finder: IFinder = ServerEnumHelper.getFinder(database);
        let response = await SearchEnumHelper.find(search, finder, searchParam?.value);
        if (response.length === 0) {
            this.flashRef.current!.activate(FlashType.BAD, 'Nothing found');
        } else if (response.length === 1) {
            this.flashRef.current!.activate(FlashType.OK);
            this.select(response[0], search);
        } else {
            this.flashRef.current!.activate(FlashType.OK, 'Found more, select one');
            this.setState({results: response});
            document.location.href = '#results';
        }
    }

    /**
     * Choose one among more results from findings
     * @param molecule chosen one
     * @param search by which parameter was searched
     */
    select(molecule: SingleStructure, search ?: number) {
        this.flashRef.current!.deactivate();
        if (search === undefined) {
            let searchInput: HTMLSelectElement | null = document.getElementById('search') as HTMLSelectElement | null;
            search = Number(searchInput?.options[searchInput.selectedIndex].value);
        }
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement | null;
        smilesInput!.value = molecule.smiles ?? '';
        let formulaInput: HTMLInputElement | null = document.getElementById('formula') as HTMLInputElement | null;
        formulaInput!.value = molecule.formula ?? '';
        let massInput: HTMLInputElement | null = document.getElementById('mass') as HTMLInputElement | null;
        massInput!.value = ((molecule.mass ?? '') === 0) ? '' : (molecule.mass ?? '').toString();
        let identifierInput: HTMLInputElement | null = document.getElementById('identifier') as HTMLInputElement | null;
        identifierInput!.value = molecule.identifier ?? '';
        let nameInput: HTMLInputElement | null = document.getElementById('name') as HTMLInputElement | null;
        if (search !== SearchEnum.NAME) {
            nameInput!.value = molecule.structureName ?? '';
        }
        this.drawSmiles();
        this.setState({results: [], molecule: molecule});
        document.location.href = '#home';
    }

    /**
     * Open new tab, with structure on original third party service
     * @param database
     * @param identifier
     */
    show(database: ServerEnum, identifier: string) {
        window.open(ServerEnumHelper.getLink(database, identifier), '_blank');
    }

    /**
     * Convert Isomeric SMILES to canonical
     */
    canonical() {
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement | null;
        if (smilesInput?.value === undefined || smilesInput?.value === "") {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_NOTHING_TO_CONVERT);
        } else {
            smilesInput.value = Canonical.getCanonicalSmiles(smilesInput.value);
            this.drawSmiles();
        }
    }

    /**
     * Convert SMILES to Unique SMILES
     */
    unique() {
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement | null;
        if (smilesInput?.value === undefined || smilesInput?.value === "") {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_NOTHING_TO_CONVERT);
        } else {
            fetch(ENDPOINT + SMILES_UNIQUE, {
                method: 'POST',
                body: JSON.stringify([{smiles: smilesInput.value}])
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => smilesInput!.value = data[0].unique ?? data[0].smiles)
                }
            });
        }
    }

    /**
     * Show popup with large result
     * @param smiles
     */
    showLargeSmiles(smiles: string) {
        this.popupRef.current!.activate();
        SmilesDrawer.parse(smiles, function (tree: any) {
            largeSmilesDrawer.draw(tree, 'popupLargeSmiles');
        });
    }

    edit(blockId: number) {
        this.setState({editable: blockId});
    }

    editEnd() {
        this.setState({editable: undefined});
    }

    replaceSequence(sequence: string, lastAcronym: string, newAcronym: string) {
        if (sequence === "") {
            return sequence;
        }
        return sequence.replaceAll('[' + lastAcronym + ']', '[' + newAcronym + ']');
    }

    update(blockId: number) {
        let acronym = document.getElementById('txt-edit-acronym') as HTMLInputElement;
        let smiles = document.getElementById('txt-edit-smiles') as HTMLInputElement;

        let sequence = this.state.sequence;
        let blocks = this.state.blocks;
        if (sequence) {
            sequence.sequence = this.replaceSequence(sequence.sequence, blocks[blockId].acronym, acronym.value);
        }
        if (this.state.editSame) {
            let blocksCopy = [...blocks];
            let sameBlocks = blocksCopy.filter(block => block.sameAs === blockId || block.id === blockId);
            sameBlocks.forEach(block => {
                blocks[block.id].acronym = acronym.value;
                blocks[block.id].smiles = smiles.value;
            });
        } else {
            blocks[blockId].acronym = acronym.value;
            blocks[blockId].smiles = smiles.value;
        }
        this.setState({blocks: blocks, sequence: sequence});
        this.editEnd();
    }

    render() {
        return (
            <section className={styles.page + ' ' + styles.mainPage}>
                <PopupSmilesDrawer id='popupLargeSmiles' className={styles.popupLarge} ref={this.popupRef}/>
                <section id='home'>
                    <div className={styles.drawerArea}>
                        <canvas id='drawArea' onClick={this.handle}/>
                    </div>

                    <div className={styles.drawerInput}>
                        <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>
                        <label htmlFor='database' className={styles.main}>Database</label>
                        <SelectInput id="database" name="database" className={styles.main}
                                     options={ServerEnumHelper.getOptions()}/>

                        <label htmlFor='search' className={styles.main}>Search by</label>
                        <SelectInput id="search" name="search" className={styles.main}
                                     options={SearchEnumHelper.getOptions()}/>

                        <label htmlFor='name' className={styles.main}>Name</label>
                        <input id="name" name="name" className={styles.main} onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                this.find()
                            }
                        }}/>

                        <label htmlFor='smiles' className={styles.main}>SMILES</label>
                        <textarea id='smiles' name="smiles" className={styles.main} onInput={this.drawSmiles}
                                  onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                          this.find()
                                      }
                                  }}/>

                        <label htmlFor='formula' className={styles.main}>Molecular Formula</label>
                        <input id="formula" className={styles.main} name="formula" onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                this.find()
                            }
                        }}/>

                        <label htmlFor='mass' className={styles.main}>Monoisotopic Mass</label>
                        <input id="mass" name="mass" className={styles.main} onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                this.find()
                            }
                        }}/>

                        <label htmlFor='identifier' className={styles.main}>Identifier</label>
                        <input id="identifier" name="identifier" className={styles.main} onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                this.find()
                            }
                        }}/>

                        <div className={styles.buttons}>
                            <button onClick={this.find}>Find</button>
                            <button>Edit</button>
                            <button onClick={this.canonical}>Cannonical SMILES</button>
                            <button onClick={this.unique}>Unique SMILES</button>
                            <button onClick={this.buildBlocks}>Build Blocks</button>
                            <button>Save</button>
                        </div>
                    </div>
                </section>

                {this.state.results.length > 1 ?
                    <section id='results'>
                        {this.state.results.map(molecule => (
                            <section className={styles.results} title={molecule.structureName}>
                                <canvas id={'canvas-small-' + molecule.identifier} className={styles.canvasSmall}
                                        data-smiles={molecule.smiles}
                                        onClick={() => this.showLargeSmiles(molecule.smiles)}/>
                                <div className={styles.itemResults}>{molecule.formula}</div>
                                <div className={styles.itemResults}>{molecule.mass}</div>
                                <div className={styles.itemResults + ' ' + styles.cursorPointer}
                                     onClick={() => this.show(molecule.database, molecule.identifier)}>{ServerEnumHelper.getFullId(molecule.database, molecule.identifier)}</div>
                                <div className={styles.itemResults + ' ' + styles.cursorPointer}
                                     onClick={() => this.select(molecule)}>Select
                                </div>
                            </section>
                        ))}
                    </section>
                    :
                    <section/>
                }

                {this.state.blocks.length > 1 ?
                    <section id='results'>
                        <ModificationComponent blockLength={this.state.blocks.length}
                                               sequenceType={this.state.sequence?.sequenceType}
                                               sequence={this.state.sequence?.sequence}
                                               modifications={this.state.modifications}/>
                        <table>
                            <thead>
                            <tr>
                                <th/>
                                <th>Acronym</th>
                                <th>SMILES</th>
                                <th>Name</th>
                                <th>Formula</th>
                                <th>Mass</th>
                                <th>Identifier</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.blocks.map(block => (
                                <tr>
                                    <td>
                                        <canvas id={'canvas-small-' + block.id} className={styles.canvasSmall}
                                                data-smiles={block.unique}
                                                onClick={() => this.showLargeSmiles(block.unique ?? '')}/>
                                    </td>
                                    <td onClick={() => this.edit(block.id)}
                                        className={styles.tdMin}>{this.state.editable === block.id ?
                                        <TextInput value={block.acronym} name='txt-edit-acronym'
                                                   id='txt-edit-acronym'/> : block.acronym}</td>
                                    <td onClick={() => this.edit(block.id)}
                                        className={styles.tdMin}>{this.state.editable === block.id ?
                                        <TextInput value={block.unique ?? ''} name='txt-edit-smiles'
                                                   id='txt-edit-smiles'/> : block.unique}</td>
                                    <td className={styles.tdMin}>{block.block?.structureName}</td>
                                    <td className={styles.tdMin}>{block.block?.formula}</td>
                                    <td className={styles.tdMin}>{block.block?.mass}</td>
                                    <td className={styles.tdMin}>{block.block?.identifier ?
                                        <a href={ServerEnumHelper.getLink(ServerEnum.PUBCHEM, block.block?.identifier)}
                                           target='_blank' rel="noopener noreferrer">CID: {block.block.identifier}</a> :
                                        <div/>}</td>
                                    <td className={styles.tdMin}>
                                        {this.state.editable === block.id ? <button className={styles.update}
                                                                                    onClick={() => this.update(block.id)}>Update</button> :
                                            <div/>}
                                        {this.state.editable === block.id ?
                                            <button className={styles.delete} onClick={this.editEnd}>Cancel</button> :
                                            <div/>}
                                        <button>Editor</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </section>
                    :
                    <section/>
                }
            </section>
        )
    }

}

export default MainPage;
