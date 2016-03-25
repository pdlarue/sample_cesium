var drawLine;

var collection;
var lla = [],
    color,
    stage,
    cartesian,
    cartographic,
    cartographictwo;
    color = Cesium.Color.LIME;

var createHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

function beginCreate() {
    collection = {latlonalt: []};
    stage = 0;
    entity = viewer.entities.add({
        label: {
            show: false
        }
    });
    newPolygon = viewer.entities.add({
        polygon: {
            show: false,
            material: color.withAlpha(0.25)
        }
    });
    newOutline = viewer.entities.add({
        polyline: {
            show: false,
            material: color
        }
    });
    showCoordinates(true);
    enableClick();
}

function enableClick() {
    createHandler.setInputAction(clickAction, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function disableClick() {
    createHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function enableDoubleClick() {
    createHandler.setInputAction(doubleClickAction, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

function disableDoubleClick() {
    createHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}

function enableDraw() {
    createHandler.setInputAction(draw, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

function disableDraw() {
    createHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

// onClick store each latlonalt position
function clickAction(click) {
    var cartesian = scene.camera.pickEllipsoid(click.position, ellipsoid);
    if (cartesian) {
        var setCartographic = ellipsoid.cartesianToCartographic(cartesian);
        collection.latlonalt.push(
            Cesium.Math.toDegrees(setCartographic.latitude).toFixed(15),
            Cesium.Math.toDegrees(setCartographic.longitude).toFixed(15),
            Cesium.Math.toDegrees(setCartographic.height).toFixed(15)
        );
        lla.push(Cesium.Math.toDegrees(setCartographic.longitude), Cesium.Math.toDegrees(setCartographic.latitude));
        if (lla.length >= 4) {
            console.log((lla.length / 2) + ' Points Added');
        }
        enableDoubleClick();
        enableDraw();
        testMe(click.position);
    }
}

var pickedPosition;
var scratchZoomPickRay = new Cesium.Ray();
var scratchPickCartesian = new Cesium.Cartesian3();
function testMe(c2MousePosition) {
    if (Cesium.defined(scene.globe)) { 
        if(scene.mode !== Cesium.SceneMode.SCENE2D) {
            pickedPosition = pickGlobe(viewer, c2MousePosition, scratchPickCartesian);
        } else {
            pickedPosition = camera.getPickRay(c2MousePosition, scratchZoomPickRay).origin;
        }
    }
}

var pickGlobeScratchRay = new Cesium.Ray();
var scratchDepthIntersection = new Cesium.Cartesian3();
var scratchRayIntersection = new Cesium.Cartesian3();  
function pickGlobe(viewer, c2MousePosition, result) {   

    var globe = scene.globe;
    var camera = scene.camera;

    if (!Cesium.defined(globe)) {
        return undefined;
    }
    
    var depthIntersection;
    if (scene.pickPositionSupported) {
        depthIntersection = scene.pickPosition(c2MousePosition, scratchDepthIntersection);
    }

    var ray = camera.getPickRay(c2MousePosition, pickGlobeScratchRay);
    var rayIntersection = globe.pick(ray, scene, scratchRayIntersection);   
    
    var pickDistance;
    if(Cesium.defined(depthIntersection)) {
        pickDistance = Cesium.Cartesian3.distance(depthIntersection, camera.positionWC);
    } else {
        pickDistance = Number.POSITIVE_INFINITY;
    }

    var rayDistance;
    if(Cesium.defined(rayIntersection)) {
        rayDistance = Cesium.Cartesian3.distance(rayIntersection, camera.positionWC);
    } else {
        rayDistance = Number.POSITIVE_INFINITY;
    }
    
    var scratchCenterPosition = new Cesium.Cartesian3();
    if (pickDistance < rayDistance) {
        var cart = Cesium.Cartesian3.clone(depthIntersection, result);
        return cart;
    }
    
    var cart = Cesium.Cartesian3.clone(rayIntersection, result);
    return cart;
}

// onDoubleClick close polygon
function doubleClickAction(doubleClick) {
    var len = collection.latlonalt.length;
    if(len > 9) {
        collection.rad = (len / 3);
        console.log("Creating Asset");
//        socket.emit('newElement', asset.cType, asset);
//        self.createAsset('add', collection);
        create();
        //createPolygon();
        viewer.entities.remove(entity);
        viewer.entities.remove(newPolygon);
        viewer.entities.remove(newOutline);

        finish();
    }
}

function create() {
    var positions = []; // xy position array    
    var updatedPositions = collection.latlonalt;

    var cesiumTerrainProvider = new Cesium.CesiumTerrainProvider({
        url: '//assets.agi.com/stk-terrain/world'
    });
    viewer.terrainProvider = cesiumTerrainProvider;

// go off and sample the terrain layer to get interpolated z values for each position..
    var promise = Cesium.sampleTerrain(cesiumTerrainProvider, 11, positions);
    Cesium.when(promise, function (updatedPositions) {

        var cartesianPositions = Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(updatedPositions);

        var polygon = {
                hierarchy: cartesianPositions,
                outline: true,
                outlineColor: Cesium.Color.RED,
                outlineWidth: 9,
                perPositionHeight: true,
                material: Cesium.Color.BLUE.withAlpha(0.0)
            };

        var entity = viewer.entities.add(polygon);

        viewer.flyTo(entity);

    });
}

function createPolygon() {
    var result = [];
    var orangePolygon = viewer.entities.add({
        name : 'Orange polygon with per-position heights and outline',
        polygon : {
            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(collection.latlonalt, ellipsoid, result),
            extrudedHeight: 0,
            perPositionHeight : true,
            material : Cesium.Color.ORANGE.withAlpha(0.5),
            outline : true,
            outlineColor : Cesium.Color.BLACK
        }
    });
}

function draw(movement) {
    if(stage === 0){
        cartesian = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
        if (cartesian) {
            cartographic = ellipsoid.cartesianToCartographic(cartesian);

            entity.position = new Cesium.CallbackProperty(function(){
                return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
            }, false);
            stage = 1;
        }
    }else if(stage === 1){
        cartesiantwo = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
        if (cartesiantwo) {
            cartographictwo = ellipsoid.cartesianToCartographic(cartesiantwo);

            entity.position = new Cesium.CallbackProperty(function(){
                return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographictwo);
            }, false);

            var currentPos = [Cesium.Math.toDegrees(cartographictwo.longitude), Cesium.Math.toDegrees(cartographictwo.latitude)];
            newPolygon.polygon.hierarchy = new Cesium.CallbackProperty(function () {
                var llaConcat = lla;
                llaConcat = llaConcat.concat(currentPos);
                return Cesium.Cartesian3.fromDegreesArray(llaConcat);
            }, false);
            newPolygon.polygon.show = true;
            newOutline.polyline.positions = new Cesium.CallbackProperty(function(){
                var llaConcat = lla;
                llaConcat = llaConcat.concat(currentPos);
                return Cesium.Cartesian3.fromDegreesArray(llaConcat);
            }, false);
            newOutline.polyline.show = true;
        }
    }
}

function emptyArray() {
    while(lla.length > 0) {
        lla.pop();
    }
}

function finish() {
    //convert coordinates to polygon
    emptyArray();
    disableDraw();
    disableClick();
    disableDoubleClick();
    handleDone();
}



