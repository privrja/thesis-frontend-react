import * as React from "react";
import * as Parallel from 'async-parallel';
import styles from "../main.module.scss";
import Helmet from "react-helmet";
// @ts-ignore
import * as SmilesDrawer from 'smiles-drawer';
import {
    OPTION_DRAW_DECAY_POINTS,
    OPTION_DRAW_DECAY_POINTS_SOURCE,
    OPTION_THEMES
} from "../constant/SmilesDrawerConstants";
import {SelectInput, SelectOption} from "../component/SelectInput";
import {ServerEnum, ServerEnumHelper} from "../enum/ServerEnum";
import {SearchEnum, SearchEnumHelper} from "../enum/SearchEnum";
import IFinder from "../finder/IFinder";
import SingleStructure from "../finder/SingleStructure";
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import Canonical from "../helper/Canonical";
import PopupSmilesDrawer from "../component/PopupSmilesDrawer";
import {CHEMSPIDER_KEY, CONTAINER, SEQUENCE_EDIT, SEQUENCE_ID, TOKEN} from "../constant/ApiConstants";
import PubChemFinder from "../finder/PubChemFinder";
import FetchHelper from "../helper/FetchHelper";
import Modification from "../structure/Modification";
import ModificationComponent from "../component/ModificationComponent";
import TextInput from "../component/TextInput";
import NameHelper from "../helper/NameHelper";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import {SequenceEnum, SequenceEnumHelper} from "../enum/SequenceEnum";
import PopupEditor from "../component/PopupEditor";
import ContainerHelper from "../helper/ContainerHelper";
import TextArea from "../component/TextArea";
import Sleep from "../helper/Sleep";
import Creatable from "react-select/creatable";
import LossesHelper from "../helper/LossesHelper";
import {DECIMAL_PLACES, ENDPOINT} from "../constant/Constants";
import ComputeHelper, {H2, H2O} from "../helper/ComputeHelper";

let smilesDrawer: SmilesDrawer.Drawer;
let largeSmilesDrawer: SmilesDrawer.Drawer;

const ELEMENT_CANVAS = 'drawArea';
const ELEMENT_SMILES = 'smiles';
const ELEMENT_LARGE_CANVAS = 'popupLargeSmiles';
const ERROR_NOTHING_TO_CONVERT = 'Nothing to convert';
const SMILES_UNIQUE = 'smiles/unique';
const PAGE_TITLE = 'Home';

interface SequenceState {
    results: SingleStructure[];
    molecule?: SingleStructure;
    blocks: BlockStructure[];
    sequence?: SequenceStructure;
    selectedContainer: number;
    modifications?: Modification[];
    blockOptions?: SelectOption[];
    nModification?: any;
    cModification?: any;
    bModification?: any;
    editable?: number;
    editSame: boolean;
    title: string;
    editorBlockId?: number;
    family: any[];
    organism: any[];
    sequenceId?: number;
    sequenceEdit: boolean;
    blocksAll: any[],
    blockEdit?: any,
    selectedContainerName?: string;
    source: ServerEnum;
    searchParam: string;
    editorSequence: boolean;
}

interface SequenceStructure {
    sequenceType: string;
    sequence: string;
    sequenceOriginal: string;
    decays: string;
}

interface BlockStructure {
    id: number;
    databaseId: number | null;
    acronym: string;
    smiles: string;
    unique: string | null;
    sameAs: number | null;
    isPolyketide: boolean;
    block: any | null;
}

const TXT_EDIT_BLOCK_NAME = 'txt-edit-name';
const TXT_EDIT_BLOCK_SMILES = 'txt-edit-smiles';
const TXT_EDIT_BLOCK_ACRONYM = 'txt-edit-acronym';
const TXT_EDIT_BLOCK_FORMULA = 'txt-edit-formula';
const TXT_EDIT_BLOCK_MASS = 'txt-edit-mass';
const TXT_EDIT_BLOCK_LOSSES = 'txt-edit-losses';
const SEL_EDIT_SOURCE = 'sel-edit-source';
const TXT_EDIT_IDENTIFIER = 'txt-edit-identifier';
const TXT_EDIT_BLOCK_DB_ACRONYM = 'txt-edit-db-acronym';

const POLYKETIDE_PREFIX = '(-2H)';
const POLYKETIDE_PREFIX_SPACE = POLYKETIDE_PREFIX + ' ';

class MainPage extends React.Component<any, SequenceState> {

    flashRef: React.RefObject<Flash>;
    flashNotice: React.RefObject<Flash>;
    popupRef: React.RefObject<PopupSmilesDrawer>;
    popupEditorRef: React.RefObject<PopupEditor>;

    constructor(props: any, context: any) {
        super(props, context);
        this.flashRef = React.createRef();
        this.flashNotice = React.createRef();
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
        this.fetchModifications = this.fetchModifications.bind(this);
        this.blockDbChange = this.blockDbChange.bind(this);
        this.fetchBlockOptions = this.fetchBlockOptions.bind(this);
        this.similarity = this.similarity.bind(this);
        this.refreshFormula = this.refreshFormula.bind(this);
        this.refreshSmiles = this.refreshSmiles.bind(this);
        this.blockRefreshSmiles = this.blockRefreshSmiles.bind(this);
        this.state = {
            results: [],
            blocks: [],
            editSame: true,
            title: PAGE_TITLE,
            selectedContainer: ContainerHelper.getSelectedContainer(),
            family: [],
            organism: [],
            sequenceEdit: false,
            blocksAll: [],
            selectedContainerName: ContainerHelper.getSelectedContainerName(),
            source: ServerEnum.PUBCHEM,
            searchParam: 'name',
            editorSequence: false
        };
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        this.initializeSmilesDrawers();
        this.getSequenceId();
        FetchHelper.initializeChemSpider();
        this.fetchModifications();
        this.fetchBlockOptions();
        this.flashNotice.current!.activate(FlashType.NOTICE, 'Create new sequence');
    }

    componentDidUpdate() {
        this.initializeSmilesDrawers(this.state.sequence?.decays);
        this.drawSmiles();
        let small = document.getElementsByClassName(styles.canvasSmall);
        if (small.length > 0) {
            SmilesDrawer.apply({width: small[0].clientWidth, height: small[0].clientHeight, compactDrawing: false});
        }
        if (this.state.sequenceEdit) {
            this.flashNotice.current!.activate(FlashType.NOTICE, 'Editing sequence ' + this.state.molecule?.structureName);
        } else {
            this.flashNotice.current!.activate(FlashType.NOTICE, 'Create new sequence');
        }
    }

    getSequenceId() {
        let editSequence = localStorage.getItem(SEQUENCE_EDIT);
        let sequenceId = localStorage.getItem(SEQUENCE_ID);
        if (editSequence === 'Yes' && sequenceId) {
            this.setState({sequenceEdit: true, sequenceId: Number(sequenceId)});
            let token = localStorage.getItem(TOKEN);
            let init;
            if (token) {
                init = {
                    method: 'GET',
                    headers: {'x-auth-token': token}
                }
            } else {
                init = {method: 'GET'}
            }
            this.fetchModifications();
            fetch(ENDPOINT + 'container/' + ContainerHelper.getSelectedContainer() + '/sequence/' + sequenceId, init).then(response => {
                if (response.status === 200) {
                    response.json().then(sequence => {
                        let databaseSelect = document.getElementById('database') as HTMLSelectElement;
                        databaseSelect.selectedIndex = Number(Array.from(databaseSelect.options).find(e => e.value.toString() === sequence.source?.toString())?.value ?? 0);
                        this.setState({
                            molecule: new SingleStructure(
                                sequence.identifier,
                                sequence.source,
                                sequence.sequenceName,
                                sequence.smiles,
                                sequence.formula,
                                sequence.mass
                            ),
                            sequence: {
                                sequence: sequence.sequence,
                                sequenceType: sequence.sequenceType,
                                sequenceOriginal: sequence.sequenceOriginal,
                                decays: sequence.decays
                            },
                            nModification: sequence.nModification,
                            cModification: sequence.cModification,
                            bModification: sequence.bModification,
                            family: sequence.family.map((family: any) => {
                                return {value: family.id, label: family.family}
                            }),
                            organism: sequence.organism.map((organism: any) => {
                                return {value: organism.id, label: organism.organism}
                            }),
                            blocks: sequence.blocks.map((block: any) => {
                                return {
                                    id: block.originalId,
                                    databaseId: block.id,
                                    acronym: block.acronym,
                                    smiles: block.smiles,
                                    unique: block.uniqueSmiles,
                                    sameAs: block.sameAs,
                                    block: new SingleStructure(
                                        block.identifier,
                                        block.source,
                                        block.blockName,
                                        block.uniqueSmiles,
                                        block.formula,
                                        block.mass
                                    )
                                }
                            }),
                        }, () => {
                            this.flashNotice.current!.activate(FlashType.NOTICE, 'Editing sequence ' + sequence.sequenceName);
                        });
                        this.initializeSmilesDrawers(sequence.decays);
                        this.drawSmiles();
                    });
                }
            });
        }
    }

    initializeSmilesDrawers(decays?: string) {
        const area = document.getElementById(ELEMENT_CANVAS);
        let init;
        let decaySource = [];
        if (decays) {
            decaySource = JSON.parse(decays);
        }
        if (decaySource.length > 0) {
            init = {
                width: area!.clientWidth,
                height: area!.clientHeight,
                compactDrawing: false,
                drawDecayPoints: OPTION_DRAW_DECAY_POINTS_SOURCE,
                offsetX: area!.offsetLeft,
                offsetY: area!.offsetTop,
                themes: OPTION_THEMES,
                decaySource: decaySource
            }
        } else {
            init = {
                width: area!.clientWidth,
                height: area!.clientHeight,
                compactDrawing: false,
                drawDecayPoints: OPTION_DRAW_DECAY_POINTS,
                offsetX: area!.offsetLeft,
                offsetY: area!.offsetTop,
                themes: OPTION_THEMES,
            }
        }
        smilesDrawer = new SmilesDrawer.Drawer(init);
        const large = document.getElementById(ELEMENT_LARGE_CANVAS);
        largeSmilesDrawer = new SmilesDrawer.Drawer({
            width: large!.clientWidth,
            height: large!.clientHeight,
            compactDrawing: false,
        });
    }

    drawSmiles(smiles?: string) {
        if (!smiles) {
            smiles = (document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement).value;
        }
        SmilesDrawer.parse(smiles, function (tree: any) {
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
                sequence: txtSequence?.value ?? null,
                decays: '[' + smilesDrawer.graph.decays.toString() + ']',
                sequenceOriginal: this.state.sequence?.sequenceOriginal,
                sequenceType: SequenceEnumHelper.getName(Number(selSequence?.value)),
                nModification: nModification,
                cModification: cModification,
                bModification: bModification,
                family: this.state.family.map(family => {
                    return family.value
                }),
                organism: this.state.organism.map(organism => {
                    return organism.value
                }),
                blocks: this.state.blocks.map(block => {
                    return {
                        databaseId: block.databaseId,
                        originalId: block.id,
                        sameAs: block.sameAs,
                        acronym: block.acronym,
                        blockName: block.block?.structureName,
                        smiles: block.unique,
                        formula: block.block?.formula,
                        mass: block.block?.mass,
                        losses: block.block?.losses,
                        source: block.block?.database,
                        identifier: block.block?.identifier,
                        isPolyketide: block.isPolyketide
                    }
                })
            };
            let endpoint = ENDPOINT + 'container/' + this.state.selectedContainer + '/sequence';
            fetch(endpoint + (this.state.sequenceEdit ? '/' + this.state.sequenceId?.toString() ?? '' : ''), {
                method: this.state.sequenceEdit ? 'PUT' : 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify(sequence)
            }).then(response => {
                if (response.status === 201) {
                    this.flashRef.current!.activate(FlashType.OK, 'Sequence created');
                } else if (response.status === 204) {
                    this.flashRef.current!.activate(FlashType.OK, 'Sequence updated');
                    localStorage.removeItem(SEQUENCE_EDIT);
                    localStorage.removeItem(SEQUENCE_ID);
                    this.props.history.push('#results');
                    Sleep.sleep(500).then(() => {
                        this.props.history.push('/container/' + this.state.selectedContainer + '/sequence');
                    });
                } else {
                    if (response.status === 401) {
                        localStorage.removeItem(TOKEN);
                    }
                    this.flashRef.current!.activate(FlashType.BAD);
                    response.json().then(data => this.flashRef.current!.activate(FlashType.BAD, data.message)).catch(() => this.flashRef.current!.activate(FlashType.BAD));
                }
                this.props.history.push('#home');
            });
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    }

    async blockFinder(data: any[], sequence: SequenceStructure) {
        let finder = new PubChemFinder();
        Parallel.map(data, async (item: any) => {
            if (item.sameAs === null && item.block === null) {
                let block = await finder.findBySmiles(item.smiles).then(blcData => blcData[0]).catch(() => undefined);
                if (block) {
                    block.formula = LossesHelper.removeFromFormula(block.formula, !item.isPolyketide);
                    block.mass = LossesHelper.removeFromMass(block.mass ?? 0, !item.isPolyketide);
                } else {
                    block = await fetch(ENDPOINT + 'smiles/formula', {
                        method: 'POST',
                        body: JSON.stringify([{smiles: item.smiles, computeLosses: item.isPolyketide ? '2H' : 'H2O'}])
                    }).then(response => {
                        if (response.status === 200) {
                            return response.json().then(data => {
                                if (data.length > 0) {
                                    return new SingleStructure(
                                        '0', ServerEnum.PUBCHEM, item.id.toString(), item.smiles, data[0].formula, data[0].mass
                                    );
                                } else {
                                    return undefined;
                                }
                            }).catch(() => undefined);
                        } else {
                            return undefined;
                        }
                    }).catch(() => undefined);
                }
                return {
                    id: item.id,
                    databaseId: null,
                    acronym: item.id?.toString(),
                    smiles: item.smiles,
                    unique: item.unique,
                    sameAs: null,
                    isPolyketide: item.isPolyketide,
                    block: block
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
                        isPolyketide: item.isPolyketide,
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
                        isPolyketide: item.isPolyketide,
                        block: item.block
                    } as BlockStructure;
                }
            }
        }, 2).then(async blockData => {
            blockData.forEach(e => {
                if (e.sameAs) {
                    e.block = new SingleStructure(
                        blockData[e.sameAs].block?.identifier ?? '',
                        blockData[e.sameAs].block?.database ?? 0,
                        blockData[e.sameAs].block?.structureName ?? '',
                        blockData[e.sameAs].block?.smiles ?? '',
                        blockData[e.sameAs].block?.formula ?? '',
                        blockData[e.sameAs].block?.mass ?? 0
                    );
                }
            });
            return blockData;
        }).then(blcSeqData => {
            let sequence = this.state.sequence;
            blcSeqData.forEach((block: BlockStructure) => {
                    if (block.sameAs !== null) {
                        if (sequence) {
                            sequence.sequence = this.replaceSequence(sequence?.sequence ?? '', block.id.toString(), block.sameAs.toString());
                        }
                    }
                }
            );
            this.setState({editable: undefined, results: [], blocks: blcSeqData, sequence: sequence});
            return blcSeqData;
        }).then(parData => {
                let nameHelper = new NameHelper();
                Parallel.map(parData, async (item: BlockStructure) => {
                    if (item.sameAs === null && item.block && !isNaN(Number(item.acronym))) {
                        let name = await finder.findName(item.block.identifier, item.block.structureName.toString());
                        return {
                            id: item.id,
                            databaseId: null,
                            acronym: await nameHelper.acronymFromName(name ?? item.id.toString()),
                            smiles: item.smiles,
                            unique: item.unique,
                            sameAs: null,
                            isPolyketide: item.isPolyketide,
                            block: {
                                identifier: item.block.identifier,
                                database: item.block.database,
                                structureName: (item.isPolyketide && !item.block.structureName.includes(POLYKETIDE_PREFIX) ? POLYKETIDE_PREFIX_SPACE : '') + (name ?? item.id.toString()),
                                smiles: item.block.smiles,
                                formula: item.block.formula,
                                mass: item.block.mass
                            }
                        } as BlockStructure;
                    } else {
                        if (item.block) {
                            return {
                                id: item.id,
                                databaseId: item.databaseId,
                                acronym: item.acronym,
                                smiles: item.smiles,
                                unique: item.unique,
                                sameAs: item.sameAs,
                                isPolyketide: item.isPolyketide,
                                block: {
                                    identifier: item.block.identifier,
                                    database: item.block.database,
                                    structureName: (item.isPolyketide && !item.block.structureName.includes(POLYKETIDE_PREFIX) ? POLYKETIDE_PREFIX_SPACE : '') + item.block.structureName,
                                    smiles: item.block.smiles,
                                    formula: item.block.formula,
                                    mass: item.block.mass
                                }
                            } as BlockStructure;
                        } else {
                            return {
                                id: item.id,
                                databaseId: item.databaseId,
                                acronym: item.acronym,
                                smiles: item.smiles,
                                unique: item.unique,
                                sameAs: item.sameAs,
                                isPolyketide: item.isPolyketide,
                                block: {
                                    identifier: '',
                                    database: -1,
                                    structureName: (item.isPolyketide ? POLYKETIDE_PREFIX_SPACE : ''),
                                    smiles: item.smiles,
                                    formula: '',
                                    mass: 0
                                }
                            } as BlockStructure;
                        }
                    }
                }, 2).then(async sameAsData => {
                    if (this.state.sequence) {
                        sequence = this.state.sequence;
                    }
                    sameAsData.forEach((e: any) => {
                        if (e.sameAs !== null) {
                            e.block = new SingleStructure(
                                sameAsData[e.sameAs].block?.identifier ?? '',
                                sameAsData[e.sameAs].block?.database ?? 0,
                                sameAsData[e.sameAs].block?.structureName ?? '',
                                sameAsData[e.sameAs].block?.smiles ?? '',
                                sameAsData[e.sameAs].block?.formula ?? '',
                                sameAsData[e.sameAs].block?.mass ?? 0
                            );
                            e.acronym = sameAsData[e.sameAs].acronym;
                            sequence.sequence = this.replaceSequence(sequence?.sequence ?? '', sameAsData[e.sameAs].acronym, e.acronym);
                        } else {
                            sequence.sequence = this.replaceSequence(sequence?.sequence ?? '', e.id.toString(), e.acronym);
                        }
                    });
                    return sameAsData;
                }).then(data => {
                    this.setState({results: [], blocks: data, sequence: sequence, title: PAGE_TITLE});
                    this.flashRef.current!.activate(FlashType.OK, 'Done');
                    this.props.history.push('#results');
                    return data;
                })
            }
        );
    }

    async fetchModifications() {
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
            sequenceType: blockStructures.sequenceType,
            sequenceOriginal: blockStructures.sequence,
            decays: '[' + blockStructures.decays?.toString() + ']',
        } as SequenceStructure;
        let token = localStorage.getItem(TOKEN);
        let endpoint = ENDPOINT + 'container/' + this.state.selectedContainer + '/smiles';
        let init: any = {
            method: 'POST',
            body: JSON.stringify(blockStructures.blockSmiles)
        };
        if (token) {
            endpoint = ENDPOINT + 'container/' + this.state.selectedContainer + '/smiles';
            init = {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify(blockStructures.blockSmiles)
            };
        }
        fetch(endpoint, init).then(responseUnique => {
            if (responseUnique.status === 200) {
                responseUnique.json().then(async data => {
                        this.setState({results: [], blocks: data, sequence: sequence}, () => {
                            this.blockFinder(data, sequence);
                            this.similarity(data)
                        });
                    }
                );
            } else {
                this.transformSmiles(blockStructures.blockSmiles, sequence);
            }
        }).catch(() => {
            this.transformSmiles(blockStructures.blockSmiles, sequence)
        });
    }

    transformSmiles(smiles: any[], sequence: SequenceStructure) {
        let data: any[] = [];
        for (let index = 0; index < smiles.length; index++) {
            data.push({
                id: index,
                databaseId: null,
                acronym: index.toString(),
                smiles: smiles[index].smiles,
                unique: smiles[index].smiles,
                sameAs: null,
                block: null,
                isPolyketide: smiles[index].isPolyketide
            } as BlockStructure);
            this.setState({blocks: data, sequence: sequence}, () => this.blockFinder(data, sequence));
        }
    }

    similarity(data: any[]) {
        let filtered: number[] = [];
        data.forEach((block: any) => {
            if (block.sameAs === null && block.block) {
                filtered.push(block.block.databaseId);
            }
        });
        let token = localStorage.getItem(TOKEN);
        let init;
        if (token) {
            init = {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify({
                    sequencename: this.state.molecule?.structureName ?? '',
                    blocklengthunique: filtered.length,
                    blocklength: data.length,
                    blocks: filtered
                })
            };
        } else {
            init = {
                method: 'post',
                body: JSON.stringify({
                    sequencename: this.state.molecule?.structureName ?? '',
                    blocklengthunique: filtered.length,
                    blocklength: data.length,
                    blocks: filtered
                })
            };
        }
        fetch(ENDPOINT + 'container/' + this.state.selectedContainer + '/sim', init).then(response => {
            if (response.status === 200) {
                response.json().then(simData => this.setState({family: simData}));
            }
        });
    }

    /**
     * Find structures on third party databases, by data in form
     */
    async find() {
        if (this.state.sequence && this.state.sequence.sequence && this.state.sequence.sequence !== '') {
            this.setState({
                results: [],
                blocks: [],
                family: [],
                organism: [],
                sequenceEdit: false,
                sequenceId: undefined,
                sequence: undefined
            });
        }
        this.flashRef.current!.activate(FlashType.PENDING);
        let searchInput: HTMLSelectElement | null = document.getElementById('search') as HTMLSelectElement | null;
        let databaseInput: HTMLSelectElement | null = document.getElementById('database') as HTMLSelectElement | null;
        let search = Number(searchInput?.options[searchInput.selectedIndex].value);
        let database = Number(databaseInput?.options[databaseInput.selectedIndex].value);
        let searchParam: HTMLInputElement | null = document.getElementById(SearchEnumHelper.getName(search)) as HTMLInputElement | null;
        let apiKey = localStorage.getItem(CHEMSPIDER_KEY) ?? undefined;
        let token = localStorage.getItem(TOKEN);
        if (database === ServerEnum.CHEMSPIDER && !token) {
            this.flashRef.current!.activate(FlashType.BAD, 'You need to login');
        } else if (database === ServerEnum.CHEMSPIDER && !apiKey && token) {
            this.flashRef.current!.activate(FlashType.BAD, 'Please setup apikey');
        } else {
            let finder: IFinder = ServerEnumHelper.getFinder(database, apiKey);
            let response;
            if (search === SearchEnum.SMILES && database === ServerEnum.MASS_SPEC_BLOCKS) {
                let blockStructures = smilesDrawer.buildBlockSmiles();
                response = await SearchEnumHelper.find(search, finder, blockStructures.blockSmiles.map((block: any) => block.smiles));
            } else {
                response = await SearchEnumHelper.find(search, finder, searchParam?.value);
            }
            if (response.length === 0) {
                this.flashRef.current!.activate(FlashType.BAD, 'Nothing found');
            } else if (response.length === 1) {
                this.flashRef.current!.activate(FlashType.OK);
                this.select(response[0], search);
            } else {
                this.flashRef.current!.activate(FlashType.OK, 'Found more, select one');
                this.setState({results: response});
                this.props.history.push('#results');
            }
        }
    }

    /**
     * Choose one among more results from findings
     * @param molecule chosen one
     * @param search by which parameter was searched
     */
    select(molecule: SingleStructure, search ?: number) {
        if (search === undefined) {
            let searchInput: HTMLSelectElement = document.getElementById('search') as HTMLSelectElement;
            search = Number(searchInput?.options[searchInput.selectedIndex].value);
        }
        let smilesInput: HTMLTextAreaElement = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement;
        smilesInput.value = molecule.smiles ?? '';
        let formulaInput: HTMLInputElement | null = document.getElementById('formula') as HTMLInputElement;
        formulaInput.value = molecule.formula ?? '';
        let massInput: HTMLInputElement | null = document.getElementById('mass') as HTMLInputElement;
        massInput.value = ((molecule.mass ?? '') === 0) ? '' : (molecule.mass ?? '').toString();
        let identifierInput: HTMLInputElement | null = document.getElementById('identifier') as HTMLInputElement;
        identifierInput.value = molecule.identifier ?? '';
        let nameInput: HTMLInputElement | null = document.getElementById('name') as HTMLInputElement;
        if (search !== SearchEnum.NAME) {
            nameInput.value = molecule.structureName ?? '';
        } else {
            molecule.structureName = nameInput?.value ?? molecule.structureName;
        }
        this.setState({results: [], molecule: molecule}, () => this.drawSmiles(molecule.smiles));
        window.scrollTo(0, 0);
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
        this.decaysReset();
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement | null;
        if (smilesInput?.value === undefined || smilesInput?.value === "") {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_NOTHING_TO_CONVERT);
        } else {
            let smiles = Canonical.getCanonicalSmiles(smilesInput.value);
            smilesInput.value = smiles;
            let molecule = this.state.molecule;
            if (molecule) {
                molecule.smiles = smiles;
                this.setState({molecule: molecule}, () => this.drawSmiles(smiles));
            } else {
                this.drawSmiles(smiles);
            }
        }
    }

    decaysReset() {
        if (this.state.sequence && this.state.sequence.sequence && this.state.sequence.sequence !== '') {
            let sequence = this.state.sequence;
            sequence.decays = '';
            this.setState({
                sequence: sequence
            });
        }
    }

    /**
     * Convert SMILES to Unique SMILES
     */
    unique() {
        this.decaysReset();
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement | null;
        if (smilesInput?.value === undefined || smilesInput?.value === "") {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_NOTHING_TO_CONVERT);
        } else {
            fetch(ENDPOINT + SMILES_UNIQUE, {
                method: 'POST',
                body: JSON.stringify([{smiles: smilesInput.value}])
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        smilesInput!.value = data[0].unique ?? data[0].smiles;
                        let molecule = this.state.molecule;
                        if (molecule) {
                            molecule.smiles = data[0].unique ?? data[0].smiles;
                            this.setState({molecule: molecule});
                        }
                        this.drawSmiles(data[0].unique ?? data[0].smiles)
                    });
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
            largeSmilesDrawer.draw(tree, ELEMENT_LARGE_CANVAS);
        });
    }

    edit(blockId: number) {
        this.setState({editable: blockId});
    }

    editEnd() {
        this.setState({editable: undefined, blockEdit: undefined});
    }

    replaceSequence(sequence: string, lastAcronym: string, newAcronym: string) {
        if (sequence === "") {
            return sequence;
        }
        return sequence.replaceAll('[' + lastAcronym + ']', '[' + newAcronym + ']');
    }

    replaceSequenceOne(sequence: string, blockId: number, lastAcronym: string, newAcronym: string) {
        if (sequence === "") {
            return sequence;
        }
        let n = 0;
        for (let i = 0; i < this.state.blocks.length; ++i) {
            if (this.state.blocks[i].acronym === lastAcronym) {
                ++n;
            }
            if (this.state.blocks[i].id === blockId) {
                break;
            }
        }
        return sequence.replace(RegExp("(\\[" + lastAcronym + "\\]){" + n + "}"), '[' + newAcronym + ']');
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
            if (this.state.editSame) {
                sequence.sequence = this.replaceSequence(sequence.sequence, blocks[blockId].acronym, acronym.value);
            } else {
                sequence.sequence = this.replaceSequenceOne(sequence.sequence, blockId, blocks[blockId].acronym, acronym.value);
            }
        }
        if (this.state.editSame) {
            let blocksCopy = [...blocks];
            let sameAs = blocks[blockId].sameAs === null ? blockId : blocks[blockId].sameAs;
            let sameBlocks = blocksCopy.filter(block => block.sameAs === sameAs || block.id === sameAs);
            sameBlocks.forEach(block => {
                blocks[block.id].acronym = acronym.value;
                blocks[block.id].smiles = smiles.value;
                blocks[block.id].unique = smiles.value;
                blocks[block.id].isPolyketide = name.value.includes(POLYKETIDE_PREFIX);
                if (!blocks[block.id].block) {
                    blocks[block.id].block = new SingleStructure(
                        identifier.value,
                        Number(source.value),
                        name.value,
                        smiles.value,
                        formula.value,
                        Number(mass.value)
                    );
                } else {
                    blocks[block.id].block!.structureName = name.value;
                    blocks[block.id].block!.formula = formula.value;
                    blocks[block.id].block!.mass = Number(mass.value);
                    blocks[block.id].block!.database = Number(source.value);
                    blocks[block.id].block!.identifier = identifier.value;
                }
                blocks[block.id].block!.losses = losses.value;
                if (this.state.blockEdit && this.state.blockEdit.id !== -1) {
                    blocks[block.id].databaseId = this.state.blockEdit.id;
                } else {
                    blocks[block.id].databaseId = null;
                }
                let newSame = blocks.filter(same => same.id !== block.id).find(b => b.acronym === blocks[block.id].acronym && b.databaseId === blocks[block.id].databaseId);
                if (newSame) {
                    blocks[block.id].sameAs = newSame.id;
                }
            });
        } else {
            blocks[blockId].acronym = acronym.value;
            blocks[blockId].smiles = smiles.value;
            blocks[blockId].unique = smiles.value;
            blocks[blockId].isPolyketide = name.value.includes(POLYKETIDE_PREFIX);
            if (!blocks[blockId].block) {
                blocks[blockId].block = new SingleStructure(
                    identifier.value,
                    Number(source.value),
                    name.value,
                    smiles.value,
                    formula.value,
                    Number(mass.value)
                );
            } else {
                blocks[blockId].block!.structureName = name.value;
                blocks[blockId].block!.formula = formula.value;
                blocks[blockId].block!.mass = Number(mass.value);
                blocks[blockId].block!.database = Number(source.value);
                blocks[blockId].block!.identifier = identifier.value;
            }
            blocks[blockId].block!.losses = losses.value;
            if (this.state.blockEdit && this.state.blockEdit.id !== -1) {
                blocks[blockId].databaseId = this.state.blockEdit.id;
            } else {
                blocks[blockId].databaseId = null;
            }
            let pointerToThisBlock = blocks.filter(b => b.sameAs === blockId);
            if (pointerToThisBlock.length > 0) {
                let newBaseBlock = pointerToThisBlock[0];
                pointerToThisBlock.forEach(b => blocks[b.id].sameAs = newBaseBlock.id);
                blocks[newBaseBlock.id].sameAs = null;
            } else {
                blocks[blockId].sameAs = null;
            }
            let newSame = blocks.filter(same => same.id !== blockId).find(b => b.acronym === blocks[blockId].acronym && b.databaseId === blocks[blockId].databaseId);
            if (newSame) {
                blocks[blockId].sameAs = newSame.id;
            }
        }
        this.setState({blocks: blocks, sequence: sequence});
        this.editEnd();
    }

    editorClose(smiles: string) {
        if (this.state.editorSequence) {
            let molecule = this.state.molecule;
            if (!molecule) {
                molecule = this.moleculeData();
            }
            molecule.smiles = smiles;
            let sequence = this.state.sequence;
            if (sequence) {
                sequence!.decays = '';
            }
            fetch(ENDPOINT + 'smiles/formula', {
                method: 'POST',
                body: JSON.stringify([{smiles: smiles, computeLosses: 'None'}])
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        if (data.length > 0) {
                            if (molecule) {
                                molecule.formula = data[0].formula;
                                molecule.mass = data[0].mass;
                            }
                        }
                        this.setState({
                            editorSequence: false,
                            molecule: molecule,
                            sequence: sequence
                        }, () => this.drawSmiles(smiles));
                    }).catch(() => this.setState({
                        editorSequence: false,
                        molecule: molecule,
                        sequence: sequence
                    }, () => this.drawSmiles(smiles)));
                }
            }).catch(() => this.setState({
                editorSequence: false,
                molecule: molecule,
                sequence: sequence
            }, () => this.drawSmiles(smiles)));
        } else if (this.state.editorBlockId || this.state.editorBlockId === 0) {
            let blocks = this.state.blocks;
            let blocksCopy = [...blocks];
            if (this.state.editSame) {
                let sameBlocks = blocksCopy.filter(block => block.sameAs === this.state.editorBlockId || block.id === this.state.editorBlockId);
                fetch(ENDPOINT + 'smiles/formula', {
                    method: 'POST',
                    body: JSON.stringify([{
                        smiles: smiles,
                        computeLosses: (this.state.blocks.find(e => e.id === this.state.editorBlockId)?.isPolyketide) ? H2 : H2O
                    }])
                }).then(response => {
                    if (response.status === 200) {
                        response.json().then(data => {
                            sameBlocks.forEach(block => {
                                blocks[block.id].smiles = smiles;
                                blocks[block.id].unique = smiles;
                                blocks[block.id].block!.formula = data[0].formula;
                                blocks[block.id].block!.mass = data[0].mass;
                            });
                            this.setState({blocks: blocks});
                        });
                    }
                });
            } else {
                let blockId = this.state.editorBlockId;
                fetch(ENDPOINT + 'smiles/formula', {
                    method: 'POST',
                    body: JSON.stringify([{
                        smiles: smiles,
                        computeLosses: (this.state.blocks.find(e => e.id === this.state.editorBlockId)?.isPolyketide) ? H2 : H2O
                    }])
                }).then(response => {
                    if (response.status === 200) {
                        response.json().then(data => {
                            blocks[blockId].smiles = smiles;
                            blocks[blockId].unique = smiles;
                            blocks[blockId].block!.formula = data[0].formula;
                            blocks[blockId].block!.mass = data[0].mass;
                            this.setState({blocks: blocks});
                        });
                    }
                });
            }
        }
    }

    moleculeData() {
        let searchInput: HTMLSelectElement | null = document.getElementById('database') as HTMLSelectElement;
        let search = Number(searchInput?.options[searchInput.selectedIndex].value);
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement;
        let formulaInput: HTMLInputElement | null = document.getElementById('formula') as HTMLInputElement;
        let massInput: HTMLInputElement | null = document.getElementById('mass') as HTMLInputElement;
        let identifierInput: HTMLInputElement | null = document.getElementById('identifier') as HTMLInputElement;
        let nameInput: HTMLInputElement | null = document.getElementById('name') as HTMLInputElement;
        return new SingleStructure(
            identifierInput.value,
            search,
            nameInput.value,
            smilesInput.value,
            formulaInput.value,
            Number(massInput.value)
        );
    }

    refreshMolecule() {
        let searchInput: HTMLSelectElement | null = document.getElementById('database') as HTMLSelectElement;
        let search = Number(searchInput?.options[searchInput.selectedIndex].value);
        let searchParam = (document.getElementById('search')) as HTMLSelectElement;
        this.setState({
            molecule: this.moleculeData(),
            source: search,
            searchParam: searchParam?.options[searchParam.selectedIndex].value
        });
    }

    refreshFormula(event: any) {
        try {
            let moleculeData = this.moleculeData();
            moleculeData.mass = Number(ComputeHelper.computeMass(event.target.value).toFixed(DECIMAL_PLACES));
            this.setState({molecule: moleculeData});
        } catch (e) {
            /** Empty on purpose - wrong formula input*/
        }
    }

    refreshSmiles(event: any) {
        fetch(ENDPOINT + 'smiles/formula', {
            method: 'POST',
            body: JSON.stringify([{smiles: event.target.value, computeLosses: 'None'}])
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    if (data.length > 0) {
                        let moleculeData = this.moleculeData();
                        moleculeData.formula = data[0].formula;
                        moleculeData.mass = data[0].mass;
                        this.setState({molecule: moleculeData});
                    }
                });
            }
        });
    }

    blockRefreshFormula(event: any) {
        try {
            let mass = ComputeHelper.computeMass(event.target.value);
            (document.getElementById(TXT_EDIT_BLOCK_MASS) as HTMLInputElement).value = isNaN(mass) ? '' : mass.toFixed(DECIMAL_PLACES);
        } catch (e) {
            /** Empty on purpose - wrong formula input*/
        }
    }

    blockRefreshSmiles(event: any) {
        fetch(ENDPOINT + 'smiles/formula', {
            method: 'POST',
            body: JSON.stringify([{
                smiles: event.target.value,
                computeLosses: this.state.blocks.find(e => e.id === this.state.editable)?.isPolyketide ? H2 : H2O
            }])
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    if (data.length > 0) {
                        (document.getElementById(TXT_EDIT_BLOCK_FORMULA) as HTMLInputElement).value = data[0].formula;
                        (document.getElementById(TXT_EDIT_BLOCK_MASS) as HTMLInputElement).value = data[0].mass;
                    }
                });
            }
        });
    }

    removeBlock(key: number) {
        let block = this.state.blocks.find(e => e.id === key);
        let position = this.getAcronymPosition(key);
        if (block && this.state.sequence && this.state.sequence.sequenceOriginal && this.state.sequence.sequence) {
            let sequenceOriginal = this.removeFromSequence(this.state.sequence?.sequenceOriginal, position, key.toString());
            let sequence = this.removeFromSequence(this.state.sequence?.sequence, position, block.acronym);
            this.setState({
                blocks: this.state.blocks.filter(e => e.id !== key),
                sequence: {
                    sequence: sequence,
                    sequenceOriginal: sequenceOriginal,
                    sequenceType: this.state.sequence.sequenceType,
                    decays: this.state.sequence.decays
                }
            })
        }
        this.setState({blocks: this.state.blocks.filter(e => e.id !== key)})
    }

    removeFromSequence(sequence: string, position: any, acronym: string) {
        let cntPosition = 0;
        let positionIndex = 0;
        let inBracket = false;
        let bracketPosition = 0;
        let end = false;
        let endings = false;
        for (let i = 0; i < sequence.length; ++i) {
            switch (sequence[i]) {
                case '[':
                    cntPosition++;
                    if (cntPosition === position.position) {
                        positionIndex = i;
                        if (inBracket) {
                            endings = true;
                        } else {
                            end = true;
                        }
                    }
                    break;
                case '(':
                    inBracket = true;
                    bracketPosition = i;
                    continue;
                case ')':
                    if (endings) {
                        end = true;
                        break;
                    }
                    inBracket = false;
                    bracketPosition = 0;
                    continue;
                default:
                    continue;
            }
            if (end) {
                break;
            }
        }
        if (position.removeBracket) {
            let newSequence = this.removeSequenceAcronyms(sequence, inBracket, positionIndex, acronym);
            let positionEnd = newSequence.indexOf(')', bracketPosition);
            return newSequence.substr(0, bracketPosition - 1) + '-' + newSequence.substring(bracketPosition + 1, positionEnd - 1) + '-' + newSequence.substring(positionEnd + 1);
        } else {
            return this.removeSequenceAcronyms(sequence, inBracket, positionIndex, acronym);
        }
    }

    removeSequenceAcronyms(sequence: string, inBracket: boolean, positionIndex: number, acronym: string) {
        if (inBracket) {
            if (sequence[positionIndex - 1] === '(') {
                return sequence.substr(0, positionIndex) + sequence.substring(positionIndex + acronym.length + 3);
            }
            return sequence.substr(0, positionIndex) + sequence.substring(positionIndex + acronym.length + 3);
        } else {
            if (positionIndex + acronym.length + 2 > sequence.length || sequence[positionIndex + acronym.length + 2] !== '-') {
                if (positionIndex - 1 > 0 && sequence[positionIndex - 1] === '-') {
                    return sequence.substring(0, positionIndex - 1) + sequence.substring(positionIndex + acronym.length + 2);
                }
                return sequence.substring(0, positionIndex) + sequence.substring(positionIndex + acronym.length + 2);
            } else {
                return sequence.substring(0, positionIndex) + sequence.substring(positionIndex + acronym.length + 3);
            }
        }
    }

    getAcronymPosition(key: number) {
        if (this.state.sequence && this.state.sequence.sequenceOriginal) {
            let cntPosition = 0;
            let position = 0;
            let inBracket = false;
            let cntInBracket = 0;
            let end = false;
            let endings = false;
            for (let i = 0; i < this.state.sequence.sequenceOriginal.length; ++i) {
                switch (this.state.sequence.sequenceOriginal[i]) {
                    case '[':
                        cntPosition++;
                        if (inBracket) {
                            cntInBracket++;
                        }
                        let char = '';
                        let acronymString = '';
                        while (char !== ']') {
                            acronymString += char;
                            i++;
                            char = this.state.sequence.sequenceOriginal[i];
                        }
                        if (acronymString === key.toString()) {
                            position = cntPosition;
                            if (cntInBracket) {
                                endings = true;
                            } else {
                                end = true;
                            }
                            break;
                        }
                        i--;
                        continue;
                    case '(':
                        inBracket = true;
                        continue;
                    case ')':
                        if (endings) {
                            end = true;
                            break;
                        }
                        inBracket = false;
                        cntInBracket = 0;
                        continue;
                    default:
                        continue;
                }
                if (end) {
                    break;
                }
            }
            return {position: position, removeBracket: inBracket && cntInBracket === 2};
        }
    }

    fetchBlockOptions() {
        let token = localStorage.getItem(TOKEN);
        let init: any = {method: 'GET'};
        if (token) {
            init = {
                method: 'GET',
                headers: {'x-auth-token': token},
            };
        }

        fetch(ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + '/block?sort=acronym&order=asc', init).then(response => {
            if (response.status === 200) {
                response.json().then(data => {
                    let options = data.map((block: any) => {
                        return {value: block.id, label: block.acronym}
                    });
                    options.unshift(new SelectOption('-1', 'Not in DB'));
                    this.setState({
                        blocksAll: data,
                        blockOptions: options,
                    })
                });
            }
        });
    }

    blockDbChange(newValue: any) {
        let block = this.state.blocksAll.find(blc => blc.id === newValue.value);
        if (block) {
            let editBlock = {
                id: block.id,
                acronym: block.acronym,
                smiles: block.smiles,
                unique: block.uniqueSmiles,
                blockName: block.blockName,
                formula: block.formula,
                mass: block.mass,
                losses: block.losses,
                source: block.source,
                identifier: block.identifier
            };
            this.setState({blockEdit: editBlock});
        } else {
            this.setState({blockEdit: undefined});
        }
    }

    render() {
        return (
            <section className={styles.page + ' ' + styles.mainPage} id={'main'}>
                <Helmet>
                    <title>{this.state.title}</title>
                </Helmet>
                <PopupSmilesDrawer id='popupLargeSmiles' className={styles.popupLarge} ref={this.popupRef}/>
                <PopupEditor id={'popupEditor'} className={styles.popupLarge + ' ' + styles.popupLargeEditor}
                             ref={this.popupEditorRef}
                             onClose={this.editorClose}/>
                <section>
                    <div className={styles.drawerArea}>
                        <canvas id='drawArea' onClick={this.handle}/>
                    </div>

                    <div className={styles.drawerInput}>
                        <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>
                        <Flash textBad='Failure!' textOk='Success!' ref={this.flashNotice}/>
                        <h2>{this.state.selectedContainerName}</h2>
                        <label htmlFor='database' className={styles.main}>Database</label>
                        <SelectInput id="database" name="database" className={styles.main}
                                     options={ServerEnumHelper.getSearchOptions(this.state.selectedContainerName)}
                                     onChange={this.refreshMolecule}/>

                        <label htmlFor='search' className={styles.main}>Search by</label>
                        <SelectInput id="search" name="search" className={styles.main}
                                     options={SearchEnumHelper.getOptionsBySource(this.state.source)}
                                     selected={this.state.searchParam}
                                     onChange={this.refreshMolecule}/>

                        <label htmlFor='name' className={styles.main}>Name</label>
                        <TextInput name={'name'} id={'name'} value={this.state.molecule?.structureName ?? ''}
                                   className={styles.main} onKeyDown={(e) => this.enterFind(e)}
                                   onChange={this.refreshMolecule}/>

                        <label htmlFor='smiles' className={styles.main}>SMILES</label>
                        <TextArea name={'smiles'} id={'smiles'} className={styles.main}
                                  value={this.state.molecule?.smiles ?? ''} onInput={() => {
                            let sequence = this.state.sequence;
                            if (sequence) {
                                sequence!.decays = '';
                                this.setState({sequence: sequence});
                            }
                            this.drawSmiles();
                        }} onKeyDown={(e) => this.enterFind(e)} onChange={this.refreshSmiles}/>

                        <label htmlFor='formula' className={styles.main}>Molecular Formula</label>
                        <TextInput name={'formula'} id={'formula'} value={this.state.molecule?.formula ?? ''}
                                   className={styles.main} onKeyDown={(e) => this.enterFind(e)}
                                   onChange={this.refreshFormula}/>

                        <label htmlFor='mass' className={styles.main}>Monoisotopic Mass</label>
                        <TextInput name={'mass'} id={'mass'}
                                   value={this.state.molecule?.mass ? this.state.molecule.mass.toString() : ''}
                                   className={styles.main} onKeyDown={(e) => this.enterFind(e)}
                                   onChange={this.refreshMolecule}/>

                        <label htmlFor='identifier' className={styles.main}>Identifier</label>
                        <TextInput name={'identifier'} id={'identifier'} value={this.state.molecule?.identifier ?? ''}
                                   className={styles.main} onKeyDown={(e) => this.enterFind(e)}
                                   onChange={this.refreshMolecule}/>

                        <div className={styles.buttons}>
                            <div className={styles.twoButtons}>
                                <button onClick={this.find}>Find</button>
                                <button onClick={() => {
                                    this.setState({editorSequence: true});
                                    this.popupEditorRef.current!.activate(this.state.molecule?.smiles ?? '');
                                }}>Edit
                                </button>
                            </div>
                            <div className={styles.twoButtons}>
                                <button onClick={this.canonical}>Generic&nbsp;SMILES</button>
                                <button onClick={this.unique}>Unique&nbsp;SMILES</button>
                            </div>
                            <div className={styles.twoButtons}>
                                <button onClick={this.buildBlocks}>Build&nbsp;Blocks</button>
                                <button onClick={this.save}>Save</button>
                            </div>
                        </div>
                    </div>
                </section>

                {this.state.results.length > 1 ?
                    <section id='results'>
                        {this.state.results.map(molecule => (
                            <section className={styles.results} title={molecule.structureName}>
                                <canvas id={'canvas-small-' + molecule.identifier} className={styles.canvasSmall}
                                        data-smiles={molecule.smiles ?? ''}
                                        onClick={() => molecule.smiles ? this.showLargeSmiles(molecule.smiles) : () => {/* On purpose */
                                        }}/>
                                <div className={styles.itemResults}>{molecule.formula}</div>
                                <div
                                    className={styles.itemResults}>{isNaN(molecule.mass ?? 0) ? '' : Number(molecule.mass).toFixed(DECIMAL_PLACES)}</div>
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
                    <section id={'results'}>
                        <ModificationComponent containerId={this.state.selectedContainer}
                                               blockLength={this.state.blocks.length}
                                               sequenceType={this.state.sequence?.sequenceType}
                                               sequence={this.state.sequence?.sequence}
                                               modifications={this.state.modifications}
                                               nModification={this.state.nModification}
                                               cModification={this.state.cModification}
                                               bModification={this.state.bModification}
                                               family={this.state.family}
                                               editSame={this.state.editSame}
                                               onEditChange={(newValue: boolean) => this.setState({editSame: newValue})}
                                               onFamilyChange={(family: any[]) => this.setState({family: family})}
                                               onOrganismChange={(organism: any[]) => this.setState({organism: organism})}
                                               organism={this.state.organism}/>
                        <table className={styles.tableLarge}>
                            <thead>
                            <tr>
                                <th>MSB acronym</th>
                                <th>Preview</th>
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
                                    <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <Creatable className={styles.creatable} id={TXT_EDIT_BLOCK_DB_ACRONYM}
                                                   options={this.state.blockOptions}
                                                   onChange={this.blockDbChange}/> : (block.databaseId ? block.acronym : '')}</td>
                                    <td>
                                        <canvas id={'canvas-small-' + block.id} className={styles.canvasSmall}
                                                data-smiles={block.unique}
                                                onClick={() => this.showLargeSmiles(block.unique ?? '')}/>
                                    </td>
                                    <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput className={styles.filter}
                                                   value={this.state.editable === block.id ? (this.state.blockEdit ? this.state.blockEdit.acronym : block.acronym) : block.acronym}
                                                   name={TXT_EDIT_BLOCK_ACRONYM}
                                                   id={TXT_EDIT_BLOCK_ACRONYM}/> : block.acronym}</td>
                                    <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput className={styles.filter}
                                                   value={this.state.editable === block.id ? (this.state.blockEdit ? this.state.blockEdit.unique : block.unique) : block.unique ?? ''}
                                                   name={TXT_EDIT_BLOCK_SMILES} onChange={this.blockRefreshSmiles}
                                                   id={TXT_EDIT_BLOCK_SMILES}/> : block.unique}</td>
                                    <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput className={styles.filter} name={TXT_EDIT_BLOCK_NAME}
                                                   id={TXT_EDIT_BLOCK_NAME}
                                                   value={this.state.editable === block.id ? (this.state.blockEdit ? this.state.blockEdit.blockName : block.block?.structureName) : block.block?.structureName ?? ''}/> : block.block?.structureName}</td>
                                    <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput className={styles.filter} id={TXT_EDIT_BLOCK_FORMULA}
                                                   name={TXT_EDIT_BLOCK_FORMULA} onChange={this.blockRefreshFormula}
                                                   value={this.state.editable === block.id ? (this.state.blockEdit ? this.state.blockEdit.formula : block.block?.formula) : block.block?.formula ?? ''}/> : block.block?.formula}</td>
                                    <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput className={styles.filter} id={TXT_EDIT_BLOCK_MASS}
                                                   name={TXT_EDIT_BLOCK_MASS}
                                                   value={this.state.editable === block.id ? (this.state.blockEdit ? this.state.blockEdit.mass.toFixed(DECIMAL_PLACES) : block.block?.mass?.toFixed(DECIMAL_PLACES)) : block.block?.mass?.toFixed(DECIMAL_PLACES) ?? ''}/> : block.block?.mass?.toFixed(DECIMAL_PLACES)}</td>
                                    <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput className={styles.filter} id={TXT_EDIT_BLOCK_LOSSES}
                                                   name={TXT_EDIT_BLOCK_LOSSES}
                                                   value={this.state.editable === block.id ? (this.state.blockEdit ? this.state.blockEdit.losses : block.block?.losses) : block.block?.losses ?? ''}/> : block.block?.losses}</td>
                                    <td>
                                        {this.state.editable === block.id
                                            ? <div><SelectInput id={SEL_EDIT_SOURCE} name={SEL_EDIT_SOURCE}
                                                                options={ServerEnumHelper.getOptions()}
                                                                selected={this.state.blockEdit ? (this.state.blockEdit.source ? this.state.blockEdit.toString() : '') : block.block?.database.toString()}/>
                                                <TextInput className={styles.filter}
                                                           value={this.state.blockEdit ? this.state.blockEdit.identifier : block.block?.identifier ?? ''}
                                                           id={TXT_EDIT_IDENTIFIER} name={TXT_EDIT_IDENTIFIER}/></div>
                                            :
                                            <a href={ServerEnumHelper.getLink(Number(block.block?.database), block.block?.identifier ?? '')}
                                               target={'_blank'}
                                               rel={'noopener noreferrer'}>{ServerEnumHelper.getFullId(Number(block.block?.database), block.block?.identifier ?? '')}</a>}</td>
                                    <td>
                                        {this.state.editable === block.id ? <button className={styles.update}
                                                                                    onClick={() => this.update(block.id)}>Update</button> :
                                            <div/>}
                                        {this.state.editable === block.id ?
                                            <button className={styles.delete} onClick={this.editEnd}>Cancel</button> :
                                            <div/>}
                                        <button className={styles.update} onClick={() => {
                                            this.setState({editorBlockId: block.id, editable: block.id});
                                            this.popupEditorRef.current!.activate(block.unique ?? '');
                                        }}>Editor
                                        </button>
                                        <button onClick={() => FetchHelper.findReference(block.id, block.unique ?? block.smiles, this, SEL_EDIT_SOURCE, TXT_EDIT_IDENTIFIER)}>FindRef</button>
                                        <button className={styles.delete}
                                                onClick={() => this.removeBlock(block.id)}>Remove
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
