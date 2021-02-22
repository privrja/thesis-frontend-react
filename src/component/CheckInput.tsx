import * as React from "react";

interface Props {
    name: string;
    id: string;
    checked: boolean;
    disabled?: boolean;
    onChange?: (e: any) => void;
}

interface State {
    checked: boolean;
    disabled: boolean;
}

class CheckInput extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {checked: props.checked, disabled: props.disabled ?? false};
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps.checked !== this.props.checked || prevProps.disabled !== this.props.disabled) {
            this.setState({checked: this.props.checked, disabled: this.props.disabled ?? prevProps.disabled ?? false});
        }
    }

    handleChange(e: any) {
        this.setState({checked: !this.state.checked});
        if (this.props.onChange) {
            this.props.onChange(e)
        }
    }

    render() {
        return <input type="checkbox" id={this.props.id} name={this.props.name} checked={this.state.checked} onChange={this.handleChange} disabled={this.state.disabled}/>
    }
}

export default CheckInput;
