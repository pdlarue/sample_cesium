var mousePosition = new Cesium.Cartesian3();
var mousePositionProperty = new Cesium.CallbackProperty(
    function(time, result){
        var position = scene.camera.pickEllipsoid(mousePosition, undefined, result);
        var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
        return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
    },
    false);

var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

function showCoordinates(show) {
    if(show) {
        enableListener();
        entity.label.show = true;
    } else {
        disableListener();
        entity.label.show = false;
    }
}

function enableListener() {
    handler.setInputAction(action, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

function disableListener() {
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

function action(movement) {
    var cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
    if (cartesian) {
        var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian); //ellipsoid.cartesianToCartographic(cartesian);
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
        var altitudeString = Cesium.Math.toDegrees(cartographic.height);//.toFixed(16);

//        var ray = viewer.camera.getPickRay(movement.endPosition);
//        var position = viewer.scene.globe.pick(ray, viewer.scene);

        entity.position = new Cesium.CallbackProperty(function(){
            return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
        }, false);
//        entity.label.text = '(' + longitudeString + ', ' + latitudeString + ')';
        entity.label.text = '(' + longitudeString + ', ' + latitudeString  + ', ' + altitudeString + ')';
    } else {
        entity.label.text = 'Select Start Position';
    }
}



