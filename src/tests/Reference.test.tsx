import DoiParser from "../parser/DoiParser";
import {Reference} from "../parser/ReferenceParser";
import {ServerEnum} from "../enum/ServerEnum";
import LipidMapsReferenceParser from "../parser/LmfaParser";
import ServerNumReferenceParser from "../parser/ServerNumReferenceParser";
import NorineReferenceParser from "../parser/NorineReferenceParser";

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
    let parser = new LipidMapsReferenceParser();
    let result = parser.parse('LMFA02000002');
    expect(result.isAccepted()).toEqual(true);
    expect(result.getResult()).toEqual(new Reference(ServerEnum.LIPID_MAPS,'LMFA02000002'));
});

test('Lipid maps reference test bad', () => {
    let parser = new LipidMapsReferenceParser();
    let result = parser.parse('LMFA');
    expect(result.isAccepted()).toEqual(false);
});

test('SB reference tests ok', () => {
    let parser = new ServerNumReferenceParser();
    let result = parser.parse('SB: 199');
    expect(result.isAccepted()).toEqual(true);
    expect(result.getResult()).toEqual(new Reference(ServerEnum.SIDEROPHORE_BASE, '199'));
});

test('SB reference test bad id', () => {
    let parser = new ServerNumReferenceParser();
    let result = parser.parse('SB: HK199');
    expect(result.isAccepted()).toEqual(false);
});

test('SB reference test bad id 2', () => {
    let parser = new ServerNumReferenceParser();
    let result = parser.parse('SB199');
    expect(result.isAccepted()).toEqual(false);
});

test('Pubchem reference test ok', () => {
    let parser = new ServerNumReferenceParser();
    let result = parser.parse('CID: 5284373');
    expect(result.isAccepted()).toEqual(true);
    expect(result.getResult()).toEqual(new Reference(ServerEnum.PUBCHEM, '5284373'));
});

test('Pubchem reference test ok', () => {
    let parser = new ServerNumReferenceParser();
    let result = parser.parse('5284373');
    expect(result.isAccepted()).toEqual(false);
});

test('Pubchem reference zero', () => {
    let parser = new ServerNumReferenceParser();
    let result = parser.parse('CID: 0');
    expect(result.isAccepted()).toEqual(true);
    expect(result.getResult()).toEqual(new Reference(null, null));
});

test('Norine reference test ok', () => {
    let parser = new NorineReferenceParser();
    let result = parser.parse('NOR00302');
    expect(result.isAccepted()).toEqual(true);
    expect(result.getResult()).toEqual(new Reference(ServerEnum.NORINE, 'NOR00302'));
});

test('Norine reference test zero', () => {
    let parser = new NorineReferenceParser();
    let result = parser.parse('NOR00000');
    expect(result.isAccepted()).toEqual(false);
});

test('ChemSpider reference test ok', () => {
    let parser = new ServerNumReferenceParser();
    let result = parser.parse('CSID: 2867');
    expect(result.isAccepted()).toEqual(true);
    expect(result.getResult()).toEqual(new Reference(ServerEnum.CHEMSPIDER, '2867'));
});

test('ChemSpider reference test bad', () => {
    let parser = new ServerNumReferenceParser();
    let result = parser.parse('CSI: 2867');
    expect(result.isAccepted()).toEqual(false);
});

test('ChEBI reference test ok', () => {
    let parser = new ServerNumReferenceParser();
    let result = parser.parse('CHEBI: 69618');
    expect(result.isAccepted()).toEqual(true);
    expect(result.getResult()).toEqual(new Reference(ServerEnum.CHEBI, '69618'));
});
