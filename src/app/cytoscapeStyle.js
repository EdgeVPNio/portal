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
var cytoscapeStyle = [{
  selector: 'node',
  style: {
    width: '65%',
    height: '65%',
    label: 'data(label)',
    'text-valign': 'center',
    'background-color': 'data(color)',
    'font-weight': 'bold',
    'overlay-opacity': '0'
  }
}, {
  selector: 'node:selected',
  style: {
    'border-width': '30%',
    'border-opacity': '0.3',
    'border-color': '#8AA626'
    // 'background-color': 'data(color)'
  }
}, {
  selector: 'node.transparent',
  style: {
    'background-color': 'grey',
    'z-index': '0',
    'opacity': '0.3'

  }
}, {
  selector: 'node.hidden',
  style: {
    display: 'none'
  }
}, {
  selector: 'edge',
  style: {
    'line-color': 'data(color)',
    'line-style': 'data(style)',
    width: '5%',
    'z-index': '3',
    'overlay-opacity': '0',
    'border-color': 'red',
    'border-width': '5px',
    'line-dash-pattern': [6, 3]
  }
}, {
  selector: 'edge.transparent',
  style: {
    'line-color': 'grey',
    'z-index': '0',
    opacity: '0.3'
  }
}, {
  selector: 'edge.hidden',
  style: {
    display: 'none'
  }
}, {
  selector: 'edge:selected',
  style: {
    'z-index': '3'
  }
}, {
  selector: 'node.notReporting',
  style: {
    'background-color': '#A0C3D9'
  }
}, {
  selector: 'node.noTunnel',
  style: {
    'background-color': '#F2BE22'
  }
}, {
  selector: 'node.noTunnel:selected',
  style: {
    'border-width': '30%',
    'border-opacity': '0.3',
    'border-color': '#F2BE22'
  }
}, {
  selector: 'edge.static',
  style: {
    'line-color': '#F27405'
  }
}, {
  selector: 'edge.onDemand',
  style: {
    'line-color': '#F2D680'
  }
}]

export default cytoscapeStyle
