"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FobiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = "FobiddenError";
    }
}
exports.default = FobiddenError;
//# sourceMappingURL=fobidden-error.js.map