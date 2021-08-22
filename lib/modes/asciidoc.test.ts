import * as asciidoc from "./asciidoc"

// @ponicode
describe("highlightInline", () => {
    let inst: any

    beforeEach(() => {
        inst = new asciidoc.Asciidoc(100)
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.highlightInline()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("handleBold", () => {
    let inst: any

    beforeEach(() => {
        inst = new asciidoc.Asciidoc(-100)
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.handleBold()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("handleHeader", () => {
    let inst: any

    beforeEach(() => {
        inst = new asciidoc.Asciidoc("Awesome")
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.handleHeader(4)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            inst.handleHeader(5)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            inst.handleHeader(2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            inst.handleHeader(3)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            inst.handleHeader(6)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            inst.handleHeader(Infinity)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("handleItalic", () => {
    let inst: any

    beforeEach(() => {
        inst = new asciidoc.Asciidoc("Tasty")
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.handleItalic()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("handleMono", () => {
    let inst: any

    beforeEach(() => {
        inst = new asciidoc.Asciidoc(true)
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.handleMono()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("handleStrikeThrough", () => {
    let inst: any

    beforeEach(() => {
        inst = new asciidoc.Asciidoc(false)
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.handleStrikeThrough()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("handleUnderline", () => {
    let inst: any

    beforeEach(() => {
        inst = new asciidoc.Asciidoc("Tasty")
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.handleUnderline()
        }
    
        expect(callFunction).not.toThrow()
    })
})
