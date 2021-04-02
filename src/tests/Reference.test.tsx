import DoiParser from "../parser/DoiParser";
import {Reference} from "../parser/ReferenceParser";
import {ServerEnum} from "../enum/ServerEnum";
import LmfaParser from "../parser/LmfaParser";

test('DOI reference test OK', () => {
    let doiParser = new DoiParser();
    let result = doiParser.parse('DOI: 10.1002/mas.21461');
    expect(result.isAccepted()).toEqual(true);
    expect(result.getResult()).toEqual(new Reference(ServerEnum.DOI, '10.1002/mas.21461'));
});

test('DOI referenec bad', () => {
    let doiParser = new DoiParser();
    let result = doiParser.parse('10.1002/mas.21461');
    expect(result.isAccepted()).toEqual(false);
});

test('Lipid maps reference test ok', () => {
    let parser = new LmfaParser();
    let result = parser.parse('LMFA02000002');
    expect(result.isAccepted()).toEqual(true);
    expect(result.getResult()).toEqual(new Reference(ServerEnum.LIPID_MAPS,'LMFA02000002'));
});

test('Lipid maps reference test bad', () => {
    let parser = new LmfaParser();
    let result = parser.parse('LMFA');
    expect(result.isAccepted()).toEqual(false);
});
