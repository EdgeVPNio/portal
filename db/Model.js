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