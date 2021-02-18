import React from "react";
import styles from "../main.module.scss";
import {SelectInput, SelectOption} from "../component/SelectInput";
import {SELECTED_CONTAINER, TOKEN} from "../constant/ApiConstants";
import ModificationImport from "../import/ModificationImport";
import BlockImport from "../import/BlockImport"
import Flash from "../component/Flash";
import FlashType from "../component/FlashType";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";
import BlockMergeImport from "../import/BlockMergeImport";
import SequenceImport from "../import/SequenceImport";

const MODIFICATION = 'Modifications';
const BLOCK = 'Blocks';
const MERGE_BLOCK = 'MergeBlocks';
const SEQUENCE = 'Sequences';

const IMPORT_OPTIONS = [
    new SelectOption(MODIFICATION, MODIFICATION),
    new SelectOption(BLOCK, BLOCK),
    new SelectOption(MERGE_BLOCK, MERGE_BLOCK),
    new SelectOption(SEQUENCE, SEQUENCE)
];

interface State {
    text: string;
}

const SEL_IMPORT_TYPE = 'sel-import-type';

class ImportPage extends React.Component<any, State> {

    flashRef: React.RefObject<Flash>;

    constructor(props: any) {
        super(props);
        this.flashRef = React.createRef();
        this.getSelectedContainer = this.getSelectedContainer.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
    }

    getSelectedContainer(): number {
        let selectedContainer = localStorage.getItem(SELECTED_CONTAINER);
        if (!selectedContainer) {
            selectedContainer = '4';
            localStorage.setItem(SELECTED_CONTAINER, selectedContainer);
        }
        return parseInt(selectedContainer);
    }

    changeHandler(event: any) {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            const reader = new FileReader();
            reader.onload = async () => {
                let importType = document.getElementById(SEL_IMPORT_TYPE) as HTMLSelectElement;
                let errorStack: string[] = [];
                try {
                    switch (importType.value) {
                        case MODIFICATION:
                            errorStack = new ModificationImport(reader.result?.toString() ?? '', this.getSelectedContainer()).import();
                            break;
                        default:
                        case BLOCK:
                            errorStack = new BlockImport(reader.result?.toString() ?? '', this.getSelectedContainer()).import();
                            break;
                        case MERGE_BLOCK:
                            errorStack = new BlockMergeImport(reader.result?.toString() ?? '', this.getSelectedContainer()).import();
                            break;
                        case SEQUENCE:
                            errorStack = new SequenceImport(reader.result?.toString() ?? '', this.getSelectedContainer()).import();
                            break;
                    }
                    console.log(errorStack);
                } catch (e) {
                    this.flashRef.current!.activate(FlashType.BAD, e.message);
                }
            };
            reader.readAsText(event.target.files[0])
        } else {
            this.flashRef.current!.activate(FlashType.BAD, ERROR_LOGIN_NEEDED);
        }
    };

    render() {
        return (
            <section className={styles.page}>
                <section>
                    <h1>Import</h1>
                    <Flash textBad='Failure!' textOk='Success' ref={this.flashRef}/>

                    <SelectInput id={SEL_IMPORT_TYPE} name={SEL_IMPORT_TYPE} options={IMPORT_OPTIONS}/>
                    <input type="file" name="file" onChange={this.changeHandler}/>
                </section>
            </section>
        )
    }

}

export default ImportPage;
