import {ENDPOINT, TOKEN} from "../constant/ApiConstants";
import {ERROR_LOGIN_NEEDED} from "../constant/FlashConstants";

abstract class AbstractImport {

    protected text: string;
    protected containerId: number;
    protected errorStack: string[] = [];
    protected okStack: any[] = [];

    public constructor(text: string, containerId: number) {
        this.text = text;
        this.containerId = containerId;
    }

    import() {
        this.errorStack = [];
        this.okStack = [];
        let rows = this.text.split('\n');
        for (let i = 0; i < rows.length; ++i) {
            let parts = rows[i].split('\t');
            if (parts.length !== this.getLineLength()) {
                this.errorStack.push(rows[i]);
                continue;
            }
            this.transformation(parts);
        }
        this.send();
        return this.errorStack;
    }

    send() {
        let token = localStorage.getItem(TOKEN);
        if (token) {
            fetch(ENDPOINT + 'container/' + this.containerId + this.getType() + '/import', {
                method: 'POST',
                headers: {'x-auth-token': token},
                body: JSON.stringify(this.okStack)
            }).then(response => {
                console.log(response);
                if (response.status === 200) {
                    // TODO response -> can be partially OK
                } else {
                    // TODO bad
                }
            });
        } else {
            throw new Error(ERROR_LOGIN_NEEDED);
        }
    }

    abstract getType(): string;
    abstract getLineLength(): number;
    abstract transformation(parts: any[]): void;

}

export default AbstractImport;
