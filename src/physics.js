import * as THREE from "three";

export class Particle {
  constructor({ x, y, z, velX = 0, velY = 0, velZ = 0 }) {
    this.pos = new THREE.Vector3(x, y, z);
    this.vel = new THREE.Vector3(velX, velY, velZ);
    this.acc = new THREE.Vector3(0, 0, 0);
    this.brightness = 1;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  fade() {
    this.brightness -= 0.001;
  }

  isDead() {
    return this.brightness < 0;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);

    // clear last acceleration
    this.acc.set(0, 0, 0);
  }
}
