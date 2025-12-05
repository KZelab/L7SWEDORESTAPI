"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mathutils_1 = require("../src/mathutils");
//'describe' groups related tests together
//it is like a container or a folder for your test scenarios
describe('Math utilities', () => {
    //'it' or'test' defines a single test case. 
    //the string description should read like a sentence
    it("Should correctly add two numbers", () => {
        //prepare inputs
        const a = 2;
        const b = 3;
        const result = (0, mathutils_1.add)(a, b);
        //assert: check if the result matches our expectation 
        expect(result).toBe(5);
    });
    it("Should be able to handle negative numbers", () => {
        const a = -1;
        const b = -2;
        const result = (0, mathutils_1.add)(a, b);
        expect(result).toBe(-3);
    });
    it("Should fail as we want this one to fail", () => {
        expect((0, mathutils_1.add)(5, 7)).toBe(199);
    });
});
