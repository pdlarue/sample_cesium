
var Cesium;
var viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider : new Cesium.BingMapsImageryProvider({
        url : '//dev.virtualearth.net',
        mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
    }),
    baseLayerPicker : false
});
var terrainProvider = new Cesium.CesiumTerrainProvider({
    url : '//assets.agi.com/stk-terrain/world'
});
var scene = viewer.scene;
var ellipsoid = scene.globe.ellipsoid;
var entity;
var newPolygon;
var newOutline;
var canvas = document.getElementById("canvas");
//var gl = canvas.getContext("webgl");
//var extensions = gl.getSupportedExtensions();


