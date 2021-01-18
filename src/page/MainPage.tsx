import * as React from "react";
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

let smilesDrawer: SmilesDrawer.Drawer;
let largeSmilesDrawer: SmilesDrawer.Drawer;

const DRAW_AREA = 'drawArea';
const ELEMENT_SMILES = 'smiles';
const ERROR_NOTHING_TO_CONVERT = 'Nothing to convert';

interface State {
    results: SingleStructure[];
    molecule?: SingleStructure;
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
        this.state = {results: []};
    }

    componentDidMount(): void {
        this.initializeSmilesDrawer();
    }

    componentDidUpdate() {
        let small = document.getElementsByClassName(styles.canvasSmall);
        if (small.length > 1) {
            SmilesDrawer.apply({width: small[0].clientWidth, height: small[0].clientHeight});
        }
    }

    initializeSmilesDrawer() {
        const area = document.getElementById(DRAW_AREA);
        smilesDrawer = new SmilesDrawer.Drawer({
            width: area!.clientWidth,
            height: area!.clientHeight,
            compactDrawing: false,
            drawDecayPoints: OPTION_DRAW_DECAY_POINTS,
            offsetX: area!.offsetLeft,
            offsetY: area!.offsetTop,
            themes: OPTION_THEMES,
        });

        const large = document.getElementById('popupLargeSmiles');
        largeSmilesDrawer = new SmilesDrawer.Drawer({
            width: large!.clientWidth,
            height: large!.clientHeight,
            compactDrawing: false,
        });

    }

    drawSmiles() {
        let input = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement;
        SmilesDrawer.parse(input.value, function (tree: any) {
            smilesDrawer.draw(tree, DRAW_AREA, 'light', false);
        });
    }

    handle(event: React.MouseEvent) {
        const drawArea = document.getElementById(DRAW_AREA);
        const smiles = document.getElementById(ELEMENT_SMILES);
        if (drawArea && (smiles as HTMLTextAreaElement).value) {
            smilesDrawer.handleMouseClick(event);
        }
    }

    buildBlocks() {
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement | null;
        if (smilesInput?.value === undefined || smilesInput?.value === "") {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_NOTHING_TO_CONVERT);
            return;
        }
        console.log(smilesDrawer.buildBlockSmiles());
    }

    async find() {
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

    select(molecule: SingleStructure, search?: number) {
        this.flashRef.current!.deactivate();
        if (search === undefined) {
            let searchInput: HTMLSelectElement | null = document.getElementById('search') as HTMLSelectElement | null;
            search = Number(searchInput?.options[searchInput.selectedIndex].value);
        }
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement | null;
        smilesInput!.value = molecule.smiles;
        let formulaInput: HTMLInputElement | null = document.getElementById('formula') as HTMLInputElement | null;
        formulaInput!.value = molecule.formula;
        let massInput: HTMLInputElement | null = document.getElementById('mass') as HTMLInputElement | null;
        massInput!.value = molecule.mass.toString();
        let identifierInput: HTMLInputElement | null = document.getElementById('identifier') as HTMLInputElement | null;
        identifierInput!.value = molecule.identifier.toString();
        let nameInput: HTMLInputElement | null = document.getElementById('name') as HTMLInputElement | null;
        if (search !== SearchEnum.NAME) {
            nameInput!.value = molecule.structureName.toString();
        }
        this.drawSmiles();
        this.setState({results: [], molecule: molecule});
        document.location.href = '#home';
    }

    show(database: ServerEnum, identifier: string) {
        window.open(ServerEnumHelper.getLink(database, identifier), '_blank');
    }

    canonical() {
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement | null;
        if (smilesInput?.value === undefined || smilesInput?.value === "") {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_NOTHING_TO_CONVERT);
        } else {
            smilesInput.value = Canonical.getCanonicalSmiles(smilesInput.value);
            this.drawSmiles();
        }
    }

    unique() {
        let smilesInput: HTMLTextAreaElement | null = document.getElementById(ELEMENT_SMILES) as HTMLTextAreaElement | null;
        if (smilesInput?.value === undefined || smilesInput?.value === "") {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_NOTHING_TO_CONVERT);
        } else {
            // TODO request to backend
        }
    }

    showLargeSmiles(smiles: string) {
        this.popupRef.current!.activate();
        SmilesDrawer.parse(smiles, function (tree: any) {
            largeSmilesDrawer.draw(tree, 'popupLargeSmiles', 'light', false);
        });
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
                        <input id="name" name="name" className={styles.main}/>

                        <label htmlFor='smiles' className={styles.main}>SMILES</label>
                        <textarea id='smiles' name="smiles" className={styles.main} onInput={this.drawSmiles}/>

                        <label htmlFor='formula' className={styles.main}>Molecular Formula</label>
                        <input id="formula" className={styles.main} name="formula"/>

                        <label htmlFor='mass' className={styles.main}>Monoisotopic Mass</label>
                        <input id="mass" name="mass" className={styles.main}/>

                        <label htmlFor='identifier' className={styles.main}>Identifier</label>
                        <input id="identifier" name="identifier" className={styles.main}/>

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
            </section>
        )
    }

}

export default MainPage;
