"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const node_dns_1 = require("node:dns");
const lookupGoogle = () => node_dns_1.promises.lookup('google.com');
if (require.main === module) {
    // eslint-disable-next-line no-console
    console.log('Nope');
}
exports.default = lookupGoogle;
//# sourceMappingURL=main.js.map