import * as React  from "react";
import Modification from "../structure/Modification";
import {SelectInput, SelectOption} from "./SelectInput";
import OptionsHelper from "../helper/OptionsHelper";
import {ChangeEvent} from "react";

interface Props {
    id: string;
    name: string;
    defaultOption?: SelectOption;
    modifications: Modification[];
    selected?: string;
    onChange?: (event: ChangeEvent<HTMLSelectElement>) => void | undefined;
}

class ModificationSelect extends React.Component<Props, any> {

    render() {
        return (
            <span>
                <label htmlFor={this.props.id}>Select Modification</label>
                <SelectInput id={this.props.id} name={this.props.name} selected={this.props.selected} options={OptionsHelper.modificationToOptions(this.props.modifications, this.props.defaultOption)} onChange={this.props.onChange} />
            </span>
        )
    }

}

export default ModificationSelect;
