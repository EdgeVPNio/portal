/* EdgeVPNio
* Copyright 2020, University of Florida
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

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

    getTopology(tableName, intervalId, overlayId) {
        console.log("getTopology method not implemented by specific db");
    }

    getOverlays(tableName, intervalId) {
        console.log("checkOverlayUpdate method not implemented by specific db");
    }

    close() {
        console.log("close method not implemented by specific db");
    }
}

module.exports = { DataBaseInterface }
