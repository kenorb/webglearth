/*
 * Copyright (C) 2011 Klokan Technologies GmbH (info@klokantech.com)
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU GPL for more details.
 *
 * USE OF THIS CODE OR ANY PART OF IT IN A NONFREE SOFTWARE IS NOT ALLOWED
 * WITHOUT PRIOR WRITTEN PERMISSION FROM KLOKAN TECHNOLOGIES GMBH.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 */

/**
 * @fileoverview Object for sphere visualisation.
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 */

goog.provide('we.scene.rendershapes.Sphere');

goog.require('goog.math.Vec3');

goog.require('we.scene.rendershapes.RenderShape');



/**
 * @inheritDoc
 * @extends {we.scene.rendershapes.RenderShape}
 * @constructor
 */
we.scene.rendershapes.Sphere = function(scene) {
  goog.base(this, scene);
};
goog.inherits(we.scene.rendershapes.Sphere, we.scene.rendershapes.RenderShape);


/** @inheritDoc */
we.scene.rendershapes.Sphere.prototype.vertexTransform =
    'float exp_2y=exp(2.0*phi.y);' +
    'float tanh=((exp_2y-1.0)/(exp_2y+1.0));' +
    'float cosy=sqrt(1.0-tanh*tanh);' +
    'vec3 pos = vec3(sin(phi.x)*cosy,tanh,cos(phi.x)*cosy);' +
    'gl_Position=uMVPMatrix*vec4(pos*(1.0+elev),1.0);';


/** @inheritDoc */
we.scene.rendershapes.Sphere.prototype.calcAltitude = function() {
  var o = Math.cos(Math.abs(this.scene.camera.latitude)) * 2 * Math.PI;
  var thisPosDeformation = o / Math.pow(2, this.scene.getZoom());
  var sizeIWannaSee = thisPosDeformation * this.scene.tilesVertically;
  return (1 / Math.tan(this.scene.context.fov / 2)) *
         (sizeIWannaSee / 2) * we.scene.EARTH_RADIUS;
};


/** @inheritDoc */
we.scene.rendershapes.Sphere.prototype.calcZoom = function() {
  var sizeISee = 2 * (this.scene.camera.altitude / we.scene.EARTH_RADIUS) *
                     Math.tan(this.scene.context.fov / 2);
  var sizeOfOneTile = sizeISee / this.scene.tilesVertically;
  var o = Math.cos(Math.abs(this.scene.camera.latitude)) * 2 * Math.PI;
  return Math.log(o / sizeOfOneTile) / Math.LN2;
};


/** @inheritDoc */
we.scene.rendershapes.Sphere.prototype.transformContext = function() {
  this.scene.context.rotate001(-this.scene.camera.roll);
  this.scene.context.rotate100(-this.scene.camera.tilt);
  this.scene.context.rotate001(-this.scene.camera.heading);
  this.scene.context.translate(0, 0, -1 - this.scene.camera.altitude /
      we.scene.EARTH_RADIUS);
  this.scene.context.rotate100(this.scene.camera.latitude);
  this.scene.context.rotate010(-this.scene.camera.longitude);

};


/**
 * @private
 * @param {!goog.math.Vec3} origin Point of origin.
 * @param {!goog.math.Vec3} direction Normalized vector direction.
 * @return {?Array.<number>} distances.
 */
we.scene.rendershapes.Sphere.prototype.traceDistance_ =
    function(origin, direction) {
  /** @type {!goog.math.Vec3} */
  var sphereCenter = origin.clone().invert(); //[0,0,0] - origin

  var ldotc = goog.math.Vec3.dot(direction, sphereCenter);
  var cdotc = goog.math.Vec3.dot(sphereCenter, sphereCenter);

  var val = ldotc * ldotc - cdotc + 1;

  if (val < 0) {
    return null;
  } else {
    var d1 = Math.min(ldotc + Math.sqrt(val), ldotc - Math.sqrt(val));
    var d2 = Math.max(ldotc + Math.sqrt(val), ldotc - Math.sqrt(val));
    return [d1, d2];
  }
};


/** @inheritDoc */
we.scene.rendershapes.Sphere.prototype.traceRayToGeoSpace =
    function(origin, direction) {

  var ds = this.traceDistance_(origin, direction);

  if (goog.isNull(ds)) {
    return null;
  } else {
    var bod = goog.math.Vec3.sum(origin, direction.scale(ds[0]));

    var lon = Math.asin(bod.x / Math.sqrt(1 - bod.y * bod.y));

    if (bod.z < 0) // The point is on the "other side" of the sphere
      lon = Math.PI - lon;

    return [Math.asin(bod.y), we.utils.standardLongitudeRadians(lon)];
  }
};


/** @inheritDoc */
we.scene.rendershapes.Sphere.prototype.getPointForLatLon =
    function(lat, lon) {
  var cosy = Math.cos(lat);

  return new goog.math.Vec3(Math.sin(lon) * cosy,
                            Math.sin(lat),
                            Math.cos(lon) * cosy);
};


/** @inheritDoc */
we.scene.rendershapes.Sphere.prototype.isPointVisible =
    function(point, viewer) {

  var distance = goog.math.Vec3.distance(point, viewer);

  var direction = point.subtract(viewer).normalize();

  var ds = this.traceDistance_(viewer, direction);

  if (goog.isNull(ds)) {
    return false; // Wait.. what? This should never happen..
  } else {
    return Math.abs(distance - ds[0]) < Math.abs(distance - ds[1]);
  }
};
