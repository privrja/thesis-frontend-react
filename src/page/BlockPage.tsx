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
    URL_PREFIX
} from "../constant/ApiConstants";
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import PopupYesNo from "../component/PopupYesNo";
import TextInput from "../component/TextInput";
import ListComponent, {ListState} from "../component/ListComponent";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import {ServerEnumHelper} from "../enum/ServerEnum";
import {SelectInput} from "../component/SelectInput";

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

class BlockPage extends ListComponent<any, State> {

    constructor(props: any) {
        super(props);
        this.state = {list: [], selectedContainer: this.props.match.params.id};
    }

    componentDidMount() {
        if (this.state.selectedContainer) {
            this.defaultListTransformation(this.getEndpoint(), response => {
                let key = Number(localStorage.getItem(EDITOR_ITEM));
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
                if (key) {
                    localStorage.removeItem(EDITOR_ITEM);
                    localStorage.removeItem(EDITOR_SMILES);
                    localStorage.removeItem(EDITOR_BACK);
                }
            });
        }
    }

    findName(key: number): string {
        return this.find(key).acronym;
    }

    getEndpoint() {
        return ENDPOINT + CONTAINER + '/' + this.state.selectedContainer + SBLOCK;
    }

    create(): void {
        // TODO
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
        document.location.href = URL_PREFIX + 'smiles/' + this.find(key).smiles;
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

                    {this.state.list.length > 0 ?
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
                                <th>Identifier</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.list.map(block => (
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
                                        <TextInput value={block.mass.toString()} name={TXT_EDIT_MASS}
                                                   id={TXT_EDIT_MASS}/> : block.mass}</td>
                                    <td onClick={() => this.edit(block.id)}>{this.state.editable === block.id ?
                                        <TextInput value={block.losses} name={TXT_EDIT_LOSSES}
                                                   id={TXT_EDIT_LOSSES}/> : block.losses}</td>
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
                                        <button className={styles.delete} onClick={() => this.popup(block.id)}>Delete
                                        </button>
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
