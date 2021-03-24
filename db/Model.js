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

const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

/**
 * Contains all the schemas for the database objects that is required by mongoose.
 * All _id are disabled as we are defining custome _id for the required objects.
 */
const internalNumOverlaySchema =  new mongoose.Schema({
    OverlayId:String,
    NumNodes:Number,
    NumEdges:Number
}, { _id: false });

const overlaySchema = new mongoose.Schema({
    _id: Number,
    createdAt: {type: Date, expires: process.env.expireTime, default: Date.now },
    Overlays:[internalNumOverlaySchema] // Array of Overlay objects
}, { _id: false })

//----------------------------------- End of Overlays collection schema ------------------------------------------

var edgeSchema = new mongoose.Schema({
    EdgeId: String,
    PeerId: String,
    CreatedTime:Decimal128,
    ConnectedTime:Decimal128,
    State:String,
    Type:String,
    TapName:String,
    MAC:String
}, { _id: false });

var nodeSchema = new mongoose.Schema({
    NodeId: String,
    NodeName:String,
    Version: String,
    GeoCoordinates:String,
    Edges:[edgeSchema]
}, { _id: false });

var internalOverlaySchema = new mongoose.Schema({
    OverlayId:String,
    Nodes:[nodeSchema]
}, { _id: false })

const topologySchema = new mongoose.Schema({
    _id:Number,
    createdAt:{type: Date, expires: process.env.expireTime, default: Date.now },
    Topology:[internalOverlaySchema]
}, { _id: false })

//----------------------------------- End of Topology collection schema ------------------------------------------


//----------------------------------- Export the model so that they can be used ------------------------------------------

var overlayModel = mongoose.model('overlayData', overlaySchema, "Overlays");
var topologyModel = mongoose.model('topologyData', topologySchema, "Topology");

module.exports = {overlayModel, topologyModel};
