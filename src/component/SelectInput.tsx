import React, {ChangeEvent} from "react";

export class SelectOption {
    public key: string;
    public label: string;

    constructor(key: string, label?:string) {
        this.key = key;
        this.label = label === undefined ? key : label;
    }

}

interface State {
    selected: string;
}

interface Props {
    id: string;
    name: string;
    options: SelectOption[];
    selected?: string;
    className?: string;
    onChange?: (event: ChangeEvent<HTMLSelectElement>) => void | undefined;
}

export class SelectInput extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {selected: props.selected ?? this.props.options[0].key};
    }

    render() {
        return (
            <select id={this.props.id} name={this.props.name} className={this.props.className} onChange={this.props.onChange ? this.props.onChange : (event) => {console.log(event.target.value); this.setState({selected: event.target.value})}}>
                {this.props.options.map(option => (
                    <option value={option.key} selected={option.key === this.state.selected}>{option.label}</option>
                ))}
            </select>
        )
    }
}
