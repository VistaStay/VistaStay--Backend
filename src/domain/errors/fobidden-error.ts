class FobiddenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FobiddenError"; 
    }
}

export default FobiddenError;
