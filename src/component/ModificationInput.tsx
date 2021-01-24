import * as React from "react";
import styles from "../main.module.scss";
import ModificationSelect from "./ModificationSelect";
import {SelectOption} from "./SelectInput";
import Modification from "../structure/Modification";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlus, faMinus, faBan} from '@fortawesome/free-solid-svg-icons'

interface Props {
    type: string;
    title: string;
    modifications?: Modification[];
}

interface State {
    isVisible: boolean;
    isDisabled: boolean;
}

const MODIFICATION = '-modification';
const FORMULA = '-formula';
const MASS = '-mass';
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
        this.state = {isVisible: false, isDisabled: false};
    }

    select(): void {
        let selectedModification = document.getElementById('sel-' + this.props.type + MODIFICATION) as HTMLSelectElement;
        if (selectedModification) {
            let modification = this.props.modifications?.find(e => e.id === parseInt(selectedModification.value));
            if (modification) {
                ModificationInput.setupInput('txt-' + this.props.type + MODIFICATION, modification.modificationName);
                ModificationInput.setupInput('txt-' + this.props.type + FORMULA, modification.modificationFormula);
                ModificationInput.setupInput('txt-' + this.props.type + MASS, modification.modificationMass.toString());
            } else {
                ModificationInput.unDisableInput('txt-' + this.props.type + MODIFICATION);
                ModificationInput.unDisableInput('txt-' + this.props.type + FORMULA);
                ModificationInput.unDisableInput('txt-' + this.props.type + MASS);
            }
        }
    }

    private static setupInput(elemId: string, value: string) {
        let elem = document.getElementById(elemId) as HTMLInputElement;
        elem.value = value;
        elem.disabled = true;
    }

    private static unDisableInput(elemId: string) {
        let elem = document.getElementById(elemId) as HTMLInputElement;
        elem.value = '';
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
            <div className="div-modification">
                <h4>{this.props.title} {this.state.isDisabled ? <FontAwesomeIcon icon={faBan}/> : this.state.isVisible ?
                    <FontAwesomeIcon icon={faMinus} onClick={this.deactivate} className={styles.cursorPointer}/> :
                    <FontAwesomeIcon icon={faPlus} onClick={this.activate} className={styles.cursorPointer}/>}</h4>

                {this.state.isVisible ?

                    <div id={'div-' + this.props.type + MODIFICATION} className={styles.divLeft}>

                        {this.props.modifications && this.props.modifications.length > 1 ?
                            <ModificationSelect id={'sel-' + this.props.type + MODIFICATION}
                                                name={'sel-' + this.props.type + MODIFICATION}
                                                modifications={this.props.modifications}
                                                defaultOption={new SelectOption('nothing', 'Add new')}
                                                onChange={this.select}/>
                            : <div/>
                        }

                        <label htmlFor={'txt-' + this.props.type + MODIFICATION}>Name</label>
                        <input type="text" id={'txt-' + this.props.type + MODIFICATION}
                               name={this.props.type + 'Modification'} value=""/>

                        <label htmlFor={'txt-' + this.props.type + FORMULA}>Formula</label>
                        <input type="text" id={'txt-' + this.props.type + FORMULA} name={this.props.type + 'Formula'}
                               value=""/>

                        <label htmlFor={'txt-' + this.props.type + MASS}>Monoisotopic Mass</label>
                        <input type="text" id={'txt-' + this.props.type + MASS} name={this.props.type + 'Mass'}
                               value=""/>

                        <label htmlFor={'chk-' + this.props.type + NTERMINAL} className="chk">N-terminal</label>
                        <input type="checkbox" id={'chk-' + this.props.type + NTERMINAL} name={this.props.type + 'nTerminal'} checked={this.props.type === 'n'}/>

                        <label htmlFor={'chk-' + this.props.type + CTERMINAL} className="chk">C-terminal</label>
                        <input type="checkbox" id={'chk-' + this.props.type + CTERMINAL} name={this.props.type + 'cTerminal'} checked={this.props.type === 'c'}/>
                    </div>
                    : <div/>}
            </div>
        );
    }
}

export default ModificationInput;
