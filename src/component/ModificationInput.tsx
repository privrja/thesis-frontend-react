import * as React from "react";
import styles from "../main.module.scss";
import ModificationSelect from "./ModificationSelect";
import {SelectOption} from "./SelectInput";
import Modification from "../structure/Modification";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus, faMinus} from '@fortawesome/free-solid-svg-icons'
import TextInput from "./TextInput";
import CheckInput from "./CheckInput";

interface Props {
    type: string;
    title: string;
    modifications?: Modification[];
    modification?: any;
}

interface State {
    isVisible: boolean;
    isDisabled: boolean;
    title: string;
    modification?: any
}

const MODIFICATION = '-modification';
const FORMULA = '-formula';
const NTERMINAL = '-nterminal';
const CTERMINAL = '-cterminal';

class ModificationInput extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.select = this.select.bind(this);
        this.activate = this.activate.bind(this);
        this.deactivate = this.deactivate.bind(this);
        this.disable = this.disable.bind(this);
        this.unDisable = this.unDisable.bind(this);
        let modification = this.props.modification;
        if (!modification) {
            modification = {id: null, modificationName: '', formula: '', nTerminal: this.props.type === 'n', cTerminal: this.props.type === 'c'};
        }
        this.state = {
            isVisible: this.props.modification !== undefined && this.props.modification !== null,
            isDisabled: false,
            title: props.title,
            modification: modification
        };
    }

    select(): void {
        let selectedModification = document.getElementById('sel-' + this.props.type + MODIFICATION) as HTMLSelectElement;
        if (selectedModification) {
            let modification = this.props.modifications?.find(e => e.id === parseInt(selectedModification.value));
            if (modification) {
                this.setState({
                    modification: {
                        id: modification.id,
                        modificationName: modification.modificationName,
                        formula: modification.modificationFormula,
                        nTerminal: modification.nTerminal,
                        cTerminal: modification.cTerminal,
                    }
                });
                ModificationInput.disableInput('txt-' + this.props.type + MODIFICATION);
                ModificationInput.disableInput('txt-' + this.props.type + FORMULA);
                ModificationInput.disableInput('chk-' + this.props.type + NTERMINAL);
                ModificationInput.disableInput('chk-' + this.props.type + CTERMINAL);
            } else {
                this.setState({modification: {id: null, modificationName: '', formula: '', nTerminal: this.props.type === 'n', cTerminal: this.props.type === 'c'}});
                ModificationInput.unDisableInput('txt-' + this.props.type + MODIFICATION);
                ModificationInput.unDisableInput('txt-' + this.props.type + FORMULA);
                ModificationInput.unDisableInput('chk-' + this.props.type + NTERMINAL);
                ModificationInput.unDisableInput('chk-' + this.props.type + CTERMINAL);
            }
        }
    }

    changeTitle(title: string) {
        this.setState({title: title});
    }

    defaultTitle() {
        this.changeTitle(this.props.title);
    }

    private static disableInput(elemId: string) {
        let elem = document.getElementById(elemId) as HTMLInputElement;
        elem.disabled = true;
    }

    private static unDisableInput(elemId: string) {
        let elem = document.getElementById(elemId) as HTMLInputElement;
        elem.disabled = false;
    }

    activate() {
        this.setState({isVisible: true});
    }

    deactivate() {
        this.setState({isVisible: false});
    }

    disable() {
        this.setState({isDisabled: true});
    }

    unDisable() {
        this.setState({isDisabled: false});
    }

    render() {
        return (
            !this.state.isDisabled ?

                <div className={styles.divModification}>
                    <h4>{this.state.title} {this.state.isVisible ?
                        <FontAwesomeIcon icon={faMinus} onClick={this.deactivate} className={styles.cursorPointer}/> :
                        <FontAwesomeIcon icon={faPlus} onClick={this.activate} className={styles.cursorPointer}/>}</h4>

                    {this.state.isVisible ?

                        <div id={'div-' + this.props.type + MODIFICATION} className={styles.divLeft}>

                            {this.props.modifications && this.props.modifications.length > 1 ?
                                <ModificationSelect id={'sel-' + this.props.type + MODIFICATION}
                                                    name={'sel-' + this.props.type + MODIFICATION}
                                                    modifications={this.props.modifications}
                                                    defaultOption={new SelectOption('nothing', 'Add new')}
                                                    selected={this.state.modification.id?.toString() ?? 'nothing'}
                                                    onChange={this.select}/>
                                : <div/>
                            }

                            <label htmlFor={'txt-' + this.props.type + MODIFICATION}>Name</label>
                            <TextInput id={'txt-' + this.props.type + MODIFICATION}
                                       name={this.props.type + MODIFICATION}
                                       value={this.state.modification?.modificationName ?? ''}
                                       disabled={this.state.modification.id !== null}
                                       onChange={(e: any) => {
                                           let modification = this.state.modification;
                                           modification.formula = e.value;
                                           this.setState({
                                               modification: modification
                                           });
                                       }}/>

                            <label htmlFor={'txt-' + this.props.type + FORMULA}>Formula</label>
                            <TextInput id={'txt-' + this.props.type + FORMULA}
                                       name={this.props.type + FORMULA}
                                       value={this.state.modification?.formula ?? ''}
                                       disabled={this.state.modification.id !== null}
                                       onChange={(e: any) => {
                                           let modification = this.state.modification;
                                           modification.formula = e.value;
                                           this.setState({
                                               modification: modification
                                           });
                                       }}/>

                            <label htmlFor={'chk-' + this.props.type + NTERMINAL} className="chk">N-terminal</label>
                            <CheckInput name={this.props.type + 'nTerminal'} id={'chk-' + this.props.type + NTERMINAL}
                                        checked={this.state.modification.nTerminal} disabled={this.state.modification.id !== null}/>

                            <label htmlFor={'chk-' + this.props.type + CTERMINAL} className="chk">C-terminal</label>
                            <CheckInput name={this.props.type + 'cTerminal'} id={'chk-' + this.props.type + CTERMINAL}
                                        checked={this.state.modification.cTerminal} disabled={this.state.modification.id !== null}/>
                        </div>
                        : <div/>}
                </div>
                : <div/>
        );
    }
}

export default ModificationInput;
