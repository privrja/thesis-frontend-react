import * as React from "react";

interface Props {
    name: string;
    id: string;
    value: string;
    size?: number;
    className?: string;
    onChange?: () => void;
    onKeyDown?: (e: any) => void;
    onInput?: () => void;
}

interface State {
    value: string;
}

class TextArea extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {value: props.value};
        this.handleChange = this.handleChange.bind(this);
        this.keyDown = this.keyDown.bind(this);
        this.input = this.input.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (prevProps.value !== this.props.value) {
            this.setState({value: this.props.value});
        }
    }

    handleChange(event: any) {
        this.setState({value: event.target.value});
        if (this.props.onChange) {
            this.props.onChange();
        }
    }

    keyDown(e: any) {
        if (this.props.onKeyDown) {
            this.props.onKeyDown(e);
        }
    }

    input() {
        if (this.props.onInput) {
            this.props.onInput();
        }
    }

    render() {
        return <textarea id={this.props.id} name={this.props.name} value={this.state.value} className={this.props.className} onInput={this.input} onKeyDown={this.keyDown} onChange={this.handleChange}/>
    }

}

export default TextArea;
