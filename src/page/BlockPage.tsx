import * as React from "react";
import "react-app-polyfill/ie11";
import styles from "../main.module.scss"
import {CONTAINER, ENDPOINT, TOKEN} from "../constant/ApiConstants";
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import PopupYesNo from "../component/PopupYesNo";
import TextInput from "../component/TextInput";
import ListComponent, {ListState} from "../component/ListComponent";

interface State extends ListState {
    blocks: Block[];
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
    source: number;
    identifier: number;
}

interface Values {

}

class BlockPage extends ListComponent<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {blocks: [], selectedContainer: this.props.match.params.id};
    }

    list() {
        const token = localStorage.getItem(TOKEN);
        if (token !== null) {
            fetch(ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + '/block', {
                method: 'GET',
                headers: {'x-auth-token': token}
            })
                .then(response => {
                    if (response.status === 401) {
                        localStorage.removeItem(TOKEN);
                    }
                    return response;
                })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(response => this.setState({blocks: response}));
                    } else {
                        response.json().then(response => this.flashRef.current!.activate(FlashType.BAD, response.message));
                    }
                });
        } else {
            fetch(ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + '/block', {
                method: 'GET',
            })
                .then(response => {
                    if (response.status === 200) {
                        response.json().then(response => this.setState({blocks: response}));
                    } else {
                        response.json().then(response => this.flashRef.current!.activate(FlashType.BAD, response.message));
                    }
                });
        }
    }

    delete(key: string) {
        // TODO
    }

    update(containerId: number) {
        let token = localStorage.getItem(TOKEN);
        if (token) {
        } else {
            this.flashRef.current!.activate(FlashType.BAD, 'You\'re not logged');
        }
    }

    create(): void {
        // TODO
    }


    render() {
        return (
            <section className={styles.page}>
                <section className={styles.pageTable}>
                    <h1>Blocks</h1>
                    <PopupYesNo label={"Realy want to delete block?"} onYes={this.delete} ref={this.popupRef}/>
                    <Flash textBad='Failure!' textOk='Success!' ref={this.flashRef}/>

                    {localStorage.getItem(TOKEN) !== null ?
                        <div>
                            <h2>Create new block</h2>

                        </div> : <div/>
                    }

                    {this.state.blocks.length > 1 ?
                        <table>
                            <thead>
                            <tr>
                                <th>Id</th>
                                <th>Block name</th>
                                <th>Acronym</th>
                                <th>Residue</th>
                                <th>Mass</th>
                                <th>Losses</th>
                                <th>SMILES</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.blocks.map(block => (
                                <tr key={block.id}>
                                    <td>{block.id}</td>
                                    <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput value={block.blockName} name='txt-edit-blockName' id='txt-edit-blockName'/> : block.blockName}</td>
                                    <td>{block.acronym}</td>
                                    <td>{block.formula}</td>
                                    <td>{block.mass}</td>
                                    <td>{block.losses}</td>
                                    <td>{block.uniqueSmiles}</td>
                                    <td>
                                        {this.state.editable === block.id ? <button className={styles.update} onClick={() => this.update(block.id)}>Update</button> : <div/>}
                                        {this.state.editable === block.id ? <button className={styles.delete} onClick={this.editEnd}>Cancel</button> : <div/>}
                                        <button>Go on</button>
                                        <button className={styles.update}>Edit</button>
                                        <button className={styles.delete} onClick={() => this.popup(block.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        : <div/>
                    }
                </section>
            </section>
        )
    }

}

export default BlockPage;
