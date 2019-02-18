require("browser-env")();
require("./helpers/MutationObserver")(global);
require("./helpers/getSelection")(global);

const mockCssModules = require("mock-css-modules");
mockCssModules.register([".style", ".css"]);

(global as any).Quill = require("quill");
