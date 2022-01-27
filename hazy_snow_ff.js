/*
 * This piece of code was done by @the-kob (https://www.github.com/the-Kob).
 * I was inspired after watching a video on flow fields by @Chris-Courses (https://www.youtube.com/watch?v=na7LuZsW2UM).
 *
 * I will probably still make a way to a user can input their desired seed,
 * but for now the only possible way to accomplish that is by manually
 * change the parameter given in the createPerlin(___) function (line 22).
 * 
 * Special thanks to Diogo Fona, a lad from my univeristy course who helped me figure out some of the maths.
 */

import { createPerlin } from "./libs/perlin.js";
import { vec2, add, normalize, scale } from "./libs/MV.js";

const FIELD_SEED = Math.random() * 100;
const perlin1 = createPerlin(FIELD_SEED);
const perlin2 = createPerlin(FIELD_SEED);

const OFFSET_INC1 = 0.01;
const OFFSET_INC2 = 0.02;

const GRID_SPACING = 10;

let noiseVectors;

let particles;

const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext("2d");

context.clearRect(0, 0, canvas.width, canvas.height);

let rows = canvas.height;
let columns = canvas.width;

class Particle {
  constructor() {
    this.position = vec2(
      canvas.width * Math.random(),
      canvas.height * Math.random()
    );
    this.velocity = vec2(0, 0);
    this.acceleration = vec2(0, 0);
    this.size = 5;
    this.color = "#FFFAFA";
    this.prevPos = this.position;
  }

  update() {
    this.velocity = add(this.velocity, this.acceleration);
    this.position = add(this.position, scale(4, normalize(this.velocity)));
    this.acceleration = scale(0, this.acceleration);
  }

  follow() {
    let x = Math.floor(this.position[0] / GRID_SPACING);
    let y = Math.floor(this.position[1] / GRID_SPACING);
    let index = x + y * canvas.width;
    this.acceleration = add(this.acceleration, noiseVectors[index]);
  }

  outOfBounds() {
    if(this.position[0] > canvas.width) {
      this.position[0] = 0;
      this.prevPos = this.position;
    }
    if(this.position[0] < 0) {
      this.position[0] = canvas.width;
      this.prevPos = this.position;
    }
    if(this.position[1] > canvas.height) {
      this.position[1] = 0;
      this.prevPos = this.position;
    }
    if(this.position[1] < 0) {
      this.position[1] = canvas.height;
      this.prevPos = this.position;
    }
  }

  drawParticle() {
    // Draw style inspired by the one Chris used on his thumbnail
    context.save()
    context.globalAlpha = 0.1;
    context.beginPath();
    context.moveTo(this.prevPos[0], this.prevPos[1]);
    context.lineTo(this.position[0], this.position[1]);
    context.strokeStyle = this.color
    context.stroke()
    context.closePath();
    context.restore()
    this.prevPos = this.position;
  }
}

function createParticles() {
  particles = [];
  for (let i = 0; i < 3000; i++) {
    particles.push(new Particle());
  }
}

function drawParticles() {
  for (let i = 0; i < particles.length; i++) {
    let currParticle = particles[i];

    currParticle.follow();
    currParticle.update();
    currParticle.drawParticle();
    currParticle.outOfBounds();
  }
}

function drawFlowField() {
  noiseVectors = new Array(columns * rows);

  let yOffset1 = 0;
  let yOffset2 = 0;

  for (let y = 0; y < rows; y++) {
  let xOffset1 = 0;
  let xOffset2 = 0;

    for (let x = 0; x < columns; x++) {
      let index = x + y * canvas.width
      const noiseValue =
        [
          perlin1.noise(xOffset1, yOffset1, 0) +
          perlin2.noise(xOffset2, yOffset2, 0) * 0.5
        ] *
        8 *
        Math.PI;
      const noiseVec = vec2(Math.cos(noiseValue), Math.sin(noiseValue));
      noiseVectors[index] = noiseVec;
      
      /* Draw flow field itself
      context.save();
      context.translate(x * GRID_SPACING, y * GRID_SPACING);
      context.rotate(noiseValue);

      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(20, 0);
      context.stroke();
      context.closePath();

      context.restore();
      */
      
      xOffset1 += OFFSET_INC1;
      xOffset2 += OFFSET_INC2;
    }

    yOffset1 += OFFSET_INC1;
    yOffset2 += OFFSET_INC2;
  }
  context.fillStyle = '#4E387E'
  context.fillRect(0, 0, canvas.width, canvas.height)
}


resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function resizeCanvas(event) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  rows = canvas.height;
  columns = canvas.width;

  createParticles();
  drawFlowField();
}

let time = 0
function animate() {
  window.requestAnimationFrame(animate);
  //context.fillStyle = 'white';
  //context.clearRect(0, 0, canvas.width, canvas.height);

  //drawFlowField();
  drawParticles();

  time += 0.00001
}

window.requestAnimationFrame(animate);