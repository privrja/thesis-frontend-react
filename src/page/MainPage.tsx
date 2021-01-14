import * as React from "react";
import styles from "../main.module.scss";
// @ts-ignore
import * as SmilesDrawer from 'smiles-drawer';
import {OPTION_DRAW_DECAY_POINTS, OPTION_THEMES} from "../constant/SmilesDrawerConstants";
import {SelectInput} from "../component/SelectInput";
import {ServerEnumHelper} from "../enum/ServerEnum";
import {SearchEnum, SearchEnumHelper} from "../enum/SearchEnum";
import IFinder from "../finder/IFinder";

let smilesDrawer: SmilesDrawer.Drawer;

class MainPage extends React.Component {

    constructor(props: any, context: any) {
        super(props, context);

        this.find = this.find.bind(this);
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
            let smilesInput: HTMLTextAreaElement | null = document.getElementById('smiles') as HTMLTextAreaElement | null;
            smilesInput!.value = response[0].smiles;
            let formulaInput: HTMLInputElement | null = document.getElementById('formula') as HTMLInputElement | null;
            formulaInput!.value = response[0].formula;
            let massInput: HTMLInputElement | null = document.getElementById('mass') as HTMLInputElement | null;
            massInput!.value = response[0].mass.toString();
            let identifierInput: HTMLInputElement | null = document.getElementById('identifier') as HTMLInputElement | null;
            identifierInput!.value = response[0].identifier.toString();
            let nameInput: HTMLInputElement | null = document.getElementById('name') as HTMLInputElement | null;
            if (search !== SearchEnum.NAME) {
                nameInput!.value = response[0].structureName.toString();
            }
            this.drawSmiles();
        } else {
            // TODO print findings and let user choose
        }
    }

    render() {
        return (
            <section className={styles.page + ' ' + styles.mainPage}>
                <section>
                    <h1>Home</h1>

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
                            <button>Cannonical SMILES</button>
                            <button>Unique SMILES</button>
                            <button onClick={this.buildBlocks}>Build Blocks</button>
                            <button>Save</button>
                        </div>
                    </div>

                </section>
            </section>
        )
    }

}

export default MainPage;
