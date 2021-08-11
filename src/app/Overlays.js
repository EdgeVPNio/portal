/* EdgeVPNio
 * Copyright 2021, University of Florida
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
export default class Overlays {
  constructor(overlays) {
    var overlayList = [];
    //Add every overlay from retrieved overlays for a given interval into overlayList
    overlays.forEach((obj) =>
      obj["Overlays"].forEach((overlay) => {
        const overlayStr = {
          name: overlay.OverlayId,
          numberOfNodes: overlay.NumNodes,
          numberOfLinks: overlay.NumEdges,
        };
        overlayList.push(overlayStr);
      })
    );

    this.getOverlayList = () => {
      return overlayList;
    };

    this.getOverlayNames = () => {
      var overlaysName = [];
      this.getOverlayList().forEach((overlay) => {
        overlaysName.push(overlay.name);
      });
      return overlaysName.sort();
    };

    this.getOverlay = (overlay) => {
      return overlayList.find((element) => element.name === overlay);
    };

    this.getNumberOfNodes = (overlay) => {
      return overlayList.find((element) => element.name === overlay)
        .numberOfNodes;
    };

    this.getNumberOfLinks = (overlay) => {
      return overlayList.find((element) => element.name === overlay)
        .numberOfLinks;
    };
  }
}
