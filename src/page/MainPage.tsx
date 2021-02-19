import * as React from "react";
import * as Parallel from 'async-parallel';
import styles from "../main.module.scss";
import Helmet from "react-helmet";
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
import NameHelper from "../helper/NameHelper";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import {SequenceEnum, SequenceEnumHelper} from "../enum/SequenceEnum";
import PopupEditor from "../component/PopupEditor";

let smilesDrawer: SmilesDrawer.Drawer;
let largeSmilesDrawer: SmilesDrawer.Drawer;

const ELEMENT_CANVAS = 'drawArea';
const ELEMENT_SMILES = 'smiles';
const ELEMENT_LARGE_CANVAS = 'popupLargeSmiles';
const ERROR_NOTHING_TO_CONVERT = 'Nothing to convert';
const SMILES_UNIQUE = 'smiles/unique';
const PAGE_TITLE = 'Home';

interface State {
    results: SingleStructure[];
    molecule?: SingleStructure;
    blocks: BlockStructure[];
    sequence?: SequenceStructure;
    selectedContainer: number;
    modifications?: Modification[];
    editable?: number;
    editSame: boolean;
    title: string;
    editorBlockId?: number;
    family: any[];
}

interface SequenceStructure {
    sequenceType: string;
    sequence: string;
}

interface BlockStructure {
    id: number;
    databaseId: number | null;
    acronym: string;
    smiles: string;
    unique: string | null;
    sameAs: number | null;
    block: SingleStructure | null;
}

const TXT_EDIT_BLOCK_NAME = 'txt-edit-name';
const TXT_EDIT_BLOCK_SMILES = 'txt-edit-smiles';
const TXT_EDIT_BLOCK_ACRONYM = 'txt-edit-acronym';
const TXT_EDIT_BLOCK_FORMULA = 'txt-edit-formula';
const TXT_EDIT_BLOCK_MASS = 'txt-edit-mass';
const TXT_EDIT_BLOCK_LOSSES = 'txt-edit-losses';
const SEL_EDIT_SOURCE = 'sel-edit-source';
const TXT_EDIT_IDENTIFIER = 'txt-edit-identifier';

class MainPage extends React.Component<any, State> {

    flashRef: React.RefObject<Flash>;
    popupRef: React.RefObject<PopupSmilesDrawer>;
    popupEditorRef: React.RefObject<PopupEditor>;

    constructor(props: any, context: any) {
        super(props, context);
        this.flashRef = React.createRef();
        this.popupRef = React.createRef();
        this.popupEditorRef = React.createRef();
        this.find = this.find.bind(this);
        this.show = this.show.bind(this);
        this.canonical = this.canonical.bind(this);
        this.unique = this.unique.bind(this);
        this.buildBlocks = this.buildBlocks.bind(this);
        this.showLargeSmiles = this.showLargeSmiles.bind(this);
        this.edit = this.edit.bind(this);
        this.editEnd = this.editEnd.bind(this);
        this.update = this.update.bind(this);
        this.save = this.save.bind(this);
        this.editorClose = this.editorClose.bind(this);
        this.blockFinder = this.blockFinder.bind(this);
        this.refreshMolecule = this.refreshMolecule.bind(this);
        this.state = {
            results: [],
            blocks: [],
            editSame: true,
            title: PAGE_TITLE,
            selectedContainer: this.getSelectedContainer(),
            family: [],
        };
    }

    getSelectedContainer(): number {
        let selectedContainer = localStorage.getItem(SELECTED_CONTAINER);
        if (!selectedContainer) {
            selectedContainer = '4';
            localStorage.setItem(SELECTED_CONTAINER, selectedContainer);
        }
        return parseInt(selectedContainer);
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

    getModification(type: string) {
        let mod = document.getElementById('sel-' + type + '-modification') as HTMLSelectElement;
        if (!mod) {
            return null;
        }
        if (mod.value === 'nothing') {
            let modName = document.getElementById('txt-' + type + '-modification') as HTMLInputElement;
            let modFormula = document.getElementById('txt-' + type + '-formula') as HTMLInputElement;
            let modMass = document.getElementById('txt-' + type + '-mass') as HTMLInputElement;
            let nTerminal = document.getElementById('chk-' + type + '-nterminal') as HTMLInputElement;
            let cTerminal = document.getElementById('chk-' + type + '-cterminal') as HTMLInputElement;
            if (modName.value && modFormula) {
                return {
                    modificationName: modName.value,
                    formula: modFormula.value,
                    mass: modMass.value,
                    nTerminal: nTerminal.checked,
                    cTerminal: cTerminal.checked
                };
            }
        } else {
            return {databaseId: mod.value};
        }
    }

    enterFind(e: any) {
        if (e.key === 'Enter') {
            this.find();
        }
    }

    save() {
        const token = localStorage.getItem(TOKEN);
        if (token) {
            let nModification, cModification, bModification;
            switch (Number(this.state.sequence?.sequenceType) as SequenceEnum) {
                case SequenceEnum.LINEAR:
                case SequenceEnum.LINEAR_POLYKETIDE:
                    nModification = this.getModification('n');
                    cModification = this.getModification('c');
                    break;
                default:
                case SequenceEnum.BRANCHED:
                case SequenceEnum.OTHER:
                    nModification = this.getModification('n');
                    cModification = this.getModification('c');
                    bModification = this.getModification('b');
                    break;
                case SequenceEnum.BRANCH_CYCLIC:
                    bModification = this.getModification('b');
                    break;
                case SequenceEnum.CYCLIC:
                case SequenceEnum.CYCLIC_POLYKETIDE:
                    break;
            }
            let txtSequence = document.getElementById('txt-sequence') as HTMLInputElement;
            let selSequence = document.getElementById('sel-sequence-type') as HTMLSelectElement;
            let sequence = {
                sequenceName: this.state.molecule?.structureName,
                formula: this.state.molecule?.formula,
                mass: this.state.molecule?.mass,
                smiles: this.state.molecule?.smiles,
                source: this.state.molecule?.database,
                identifier: this.state.molecule?.identifier,
                sequence: txtSequence.value,
                sequenceType: SequenceEnumHelper.getName(Number(selSequence.value)),
                nModification: nModification,
                cModification: cModification,
                bModification: bModification,
                family: this.state.family.map(family => {
                    return family.value
                }),
                blocks: this.state.blocks.map(block => {
                    return {
                        databaseId: block.databaseId,
                        sameAs: block.sameAs,
                        acronym: block.acronym,
                        blockName: block.block?.structureName,
                        smiles: block.unique,
                        formula: block.block?.formula,
                        mass: block.block?.mass,
                        losses: block.block?.losses,
                        source: block.block?.database,
                        identifier: block.block?.identifier
                    }
                })
            };
            fetch(ENDPOINT + 'container/' + this.state.selectedContainer + '/sequence', {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify(sequence)
            }).then(response => {
                if (response.status === 201) {
                    this.flashRef.current!.activate(FlashType.OK, 'Sequence created');
                } else {
                    if (response.status === 401) {
                        localStorage.removeItem(TOKEN);
                    }
                    this.flashRef.current!.activate(FlashType.BAD);
                    response.json().then(data => this.flashRef.current!.activate(FlashType.BAD, data.message));
                }
                document.location.href = '#main';
            });
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    async blockFinder(data: any[], sequence: SequenceStructure) {
        document.location.href = '#results';
        let finder = new PubChemFinder();
        Parallel.map(data, async (item: any) => {
            if (item.sameAs === null && item.block === null) {
                return {
                    id: item.id,
                    databaseId: null,
                    acronym: item.id?.toString(),
                    smiles: item.smiles,
                    unique: item.unique,
                    sameAs: null,
                    block: await finder.findBySmiles(item.smiles).then(data => data[0])
                } as BlockStructure;
            } else {
                if (item.block === null) {
                    return {
                        id: item.id,
                        databaseId: null,
                        acronym: item.acronym ?? item.sameAs?.toString(),
                        smiles: item.smiles,
                        unique: item.unique,
                        sameAs: item.sameAs,
                        block: item.block
                    } as BlockStructure;
                } else {
                    return {
                        id: item.id,
                        databaseId: item.block?.databaseId,
                        acronym: item.acronym ?? item.sameAs?.toString(),
                        smiles: item.smiles,
                        unique: item.unique,
                        sameAs: item.sameAs,
                        block: item.block
                    } as BlockStructure;
                }
            }
        }, 2).then(async data => {
            data.forEach(e => {
                console.log(e.sameAs);
                if (e.sameAs) {
                    e.block = data[e.sameAs].block
                }
            });
            return data;
        }).then(data => {
            let sequence = this.state.sequence;
            data.forEach((block: BlockStructure) => {
                    if (block.sameAs !== null) {
                        if (sequence) {
                            sequence.sequence = this.replaceSequence(sequence?.sequence ?? '', block.id.toString(), block.sameAs.toString());
                        }
                    }
                }
            );
            this.setState({editable: undefined, results: [], blocks: data, sequence: sequence});
            return data;
        }).then(data => {
                let nameHelper = new NameHelper();
                Parallel.map(data, async (item: BlockStructure) => {
                    if (item.sameAs === null && item.block && !isNaN(Number(item.acronym))) {
                        let name = await finder.findName(item.block.identifier, item.block.structureName);
                        return {
                            id: item.id,
                            databaseId: null,
                            acronym: await nameHelper.acronymFromName(name),
                            smiles: item.smiles,
                            unique: item.unique,
                            sameAs: null,
                            block: {
                                identifier: item.block.identifier,
                                database: item.block.database,
                                structureName: name,
                                smiles: item.block.smiles,
                                formula: item.block.formula,
                                mass: item.block.mass
                            }
                        } as BlockStructure;
                    } else {
                        return item;
                    }
                }, 2).then(async data => {
                    if (this.state.sequence) {
                        sequence = this.state.sequence;
                    }
                    data.forEach(e => {
                        if (e.sameAs !== null) {
                            e.block = data[e.sameAs].block;
                            e.acronym = data[e.sameAs].acronym;
                            sequence.sequence = this.replaceSequence(sequence?.sequence ?? '', data[e.sameAs].acronym, e.acronym);
                        } else {
                            sequence.sequence = this.replaceSequence(sequence?.sequence ?? '', e.id.toString(), e.acronym);
                        }
                    });
                    return data;
                }).then(data => {
                    this.setState({results: [], blocks: data, sequence: sequence, title: PAGE_TITLE});
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

    /**
     * Build blocks from structure and show them
     */
    buildBlocks() {
        this.flashRef.current!.activate(FlashType.PENDING);
        this.setState({title: 'Loading - Home'});
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement | null;
        if (smilesInput?.value === undefined || smilesInput?.value === "") {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_NOTHING_TO_CONVERT);
            return;
        }
        let blockStructures = smilesDrawer.buildBlockSmiles();
        console.log(blockStructures);
        let sequence = {
            sequence: blockStructures.sequence,
            sequenceType: blockStructures.sequenceType
        } as SequenceStructure;
        let token = localStorage.getItem(TOKEN);
        let endpoint = ENDPOINT + 'smiles/unique';
        let init: any = {
            method: 'POST',
            body: JSON.stringify(blockStructures.blockSmiles.map((e: any) => {
                return {smiles: e}
            }))
        };
        if (token) {
            endpoint = ENDPOINT + 'container/' + this.state.selectedContainer + '/smiles';
            init = {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify(blockStructures.blockSmiles.map((e: any) => {
                    return {smiles: e}
                }))
            };
        }
        fetch(endpoint, init).then(responseUnique => {
            if (responseUnique.status === 200) {
                responseUnique.json().then(async data => {
                        this.setState({results: [], blocks: data, sequence: sequence});
                        this.blockFinder(data, sequence);
                    }
                );
            } else {
                this.transformSmiles(blockStructures.blockSmiles, sequence);
            }
        }).catch(() => {
            this.transformSmiles(blockStructures.blockSmiles, sequence)
        });
    }

    transformSmiles(smiles: string[], sequence: SequenceStructure) {
        let data = [];
        for (let index = 0; index < smiles.length; index++) {
            data.push({
                id: index,
                databaseId: null,
                acronym: index.toString(),
                smiles: smiles[index],
                unique: smiles[index],
                sameAs: null,
                block: null
            } as BlockStructure);
            this.setState({blocks: data});
            this.blockFinder(data, sequence);
        }
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
        } else {
            molecule.structureName = nameInput?.value ?? molecule.structureName;
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
        let acronym = document.getElementById(TXT_EDIT_BLOCK_ACRONYM) as HTMLInputElement;
        let smiles = document.getElementById(TXT_EDIT_BLOCK_SMILES) as HTMLInputElement;
        let name = document.getElementById(TXT_EDIT_BLOCK_NAME) as HTMLInputElement;
        let formula = document.getElementById(TXT_EDIT_BLOCK_FORMULA) as HTMLInputElement;
        let mass = document.getElementById(TXT_EDIT_BLOCK_MASS) as HTMLInputElement;
        let losses = document.getElementById(TXT_EDIT_BLOCK_LOSSES) as HTMLInputElement;
        let source = document.getElementById(SEL_EDIT_SOURCE) as HTMLSelectElement;
        let identifier = document.getElementById(TXT_EDIT_IDENTIFIER) as HTMLInputElement;

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
                blocks[block.id].block!.structureName = name.value;
                blocks[block.id].block!.formula = formula.value;
                blocks[block.id].block!.mass = Number(mass.value);
                blocks[block.id].block!.losses = losses.value;
                blocks[block.id].block!.database = Number(source.value);
                blocks[block.id].block!.identifier = identifier.value;
            });
        } else {
            blocks[blockId].acronym = acronym.value;
            blocks[blockId].smiles = smiles.value;
            blocks[blockId].block!.structureName = name.value;
            blocks[blockId].block!.formula = formula.value;
            blocks[blockId].block!.mass = Number(mass.value);
            blocks[blockId].block!.losses = losses.value;
            blocks[blockId].block!.database = Number(source.value);
            blocks[blockId].block!.identifier = identifier.value;
        }
        this.setState({blocks: blocks, sequence: sequence});
        this.editEnd();
    }

    editorClose(smiles: string) {
        if (this.state.editorBlockId) {
            let blocks = this.state.blocks;
            let blocksCopy = [...blocks];
            if (this.state.editSame) {
                let sameBlocks = blocksCopy.filter(block => block.sameAs === this.state.editorBlockId || block.id === this.state.editorBlockId);
                sameBlocks.forEach(block => {
                    blocks[block.id].smiles = smiles;
                    blocks[block.id].unique = smiles;
                    blocks[block.id].block!.formula = '';
                    blocks[block.id].block!.mass = undefined;
                });
            } else {
                blocks[this.state.editorBlockId].smiles = smiles;
                blocks[this.state.editorBlockId].unique = smiles;
            }
            this.setState({blocks: blocks});
        }
    }

    refreshMolecule() {
        let searchInput: HTMLSelectElement | null = document.getElementById('search') as HTMLSelectElement;
        let search = Number(searchInput?.options[searchInput.selectedIndex].value);
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement;
        let formulaInput: HTMLInputElement | null = document.getElementById('formula') as HTMLInputElement;
        let massInput: HTMLInputElement | null = document.getElementById('mass') as HTMLInputElement;
        let identifierInput: HTMLInputElement | null = document.getElementById('identifier') as HTMLInputElement;
        let nameInput: HTMLInputElement | null = document.getElementById('name') as HTMLInputElement;
        let molecule = new SingleStructure(
            identifierInput.value,
            search,
            nameInput.value,
            smilesInput.value,
            formulaInput.value,
            Number(massInput.value)
        );
        this.setState({molecule: molecule});
    }

    render() {
        return (
            <section className={styles.page + ' ' + styles.mainPage} id={'main'}>
                <Helmet>
                    <title>{this.state.title}</title>
                </Helmet>
                <PopupSmilesDrawer id='popupLargeSmiles' className={styles.popupLarge} ref={this.popupRef}/>
                <PopupEditor id={'popupEditor'} className={styles.popupLargeEditor} ref={this.popupEditorRef}
                             onClose={this.editorClose}/>
                <section id='home'>
                    <div className={styles.drawerArea}>
                        <canvas id='drawArea' onClick={this.handle}/>
                    </div>

                    <div className={styles.drawerInput}>
                        <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>
                        <label htmlFor='database' className={styles.main}>Database</label>
                        <SelectInput id="database" name="database" className={styles.main}
                                     options={ServerEnumHelper.getOptions()} onChange={this.refreshMolecule}/>

                        <label htmlFor='search' className={styles.main}>Search by</label>
                        <SelectInput id="search" name="search" className={styles.main}
                                     options={SearchEnumHelper.getOptions()} onChange={this.refreshMolecule}/>

                        <label htmlFor='name' className={styles.main}>Name</label>
                        <input id="name" name="name" className={styles.main} onKeyDown={(e) => this.enterFind(e)} onChange={this.refreshMolecule}/>

                        <label htmlFor='smiles' className={styles.main}>SMILES</label>
                        <textarea id='smiles' name="smiles" className={styles.main} onInput={this.drawSmiles}
                                  onKeyDown={(e) => this.enterFind(e)} onChange={this.refreshMolecule}/>

                        <label htmlFor='formula' className={styles.main}>Molecular Formula</label>
                        <input id="formula" className={styles.main} name="formula"
                               onKeyDown={(e) => this.enterFind(e)} onChange={this.refreshMolecule}/>

                        <label htmlFor='mass' className={styles.main}>Monoisotopic Mass</label>
                        <input id="mass" name="mass" className={styles.main} onKeyDown={(e) => this.enterFind(e)} onChange={this.refreshMolecule}/>

                        <label htmlFor='identifier' className={styles.main}>Identifier</label>
                        <input id="identifier" name="identifier" className={styles.main}
                               onKeyDown={(e) => this.enterFind(e)} onChange={this.refreshMolecule}/>

                        <div className={styles.buttons}>
                            <button onClick={this.find}>Find</button>
                            <button>Edit</button>
                            <button onClick={this.canonical}>Cannonical SMILES</button>
                            <button onClick={this.unique}>Unique SMILES</button>
                            <button onClick={this.buildBlocks}>Build Blocks</button>
                            <button onClick={this.save}>Save</button>
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

                {this.state.blocks.length > 0 ?
                    <section id='results'>
                        <ModificationComponent containerId={this.state.selectedContainer}
                                               blockLength={this.state.blocks.length}
                                               sequenceType={this.state.sequence?.sequenceType}
                                               sequence={this.state.sequence?.sequence}
                                               modifications={this.state.modifications}
                                               onFamilyChange={(family: any[]) => this.setState({family: family})}/>
                        <table>
                            <thead>
                            <tr>
                                <th/>
                                <th>Acronym</th>
                                <th>SMILES</th>
                                <th>Name</th>
                                <th>Formula</th>
                                <th>Mass</th>
                                <th>Losses</th>
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
                                        <TextInput value={block.acronym} name={TXT_EDIT_BLOCK_ACRONYM}
                                                   id={TXT_EDIT_BLOCK_ACRONYM}/> : block.acronym}</td>
                                    <td onClick={() => this.edit(block.id)}
                                        className={styles.tdMin}>{this.state.editable === block.id ?
                                        <TextInput value={block.unique ?? ''} name={TXT_EDIT_BLOCK_SMILES}
                                                   id={TXT_EDIT_BLOCK_SMILES}/> : block.unique}</td>
                                    <td className={styles.tdMin}
                                        onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput name={TXT_EDIT_BLOCK_NAME} id={TXT_EDIT_BLOCK_NAME}
                                                   value={block.block?.structureName ?? ''}/> : block.block?.structureName}</td>
                                    <td className={styles.tdMin}
                                        onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput id={TXT_EDIT_BLOCK_FORMULA} name={TXT_EDIT_BLOCK_FORMULA}
                                                   value={block.block?.formula ?? ''}/> : block.block?.formula}</td>
                                    <td className={styles.tdMin}
                                        onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput id={TXT_EDIT_BLOCK_MASS} name={TXT_EDIT_BLOCK_MASS}
                                                   value={block.block?.mass?.toString() ?? ''}/> : block.block?.mass}</td>
                                    <td className={styles.tdMin}
                                        onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput id={TXT_EDIT_BLOCK_LOSSES} name={TXT_EDIT_BLOCK_LOSSES}
                                                   value={block.block?.losses ?? ''}/> : block.block?.losses}</td>
                                    <td className={styles.tdMin}>
                                        {this.state.editable === block.id
                                            ? <div><SelectInput id={SEL_EDIT_SOURCE} name={SEL_EDIT_SOURCE}
                                                                options={ServerEnumHelper.getOptions()}
                                                                selected={block.block?.database.toString()}/><TextInput
                                                value={block.block?.identifier ?? ''} id={TXT_EDIT_IDENTIFIER}
                                                name={TXT_EDIT_IDENTIFIER}/></div>
                                            :
                                            <a href={ServerEnumHelper.getLink(Number(block.block?.database), block.block?.identifier ?? '')}
                                               target={'_blank'}
                                               rel={'noopener noreferrer'}>{ServerEnumHelper.getFullId(Number(block.block?.database), block.block?.identifier ?? '')}</a>}</td>
                                    <td className={styles.tdMin}>
                                        {this.state.editable === block.id ? <button className={styles.update}
                                                                                    onClick={() => this.update(block.id)}>Update</button> :
                                            <div/>}
                                        {this.state.editable === block.id ?
                                            <button className={styles.delete} onClick={this.editEnd}>Cancel</button> :
                                            <div/>}
                                        <button className={styles.update} onClick={() => {
                                            this.setState({editorBlockId: block.id});
                                            this.popupEditorRef.current!.activate(block.unique ?? '');
                                        }}>Editor
                                        </button>
                                        <button className={styles.delete}
                                                onClick={() => this.setState({blocks: this.state.blocks.filter(e => e.id !== block.id)})}>Remove
                                        </button>
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
