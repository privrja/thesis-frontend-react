import * as React from "react";
import styles from "../main.module.scss";
// @ts-ignore
import * as SmilesDrawer from 'smiles-drawer';
import {OPTION_DRAW_DECAY_POINTS, OPTION_THEMES} from "../constant/SmilesDrawerConstants";

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

        let input = document.getElementById('textSmiles') as HTMLTextAreaElement;
        SmilesDrawer.parse(input.value, function (tree: any) {
            smilesDrawer.draw(tree, 'drawArea', 'light', false);
        });
    }

    handle(event: React.MouseEvent) {
        const drawArea = document.getElementById('drawArea');
        const smiles = document.getElementById('textSmiles');
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
                        <textarea id='textSmiles' onInput={this.drawSmiles}/>
                        <button onClick={this.buildBlocks}>Build Blocks</button>
                    </div>

                </section>
            </section>
        )
    }

}

export default MainPage;
