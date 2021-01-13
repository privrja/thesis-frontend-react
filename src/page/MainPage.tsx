import * as React from "react";
import styles from "../main.module.scss";
// @ts-ignore
import * as SmilesDrawer from 'smiles-drawer';
import {OPTION_DRAW_DECAY_POINTS, OPTION_THEMES} from "../constant/SmilesDrawerConstants";
import {SelectInput} from "../component/SelectInput";
import {ServerEnumHelper} from "../enum/ServerEnum";
import {SearchEnumHelper} from "../enum/SearchEnum";

let smilesDrawer: SmilesDrawer.Drawer;

class MainPage extends React.Component {

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

    private buildBlocks() {
        console.log(smilesDrawer.buildBlockSmiles());
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
                            <button>Find</button>
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
