import styles from "../main.module.scss";
import {SelectInput} from "./SelectInput";
import {SequenceEnum, SequenceEnumHelper} from "../enum/SequenceEnum";
import ModificationInput from "./ModificationInput";
import * as React from "react";
import Modification from "../structure/Modification";
import TextInput from "./TextInput";
import Creatable from "react-select/creatable";
import {CONTAINER, TOKEN} from "../constant/ApiConstants";
import CheckInput from "./CheckInput";
import {ENDPOINT} from "../constant/Constants";

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
    onOrganismChange?: (organism: any[]) => void;
    family: any[];
    organism: any[];
    editSame: boolean;
    onEditChange?: (value: boolean) => void;
}

interface State {
    sequence: string
    familyOptions: any[];
    organismOptions: any[];
    family: any[];
    organism: any[];
    editSame: boolean;
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
        this.handleEditChange = this.handleEditChange.bind(this);
        this.family = this.family.bind(this);
        this.organism = this.organism.bind(this);
        this.handleFamilyChange = this.handleFamilyChange.bind(this);
        this.handleOrganismChange = this.handleOrganismChange.bind(this);
        this.updateModifications = this.updateModifications.bind(this);
        this.state = {
            sequence: props.sequence ?? '',
            familyOptions: [],
            family: this.props.family,
            editSame: this.props.editSame,
            organismOptions: [],
            organism: this.props.organism
        }
    }

    componentDidMount(): void {
        this.family();
        this.organism();
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

    organism() {
        const token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + CONTAINER + '/' + this.props.containerId + '/organism', {
                method: 'GET',
                headers: {'x-auth-token': token}
            }).then(response => {
                if (response.status === 200) {
                    response.json().then(data => this.setState({
                        organismOptions: data.map((organism: any) => {
                            return {value: organism.id, label: organism.organism}
                        })
                    }));
                }
            });
        }
    }

    handleFamilyChange(newValue: any) {
        let fam = [];
        if (newValue) {
            fam = newValue;
        }
        this.setState({family: fam});
        if (this.props.onFamilyChange) {
            this.props.onFamilyChange(fam);
        }
    }

    handleOrganismChange(newValue: any) {
        let org = [];
        if (newValue) {
            org = newValue;
        }
        this.setState({organism: org});
        if (this.props.onOrganismChange) {
            this.props.onOrganismChange(org);
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps.sequence !== this.props.sequence) {
            this.setState({sequence: this.props.sequence ?? ''});
        }
        if (prevProps.family !== this.props.family) {
            this.setState({family: this.props.family});
        }
        if (prevProps.editSame !== this.props.editSame) {
            this.setState({editSame: this.props.editSame});
        }
    }

    private disable(value: SequenceEnum) {
        this.nModificationRef.current!.defaultTitle();
        this.cModificationRef.current!.defaultTitle();
        switch (value) {
            case SequenceEnum.LINEAR_POLYKETIDE:
                this.nModificationRef.current!.changeTitle('Left modification');
                this.cModificationRef.current!.changeTitle('Right modification');
                this.nModificationRef.current!.unDisable();
                this.cModificationRef.current!.unDisable();
                this.bModificationRef.current!.disable();
                break;
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

    handleEditChange(newValue: any) {
        this.setState({editSame: newValue.target.checked});
        if (this.props.onEditChange) {
            this.props.onEditChange(newValue.target.checked);
        }
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
                                   value={this.state.family}
                                   onChange={this.handleFamilyChange} isMulti={true}/>
                        <label htmlFor={'cre-organism'}>Organism</label>
                        <Creatable className={styles.creatable} id={'cre-organism'} options={this.state.organismOptions}
                                   value={this.state.organism}
                                   onChange={this.handleOrganismChange} isMulti={true}/>
                    </div>
                    <CheckInput name={'chck-edit-same'} id={'chck-edit-same'} checked={this.state.editSame}
                                onChange={this.handleEditChange}/>
                    <label htmlFor={'chck-edit-same'}>Edit same blocks together</label>
                </div>
                <ModificationInput type='n' title='N-terminal modification' modifications={this.props.modifications}
                                   ref={this.nModificationRef} modification={this.props.nModification}/>
                <ModificationInput type='c' title='C-terminal modification' modifications={this.props.modifications}
                                   ref={this.cModificationRef} modification={this.props.cModification}/>
                <ModificationInput type='b' title='Branch-terminal modification'
                                   modifications={this.props.modifications}
                                   ref={this.bModificationRef} modification={this.props.bModification}/>
            </div>
        );
    }

}

export default ModificationComponent;
