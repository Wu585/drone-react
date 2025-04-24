// 定义创建四棱锥类
function CreateFrustum(options) {
  // 位置点
  this.position = options.position;
  // 方向
  this.orientation = options.orientation;
  // 相机视场角
  this.fov = options.fov || 30;
  // 近距离点，0 则会显示四棱锥的顶点
  this.near = options.near || 10;
  // 远距离点
  this.far = options.far || 100;
  // 视锥的宽度/高度
  this.aspectRatio = options.aspectRatio;
  this.add();
}

CreateFrustum.prototype.add = function add() {
  this.clear();
  this.addFrustum();
  this.addOutline();
}

CreateFrustum.prototype.update = function (position, orientation) {
  this.position = position;
  this.orientation = orientation;
  this.add();
}

CreateFrustum.prototype.clear = function () {
  this.clearFrustum();
  this.clearOutline();
}

CreateFrustum.prototype.clearFrustum = function () {
  if (this.frustumPrimitive) {
    viewer.scene.primitives.remove(this.frustumPrimitive);
    this.frustumPrimitive = null;
  }
}

CreateFrustum.prototype.clearOutline = function () {
  if (this.outlinePrimitive) {
    viewer.scene.primitives.remove(this.outlinePrimitive);
    this.outlinePrimitive = null;
  }
}

// 创建视锥体
CreateFrustum.prototype.addFrustum = function () {
  // 创建视锥
  let frustum = new Cesium.PerspectiveFrustum({
    fov: Cesium.Math.toRadians(this.fov),
    aspectRatio: this.aspectRatio,
    near: this.near,
    far: this.far,
  });
  // 创建视锥几何数据
  let geometry = new Cesium.FrustumGeometry({
    frustum: frustum,
    origin: this.position,
    orientation: this.orientation,
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
  });
  // 创建实例
  let instance = new Cesium.GeometryInstance({
    geometry: geometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(
        new Cesium.Color(1.0, 1.0, 1.0, 0.2)
      ),
    },
  });
  let primitive = new Cesium.Primitive({
    geometryInstances: instance,
    appearance: new Cesium.PerInstanceColorAppearance({
      closed: true,
      flat: true,
    }),
    asynchronous: false,
  });
  this.frustumPrimitive = viewer.scene.primitives.add(primitive);
}

// 创建视锥边框
CreateFrustum.prototype.addOutline = function () {
  let frustum = new Cesium.PerspectiveFrustum({
    fov: Cesium.Math.toRadians(this.fov),
    aspectRatio: this.aspectRatio,
    near: this.near,
    far: this.far,
  });
  let geometry = new Cesium.FrustumOutlineGeometry({
    frustum: frustum,
    origin: this.position,
    orientation: this.orientation,
    vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
  });
  let instance = new Cesium.GeometryInstance({
    geometry: geometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(
        new Cesium.Color(0.0, 1.0, 1.0, 1.0)
      ),
    },
  });
  let primitive = new Cesium.Primitive({
    geometryInstances: instance,
    appearance: new Cesium.PerInstanceColorAppearance({
      closed: true,
      flat: true,
    }),
    asynchronous: false,
  });
  this.outlinePrimitive = viewer.scene.primitives.add(primitive);
}

