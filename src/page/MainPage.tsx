import * as React from "react";
import styles from "../main.module.scss";
// @ts-ignore
import * as SmilesDrawer from 'smiles-drawer';
import {OPTION_DRAW_DECAY_POINTS, OPTION_THEMES} from "../constant/SmilesDrawerConstants";
import {SelectInput} from "../component/SelectInput";
import {ServerEnumHelper} from "../enum/ServerEnum";
import {SearchEnum, SearchEnumHelper} from "../enum/SearchEnum";
import IFinder from "../finder/IFinder";
import SingleStructure from "../finder/SingleStructure";

let smilesDrawer: SmilesDrawer.Drawer;

interface State {
    results: SingleStructure[];
    molecule?: SingleStructure;
}

class MainPage extends React.Component<any, State> {

    constructor(props: any, context: any) {
        super(props, context);

        this.find = this.find.bind(this);
        this.show = this.show.bind(this);
        this.state = {results: []};
    }

    drawSmiles() {
        const area = document.getElementById('drawArea');
        if (!smilesDrawer) {
            smilesDrawer = new SmilesDrawer.Drawer({
                width: area!.clientWidth,
                height: area!.clientHeight,
                drawDecayPoints: OPTION_DRAW_DECAY_POINTS,
                offsetX: area!.offsetLeft,
                offsetY: area!.offsetTop,
                themes: OPTION_THEMES,
            });
        }

        let input = document.getElementById('smiles') as HTMLTextAreaElement;
        SmilesDrawer.parse(input.value, function (tree: any) {
            smilesDrawer.draw(tree, 'drawArea', 'light', false);
        });
    }

    handle(event: React.MouseEvent) {
        const drawArea = document.getElementById('drawArea');
        const smiles = document.getElementById('smiles');
        if (drawArea && (smiles as HTMLTextAreaElement).value) {
            smilesDrawer.handleMouseClick(event);
        }
    }

    buildBlocks() {
        console.log(smilesDrawer.buildBlockSmiles());
    }

    async find() {
        let searchInput: HTMLSelectElement | null = document.getElementById('search') as HTMLSelectElement | null;
        let databaseInput: HTMLSelectElement | null = document.getElementById('database') as HTMLSelectElement | null;
        let search = Number(searchInput?.options[searchInput.selectedIndex].value);
        let database = Number(databaseInput?.options[databaseInput.selectedIndex].value);
        let searchParam: HTMLInputElement | null = document.getElementById(SearchEnumHelper.getIdentifier(search)) as HTMLInputElement | null;
        let finder: IFinder = ServerEnumHelper.getFinder(database);
        let response = await SearchEnumHelper.find(search, finder, searchParam?.value);
        console.log(response);

        if (response.length === 0) {
            // TODO activate FLASH not found
        } else if (response.length === 1) {
            this.select(response[0], search);
        } else {
            this.setState({results: response});
            SmilesDrawer.apply({width: 300, height: 300});
            document.location.href = '#results';
        }
    }

    select(molecule: SingleStructure, search?: number) {
        if(search === undefined) {
            let searchInput: HTMLSelectElement | null = document.getElementById('search') as HTMLSelectElement | null;
            search = Number(searchInput?.options[searchInput.selectedIndex].value);
        }
        let smilesInput: HTMLTextAreaElement | null = document.getElementById('smiles') as HTMLTextAreaElement | null;
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

    show() {
        window.open(ServerEnumHelper.getLink(this.state.molecule!.database, this.state.molecule!.identifier), '_blank');
    }

    render() {
        return (
            <section className={styles.page + ' ' + styles.mainPage}>
                <section>
                    <h1 id='home'>Home</h1>

                    <div className={styles.drawerArea}>
                        <canvas id='drawArea' onClick={this.handle}/>
                    </div>

                    <div className={styles.drawerInput}>
                        <label htmlFor='database' className={styles.main}>Database</label>
                        <SelectInput id="database" name="database" className={styles.main}
                                     options={ServerEnumHelper.getServerOptions()}/>

                        <label htmlFor='search' className={styles.main}>Search by</label>
                        <SelectInput id="search" name="search" className={styles.main}
                                     options={SearchEnumHelper.getSearchOptions()}/>

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
                            <button onClick={this.show}>Show original</button>
                            <button>Cannonical SMILES</button>
                            <button>Unique SMILES</button>
                            <button onClick={this.buildBlocks}>Build Blocks</button>
                            <button>Save</button>
                        </div>
                    </div>

                </section>

                {this.state.results.length > 1 ?
                    <section>
                        <h1 id='results'>Results</h1>
                        {this.state.results.map(molecule => (
                            <section className={styles.results} title={molecule.structureName}>
                                <canvas id={'canvas-small-' + molecule.identifier} className={styles.canvasSmall}
                                        data-smiles={molecule.smiles}/>
                                <div className={styles.itemResults}>{molecule.formula}</div>
                                <div className={styles.itemResults}>{molecule.mass}</div>
                                <div className={styles.itemResults + ' ' + styles.cursorPointer} onClick={() => this.select(molecule)}>Select</div>
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
