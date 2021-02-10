
/**
 * Parent Interface of all the databases.
 */
class DataBaseInterface {
    constructor(url) {
        this.url = url;
    }

    insertInto(tableName, data) {
        console.log("insertInto method not implemented by specific db");
    }

    getIntervals(tableName) {
        console.log("getIntervals method not implemented by specific db");
    }

    getOverlays(tableName, intervalId) {
        console.log("getOverlays method not implemented by specific db");
    }

    getTopology(tableName, intervalId, overlayId) {
        console.log("getTopology method not implemented by specific db");
    }

    close() {
        console.log("close method not implemented by specific db");
    }
}

module.exports = { DataBaseInterface }