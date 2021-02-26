import * as React from "react";

interface Props {
    name: string;
    id: string;
    value: string;
    size?: number;
    disabled?: boolean;
    className?: string;
    onChange?: (e: any) => void;
    onKeyDown?: (e: any) => void;
    placeholder?: string;
}

interface State {
    value: string;
    disabled: boolean;
}

class TextInput extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {value: props.value, disabled: this.props.disabled ?? false};
        this.handleChange = this.handleChange.bind(this);
        this.keyDown = this.keyDown.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps.value !== this.props.value) {
            this.setState({value: this.props.value});
        }
    }

    handleChange(event: any) {
        this.setState({value: event.target.value});
        if (this.props.onChange) {
            this.props.onChange(event);
        }
    }

    keyDown(e: any) {
        if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    }

    render() {
        return <input type="text" placeholder={this.props.placeholder} className={this.props.className} id={this.props.id} name={this.props.name} value={this.state.value} disabled={this.state.disabled} onChange={this.handleChange} size={this.props.size} onKeyDown={this.keyDown}/>
    }
}

export default TextInput;
