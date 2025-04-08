import * as THREE from 'three';
import EffectComposer, {
  RenderPass,
  ShaderPass,
} from '@johh/three-effectcomposer';

import {
  vertexShader,
  fragmentShader,
  postvertex,
  postfragment,
} from './shaders';

export default class Sketch {
  constructor(selector, effectNumber = 0) {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.sortObjects = false;

    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container = document.querySelector(selector);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.classList.add('noise');

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      100,
      1000,
    );

    this.cameraDistance = 400;
    this.camera.position.set(0, 0, this.cameraDistance);
    this.camera.lookAt(0, 0, 0);
    this.time = 0;
    this.speed = 0;
    this.targetSpeed = 0;
    this.mouse = new THREE.Vector2();
    this.followMouse = new THREE.Vector2();
    this.prevMouse = new THREE.Vector2();

    this.teekFunc = this.teek.bind(this);
    this.ticker = gsap.ticker.add(this.teekFunc);

    this.settings();
    this.setupResize();
    this.composerPass(effectNumber);

    this.mouseMoveFunc = this.mouseMove.bind(this);
    window.addEventListener('mousemove', this.mouseMoveFunc, { passive: true });

    this.addObjects();
    this.resize();
    this.render();
  }

  mouseMove(e) {
    this.mouse.x = e.clientX / window.innerWidth;
    this.mouse.y = 1 - e.clientY / window.innerHeight;
  }

  settings() {
    let that = this;
    this.settings = {
      velo: 0,
      scale: 0,
      colorful: () => {
        // that.makeColorful()
        that.customPass.uniforms.uType.value = 0;
      },
      zoom: () => {
        that.customPass.uniforms.uType.value = 1;
      },
      random: () => {
        that.customPass.uniforms.uType.value = 2;
      },
    };
  }

  setupResize() {
    this.resizeFunc = this.resize.bind(this);
    window.addEventListener('resize', this.resizeFunc, { passive: true });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    this.camera.fov =
      2 *
      Math.atan(this.width / this.camera.aspect / (2 * this.cameraDistance)) *
      (180 / Math.PI); // in degrees

    this.customPass.uniforms.resolution.value.y = this.height / this.width;
    this.composer.reset(); // fix, remove blur
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 80, 80);
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0 },
        progress: { type: 'f', value: 0 },
        angle: { type: 'f', value: 0 },
        texture1: { type: 't', value: null },
        texture2: { type: 't', value: null },
        resolution: { type: 'v4', value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      // wireframe: true,
      transparent: true,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
  }
  updateMeshRatio(mesh, width, height) {
    const { imageAspect } = mesh;
    let a1;
    let a2;
    if (width / height < imageAspect) {
      a1 = width / height / imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = (height / width) * imageAspect;
    }
    mesh.material.uniforms.resolution.value.x = width;
    mesh.material.uniforms.resolution.value.y = height;
    mesh.material.uniforms.resolution.value.z = a1;
    mesh.material.uniforms.resolution.value.w = a2;
    mesh.scale.set(width, height, width / height);
  }
  createMesh(o) {
    const material = this.material.clone();
    const texture = new THREE.Texture(o.image);

    const { imageAspect, width, height } = o;
    const { naturalWidth, naturalHeight } = o.image;

    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    material.uniforms.progress.value = 0;
    material.uniforms.angle.value = 0.3;
    material.uniforms.texture1.value = texture;
    material.uniforms.texture1.value.needsUpdate = true;

    const mesh = new THREE.Mesh(this.geometry, material);
    mesh.naturalWidth = naturalWidth;
    mesh.naturalHeight = naturalHeight;
    mesh.imageAspect = imageAspect;

    this.updateMeshRatio(mesh, width, height);
    return mesh;
  }

  composerPass(effectNumber) {
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    //custom shader pass
    const myEffect = {
      uniforms: {
        tDiffuse: { value: null },
        distort: { value: 0 },
        resolution: {
          value: new THREE.Vector2(1, this.height / this.width),
        },
        uMouse: { value: new THREE.Vector2(-10, -10) },
        uVelo: { value: 0 },
        uScale: { value: 0 },
        uType: { value: effectNumber },
        time: { value: 0 },
      },
      vertexShader: postvertex,
      fragmentShader: postfragment,
    };

    this.customPass = new ShaderPass(myEffect);
    this.customPass.renderToScreen = true;
    this.composer.addPass(this.customPass);
  }

  getSpeed() {
    this.speed = Math.sqrt(
      (this.prevMouse.x - this.mouse.x) ** 2 +
        (this.prevMouse.y - this.mouse.y) ** 2,
    );
    this.targetSpeed -= 0.1 * (this.targetSpeed - this.speed);
    this.followMouse.x -= 0.1 * (this.followMouse.x - this.mouse.x);
    this.followMouse.y -= 0.1 * (this.followMouse.y - this.mouse.y);

    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

  render() {
    this.time += 0.05;
    this.getSpeed();
    this.scene.children.forEach((m) => {
      if (m.material.uniforms) {
        m.material.uniforms.angle.value = this.settings.angle;
        m.material.uniforms.time.value = this.time;
      }
    });
    this.customPass.uniforms.time.value = this.time;
    this.customPass.uniforms.uMouse.value = this.followMouse;
    this.customPass.uniforms.uVelo.value = Math.min(this.targetSpeed, 0.05);
    this.targetSpeed *= 0.999;
    if (this.composer) this.composer.render();
  }
  teek() {
    const t = window.scrollY;
    const i = Math.abs(t - this.lastScrollY);
    this.scrollBoost = Math.min(i / 5, 5);
    this.lastScrollY = t;
  }
  destroy() {
    if (this.ticker) gsap.ticker.remove(this.teekFunc);

    window.removeEventListener('resize', this.setSizeFunc);

    // Remove all objects from the scene
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    // Remove the scene, camera, and renderer
    this.scene = null;
    this.camera = null;
    this.renderer.dispose();

    window.removeEventListener('resize', this.resizeFunc);
    window.removeEventListener('mousemove', this.mouseMoveFunc);
  }
}
