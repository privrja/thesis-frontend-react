import * as React from "react";

export class SelectOption {
    public key: string;
    public label: string;

    constructor(key: string, pubChem: string)
    constructor(key: string, label?:string) {
        this.key = key;
        this.label = label === undefined ? key : label;
    }

}

interface Props {
    id: string;
    name: string;
    options: SelectOption[];
    className?: string;
}

export class SelectInput extends React.Component<Props>{

    render() {
        return (
            <select id={this.props.id} name={this.props.name} className={this.props.className}>
                {this.props.options.map(option => (
                    <option value={option.key}>{option.label}</option>
                ))}
            </select>
        )
    }
}
