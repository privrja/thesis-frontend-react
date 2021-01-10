import * as React from "react";
import {Field} from "formik";

export class SelectOption {
    public key: string;
    public label: string;

    constructor(key: string)
    constructor(key: string, label?:string) {
        this.key = key;
        this.label = label === undefined ? key : label;
    }

}

interface Props {
    id: string;
    name: string;
    options: SelectOption[];
}

export class SelectInput extends React.Component<Props>{

    render() {
        return (
            <Field as="select" id={this.props.id} name={this.props.name}>
                {this.props.options.map(option => (
                    <option value={option.key}>{option.label}</option>
                ))}
            </Field>
        )
    }
}
