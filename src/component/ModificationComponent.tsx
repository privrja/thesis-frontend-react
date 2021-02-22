import styles from "../main.module.scss";
import {SelectInput} from "./SelectInput";
import {SequenceEnum, SequenceEnumHelper} from "../enum/SequenceEnum";
import ModificationInput from "./ModificationInput";
import * as React from "react";
import Modification from "../structure/Modification";
import TextInput from "./TextInput";
import Creatable from "react-select/creatable";
import {CONTAINER, ENDPOINT, TOKEN} from "../constant/ApiConstants";

interface Props {
    containerId: number;
    blockLength: number;
    sequenceType?: string;
    sequence?: string;
    nModification?: any;
    cModification?: any;
    bModification?: any;
    modifications?: Modification[];
    onFamilyChange?: (family: any[]) => void;
}

interface State {
    sequence: string
    familyOptions: any[];
    family: any[];
}

class ModificationComponent extends React.Component<Props, State> {

    nModificationRef: React.RefObject<ModificationInput>;
    cModificationRef: React.RefObject<ModificationInput>;
    bModificationRef: React.RefObject<ModificationInput>;

    constructor(props: Props) {
        super(props);
        this.nModificationRef = React.createRef();
        this.cModificationRef = React.createRef();
        this.bModificationRef = React.createRef();
        this.family = this.family.bind(this);
        this.handleFamilyChange = this.handleFamilyChange.bind(this);
        this.updateModifications = this.updateModifications.bind(this);
        this.state = {sequence: props.sequence ?? '', familyOptions: [], family: []}
    }

    componentDidMount(): void {
        this.family();
        let txtType = document.getElementById('sel-sequence-type') as HTMLSelectElement;
        let typeEnum = SequenceEnumHelper.getValue(this.props.sequenceType ?? SequenceEnumHelper.getName(SequenceEnum.OTHER));
        txtType.value = typeEnum.toString();
        this.disable(typeEnum);
    }

    family() {
        const token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + CONTAINER + '/' + this.props.containerId + '/sequence/family', {
                method: 'GET',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => this.setState({
                        familyOptions: data.map((family: any) => {
                            return {value: family.id, label: family.family}
                        })
                    }));
                }
            });
        }
    }

    handleFamilyChange(newValue: any) {
        this.setState({family: newValue});
        if (this.props.onFamilyChange) {
            this.props.onFamilyChange(newValue);
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps.sequence !== this.props.sequence) {
            this.setState({sequence: this.props.sequence ?? ''});
        }
    }

    private disable(value: SequenceEnum) {
        this.nModificationRef.current!.defaultTitle();
        this.cModificationRef.current!.defaultTitle();
        switch (value) {
            case SequenceEnum.LINEAR_POLYKETIDE:
                this.nModificationRef.current!.changeTitle('Left modification');
                this.cModificationRef.current!.changeTitle('Right modification');
            // eslint-disable-next-line no-fallthrough
            case SequenceEnum.LINEAR:
                this.nModificationRef.current!.unDisable();
                this.cModificationRef.current!.unDisable();
                this.bModificationRef.current!.disable();
                break;
            case SequenceEnum.CYCLIC:
            case SequenceEnum.CYCLIC_POLYKETIDE:
                this.nModificationRef.current!.disable();
                this.cModificationRef.current!.disable();
                this.bModificationRef.current!.disable();
                break;
            case SequenceEnum.BRANCH_CYCLIC:
                this.nModificationRef.current!.disable();
                this.cModificationRef.current!.disable();
                this.bModificationRef.current!.unDisable();
                break;
            default:
            case SequenceEnum.OTHER:
            case SequenceEnum.BRANCHED:
                this.nModificationRef.current!.unDisable();
                this.cModificationRef.current!.unDisable();
                this.bModificationRef.current!.unDisable();
                break;
        }
    }

    updateModifications() {
        let txtType = document.getElementById('sel-sequence-type') as HTMLSelectElement;
        this.disable(parseInt(txtType.value));
    }

    render() {
        return (
            <div id="div-sequence">
                <div id="div-top-sequence" className={styles.divLeft}>
                    <h3>Sequence - {this.props.blockLength} blocks</h3>
                    <label htmlFor="sel-sequence-type">Type</label>
                    <SelectInput id='sel-sequence-type' name='sel-sequence-type'
                                 options={SequenceEnumHelper.getOptions()} onChange={this.updateModifications}/>
                    <label htmlFor="txt-sequence">Sequence</label>
                    <TextInput id="txt-sequence" name="sequence" size={60} value={this.state.sequence}/>
                    <div className={styles.padding}>
                        <label htmlFor={'cre-family'}>Family</label>
                        <Creatable className={styles.creatable} id={'cre-family'} options={this.state.familyOptions}
                                   onChange={this.handleFamilyChange} isMulti={true}/>
                    </div>
                </div>
                <ModificationInput type='n' title='N-terminal modification' modifications={this.props.modifications}
                                   ref={this.nModificationRef} modification={this.props.nModification}/>
                <ModificationInput type='c' title='C-terminal modification' modifications={this.props.modifications}
                                   ref={this.cModificationRef} modification={this.props.cModification}/>
                <ModificationInput type='b' title='Branch-terminal modification' modifications={this.props.modifications}
                                   ref={this.bModificationRef} modification={this.props.bModification}/>
            </div>
        );
    }

}

export default ModificationComponent;
