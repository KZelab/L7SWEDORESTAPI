import { add } from "../src/mathutils"

//'describe' groups related tests together
//it is like a container or a folder for your test scenarios

describe('Math utilities', () => {

    //'it' or'test' defines a single test case. 
    //the string description should read like a sentence

    it("Should correctly add two numbers", () => {
        //prepare inputs
        const a = 2;
        const b = 3;

        const result = add(a, b);

        //assert: check if the result matches our expectation 
        expect(result).toBe(5);
    })

    it("Should be able to handle negative numbers", () =>
    {
        const a = -1;
        const b = -2;
        const result = add(a, b);
        expect(result).toBe(-3);
    })

    it("Should fail as we want this one to fail", () =>
    {
        expect(add(5,7)).toBe(199)
    })


    
})