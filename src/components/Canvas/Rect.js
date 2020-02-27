// import gsap, {Power1} from 'gsap';

const BASE_URL =
  "https://res.cloudinary.com/dhro0fkhc/image/upload/v1579735067/gaultier/";
const BASE_FILE_TYPE = ".jpg";


export default class Rect {
  constructor(index, x, y, width, height) {
    this.index = index;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.scale = 1;
    this.aspectRatio = 1;
    this.loaded = false;
    this.discovered = false;
    this.controller = null;

    // fetch(`${BASE_URL}${index}${BASE_FILE_TYPE}`)
  }

  setScale(newScale) {
    this.scale = newScale;
    // gsap.to(this, 2, {
    //   scale: scale,
    //   ease: Power1.easeOut
    // })
  }
  

  setPos(x, y) {
    this.x = x;
    this.y = y;
  }

  getBoundingBox() {
    return {
      left: this.x,
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height
    }
  }

  getScaledCoords() {
    return {
      x: this.x  - (this.scale - 1.)*this.width/2,
      y: this.y - (this.scale - 1.)*this.height/2,
      height: this.height * this.scale,
      width: this.width * this.scale
    }
  }

  intersects(rect2Bounds) {
    let {left, right, top, bottom } = this.getBoundingBox()
        // return !(rect2Bounds.left > right - this.width/2 || rect2Bounds.right < left + this.width/2 || rect2Bounds.top > bottom - this.height/2 || rect2Bounds.bottom < top + this.height/2);


    return !(rect2Bounds.left > right - this.width/4 || rect2Bounds.right < left + this.width/4 || rect2Bounds.top > bottom - this.height/4 || rect2Bounds.bottom < top + this.height/4);
  } 
}