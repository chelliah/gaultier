
<template>
  <canvas id="bg-canvas" />
</template>
<script>
import * as PIXI from "pixi.js";
import Rect from "./Rect.js";
import bgFrag from "./bg.frag.glsl";
import warpFrag from "./warp.frag.glsl";

const BASE_URL =
  "https://res.cloudinary.com/dhro0fkhc/image/upload/v1579735067/gaultier/";
const BASE_FILE_TYPE = ".jpg";

export default {
  data() {
    return {
      app: null,
      canvas: null,
      resources: null,
      background: null,
      container: null,
      width: window.innerWidth,
      height: window.innerHeight,
      rects: [],
      images: [],
      center: {
        x: 0,
        y: 0
      },
      pointer: {
        downTarget: 1,
        start: {
          x: 0,
          y: 0
        },
        diff: {
          x: 0,
          y: 0
        },
        diffStart: 1,
        downTarget: 0
      },
      uniforms: {
        uResolution: null,
        uPointerDiff: null,
        uPointerDown: 1
      }
    };
  },
  mounted() {
    // this.resources = PIXI.Loader.shared.resources;

    //  PIXI.Loader.shared.add([
    //    bgFrag
    //  ]).load(this.init)
    this.init();
    this.initShader();
    this.initEvents();
    this.initRects();
  },
  methods: {
    init() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.canvas = document.getElementById("bg-canvas");
      this.app = new PIXI.Application({ view: this.canvas });

      this.app.renderer.autoDensity = true;

      this.app.renderer.resize(this.width, this.height);
    },
    initShader() {
      this.uniforms.uResolution = new PIXI.Point(this.width, this.height);
      this.uniforms.uPointerDiff = new PIXI.Point(0, 0);

      const stageFilter = new PIXI.Filter(undefined, warpFrag, this.uniforms);
      this.app.stage.filters = [stageFilter];

      this.background = new PIXI.Sprite();
      this.background.width = this.width;
      this.background.height = this.height;

      //  console.log(this.resources[bgFrag])

      //  const backgroundFragmentShader = this.resources[fragShader]
      const backgroundFilter = new PIXI.Filter(
        undefined,
        bgFrag,
        this.uniforms
      );
      this.background.filters = [backgroundFilter];
      this.app.stage.addChild(this.background);
    },
    initEvents() {
      this.app.stage.interactive = true;

      this.app.stage
        .on("pointerdown", this.onPointerDown.bind(this))
        .on("pointerup", this.onPointerUp.bind(this))
        .on("pointerupoutside", this.onPointerUp.bind(this))
        .on("pointermove", this.onPointerMove.bind(this));

      this.app.ticker.add(() => {
        // console.log('hii', (this.pointer.diff.x - this.uniforms.uPointerDiff.x) * 0.2)
        // Multiply the values by a coefficient to get a smooth animation
        this.uniforms.uPointerDown +=
          (this.pointer.downTarget - this.uniforms.uPointerDown) * 0.075;
        this.uniforms.uPointerDiff.x +=
          (this.pointer.diff.x - this.uniforms.uPointerDiff.x) * 0.2;
        this.uniforms.uPointerDiff.y +=
          (this.pointer.diff.y - this.uniforms.uPointerDiff.y) * 0.2;
        this.container.x = this.uniforms.uPointerDiff.x - this.center.x;
        this.container.y = this.uniforms.uPointerDiff.y - this.center.y;

        this.checkRectsAndImages()
      });
    },
    initRects() {
      this.container = new PIXI.Container();
      this.app.stage.addChild(this.container);

      const graphics = new PIXI.Graphics();

      let minWidth = (this.width * 3) / 20;
      let minHeight = (this.height * 3) / 10;

      let minX = -this.width / 2;

      let minY = -this.height / 2;

      this.center = {
        x: this.width / 2,
        y: this.height / 2
      };

      graphics.beginFill(0xaa22cc);

      if (this.rects.length == 0) {
        for (let i = 0; i < 40; i++) {
          let intersects = true;
          let left, top;
          let numTries = 0;

          while (intersects && numTries < 100) {
            left = Math.random() * this.width * 2 - this.width / 2;
            top = Math.random() * this.height * 2 - this.height / 2;

            intersects = this.rects.reduce((hasIntersected, rect) => {
              if (hasIntersected) return hasIntersected;
              return rect.intersects({
                left,
                top,
                right: left + minWidth,
                height: top + minHeight
              });
            }, false);
            numTries += 1;
          }

          this.rects.push(new Rect(i + 1, left, top, minWidth, minHeight));
        }
      }

      this.rects.forEach(rect => {
        const image = new PIXI.Sprite()

        image.x = rect.x;
        image.y = rect.y;
        image.width = rect.width;
        image.height = rect.height;
        image.alpha = 0;

        this.images.push(image)

        graphics.drawRect(image.x, image.y, image.width, image.height);
      });

      graphics.endFill();

      this.container.addChild(graphics);

      this.images.forEach(image => this.container.addChild(image))

      console.log("hiii", this.rects);
    },
    checkRectsAndImages() {
      this.rects.forEach((rect, index) => {
        const image = this.images[index];

        if(this.rectIntersectsWIthViewport(rect)) {

          if(!rect.discovered) {
            rect.discovered = true;
            this.loadTextureForImage(index)
          }

          if(rect.loaded && image.alpha < 1) {
            image.alpha += 0.01
          }
        } else {
          if(rect.discovered && !rect.loaded) {
            rect.discovered = false;
            rect.controller.abort();
          }

          if(image.alpha > 0) {
            image.alpha -= 0.01;
          }
        }
      })
    },
    rectIntersectsWIthViewport(rect) {
      return (
        rect.x + this.container.x <= this.width &&
        0 <= (rect.x + rect.width) + this.container.x &&
        rect.y + this.container.y <= this.height &&
        0 <= rect.y + rect.height + this.container.y
      )
    },
    loadTextureForImage(index) {
      const image = this.images[index];

      const url = `${BASE_URL}${index + 1}${BASE_FILE_TYPE}`

      const rect = this.rects[index];

      const { signal } = rect.controller = new AbortController();

      fetch(url, { signal }).then(response => {
        image.texture = new PIXI.Texture.from(response.url);
        rect.loaded = true;
      }).catch(() => console.warn('fetch image failed', url))

    },
    onPointerDown(e) {
      const { x, y } = e.data.global;
      console.log("down", x, y);
      this.pointer.downTarget = 1;
      this.pointer.start = {
        x,
        y
      };

      this.pointer.diffStart = this.uniforms.uPointerDiff.clone();
    },
    onPointerUp() {
      console.log("up");
      this.pointer.downTarget = 0;
    },
    onPointerMove(e) {
      const { x, y } = e.data.global;

      if (this.pointer.downTarget) {
        let diffX = this.pointer.diffStart.x + (x - this.pointer.start.x);
        diffX =
          diffX > 0
            ? Math.min(diffX, (this.width * 3) / 2)
            : Math.max(diffX, -this.width / 2);

        let diffY = this.pointer.diffStart.y + (y - this.pointer.start.y);
        diffY =
          diffY > 0
            ? Math.min(diffY, (this.height * 3) / 2)
            : Math.max(diffY, -this.height / 2);

        this.pointer.diff = {
          x: diffX,
          y: diffY
        };
      }
    }
  }
};
</script>
<style lang="css">
#bg-canvas {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>