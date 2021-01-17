class Canonical {

    /**
     * Convert isomeric SMILES to canonical. "Removes values in []".
     * @param smiles
     */
    static getCanonicalSmiles(smiles: string) {
        let stack: string[] = [];
        smiles.split('').forEach((c: string) => {
            switch (c) {
                case ']':
                    stack = this.isoText(stack);
                    break;
                case '/':
                case '\\':
                    break;
                case ')':
                    let index = stack.length - 1;
                    if (stack[index] === '(') {
                        stack.pop();
                    } else {
                        stack.push(c);
                    }
                    break;
                default:
                    stack.push(c);
                    break;
            }
        });
        return stack.join('');
    }


    /**
     * Go back in stack and solve [C@@H] -> C
     * @param stack
     * @returns {char[] | string}
     */
    private static isoText(stack: string[]) {
        let text: string[] = [];
        let c = ']';
        let last = '';
        while (c !== '[') {
            switch (c) {
                case '@':
                    break;
                case 'H':
                    if (last !== '@') {
                        text.unshift(c);
                    }
                    break;
                default:
                    text.unshift(c);
                    break;
            }
            last = c;
            let ret = stack.pop();
            c = (ret === undefined) ? '' : ret;
        }
        text.unshift('[');

        if (text.length === 3 && text[1] === 'H') {
            text = [];
        }
        if (text.length === 3) {
            text = [text[1]];
        }
        if (text.length === 4) {
            text = [text[1]];
        }

        stack = stack.concat(text);
        return stack;
    }

}

export default Canonical;
