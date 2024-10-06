function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

function radToDeg(rad) {
  return rad / (Math.PI / 180);
}

var colors = ['silver', 'gray', 'white', 'maroon', 'red',
  'purple', 'fuchsia', 'green', 'lime', 'olive',
  'yellow', 'navy', 'blue', 'teal', 'aqua']

const COLLISION_ACCURACY = 0.01
  
function calculateNewVelocities(mass1, mass2, velocity1, velocity2) {
  impulse = mass1 * velocity1 + mass2 * velocity2;
  energy = mass1 * velocity1 * velocity1 / 2 + mass2 * velocity2 * velocity2 / 2;

  let D = mass1 * mass2 * (2 * energy * (mass1 + mass2) - impulse * impulse);
  if (D == -0) {
    D = 0;
  }

  let new_velocity2 = ((mass2 * impulse) - Math.sqrt(D)) / (mass2 * (mass1 + mass2));

  if (Math.abs(new_velocity2 - velocity2) < 0.001) {
    new_velocity2 = ((mass2 * impulse) + Math.sqrt(D)) / (mass2 * (mass1 + mass2));
  }
  let new_velocity1 = (impulse - mass2 * new_velocity2) / mass1;
  if (Math.abs(new_velocity1 - velocity1) < 0.001) {
    new_velocity1 = (impulse + mass2 * new_velocity2) / mass1;
  }
  return [new_velocity1, new_velocity2];
}

function innerWidth(node) {
  var computedStyle = getComputedStyle(node);

  let width = node.clientWidth;

  width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
  return width;
}

class Border {
  constructor(id, x_domain, y_domain){
    this.id = id;
    this.DOMObject = document.getElementById(this.id);

    this.x_domain = x_domain;
    this.y_domain = y_domain;
    this.width = 0;

    this.resize();
  }
  move(){ }
  getDOMObject(){
    this.DOMObject = document.getElementById(this.id);
    return this.DOMObject;
  }
  resize() {
    let width = innerWidth(this.getDOMObject())
    console.log(width);
    if (width == this.width) {
      return
    }
    this.width = width;
    this.height = this.width / this.x_domain * this.y_domain;
    this.DOMObject.style.height = Math.round(this.height) + 'px';
    this.DOMObject.style.width = Math.round(this.width) + 'px';
  }
}

class MyObject {
  constructor(id, position, velocity, mass, size, offset=0) {
    this.id = id;
    this.DOMObject = document.getElementById(this.id);
    this.DOMObject.onclick = this.colorChange;

    this.position = position;
    this.offset = offset;

    this.width = size[0];
    this.height = size[1];
    this.DOMObject.style.height = this.height / border.y_domain * border.height + 'px';
    this.DOMObject.style.width = this.width / border.x_domain * border.width + 'px';
    this.mass = mass;
    this.x_velocity = velocity[0];
    this.y_velocity = velocity[1];
    this.object_collided = [];
    this.updateView();
  }
  colorChange(){
    let color_index = Math.floor(Math.random() * colors.length);
    document.getElementById(this.id).style.backgroundColor = colors[color_index];
  }
  getPosition(){
    
  }
  getDOMObject(){
    this.DOMObject = document.getElementById(this.id);
    return this.DOMObject;
  }
  move(){
    this.checkCollision(); 
    this.checkCollisionWithBorder();
    this.position = this.getNewPosition();

    this.updateView();
  }
  updateView() {
    let [x, y] = this.position;
    y -= this.offset;
    
    this.DOMObject.style.top = y / border.y_domain * border.height + 'px';
    this.DOMObject.style.left = x / border.x_domain * border.width + 'px';
  
    this.DOMObject.style.height = this.height / border.y_domain * border.height + 'px';
    this.DOMObject.style.width = this.width / border.x_domain * border.width + 'px';
  }
  getNewPosition() {
    return [
      this.position[0] + this.x_velocity,
      this.position[1] + this.y_velocity
    ];
  }
  lowerBorder() {
    return this.position[1] + this.height;
  }
  upperBorder() {
    return this.position[1];
  }
  rightBorder() {
    return this.position[0] + this.width;
  }
  leftBorder() {
    return this.position[0];
  }
  newLowerBorder() {
    return this.getNewPosition()[1] + this.height;
  }
  newUpperBorder() {
    return this.getNewPosition()[1];
  }
  newRightBorder() {
    return this.getNewPosition()[0] + this.width;
  }
  newLeftBorder() {
    return this.getNewPosition()[0];
  }
  checkCollision() {
    for (let i = 0; i < objects.length; i++) {
      let id = 'object' + (i + 1);
      if (this.id == id) {
        continue;
      }
      if (this.object_collided.includes(id)) {
        this.object_collided = [];
        break;
      }
      let other = objects[i];
      
      let x_collision_accuracy = COLLISION_ACCURACY * border.x_domain;
      let y_collision_accuracy = COLLISION_ACCURACY * border.y_domain;

      if ((Math.abs(other.rightBorder() - this.newLeftBorder()) < x_collision_accuracy && this.x_velocity < 0 ||
        Math.abs(this.newRightBorder() - other.leftBorder()) < x_collision_accuracy && this.x_velocity > 0) && 
        (this.newLowerBorder() > other.upperBorder() && other.lowerBorder() > this.newUpperBorder())) {
          
        let x_velocities = calculateNewVelocities(this.mass, other.mass, this.x_velocity, other.x_velocity);
        this.x_velocity = x_velocities[0];
        other.x_velocity = x_velocities[1];
        other.object_collided.push(this.id);

        break;
  
      }

      if ((Math.abs(other.newUpperBorder() - this.newLowerBorder()) < y_collision_accuracy && this.y_velocity > 0 ||
        Math.abs(this.newUpperBorder() - other.newLowerBorder()) < y_collision_accuracy && this.y_velocity < 0) && 
        (this.newLeftBorder() < other.newRightBorder() && other.newLeftBorder() < this.newRightBorder())){

        let y_velocities = calculateNewVelocities(this.mass, other.mass, this.y_velocity, other.y_velocity);
        this.y_velocity = y_velocities[0];
        other.y_velocity = y_velocities[1];
        other.object_collided.push(this.id);

        break;
      }
    }
  }
  checkCollisionWithBorder() {
    let new_position = this.getNewPosition();
    if (new_position[0] < 0 && this.x_velocity < 0){
      this.x_velocity *= -1;
    }
    if (new_position[1] < 0 && this.y_velocity < 0){
      this.y_velocity *= -1;
    }
    if (new_position[1] + this.height > border.y_domain && this.y_velocity > 0){
      this.y_velocity *= -1;
    }
    if (new_position[0] + this.width > border.x_domain && this.x_velocity > 0){
      this.x_velocity *= -1;
    }
  }
}

is_moving = true

setInterval(() => {
  if (is_moving) {
    objects.forEach(element => {
      element.move();
    });
  }
  objects.forEach(element => {
    element.object_collided = [];
  });
  
  return;
}, 1)

var border = null;
objects = []

function reloadModel(border_x, border_y, position1, position2, size1, size2, velocity1, velocity2, mass1, mass2) {
  objects = [];
  border = new Border('border', border_x, border_y);
  var my_object1 = new MyObject('object1', position1, velocity1, mass1, size1, 0);
  objects.push(my_object1);

  offset = size1[1];

  var my_object2 = new MyObject('object2', position2, velocity2, mass2, size2, offset);
  objects.push(my_object2);

  // var my_object3 = new MyObject('object3', [5, 30], [-0.1, 0.1], 10, 2);
  // objects.push(my_object3);
}

function reloadForm() {
  const border_x = parseFloat(document.getElementById('border_x').value);
  const border_y = parseFloat(document.getElementById('border_y').value);
  const mass1 = parseFloat(document.getElementById('mass1').value);
  const velocity1x = parseFloat(document.getElementById('velocity1x').value) / 1000;
  const velocity1y = parseFloat(document.getElementById('velocity1y').value) / 1000;
  const width1 = parseFloat(document.getElementById('width1').value);
  const height1 = parseFloat(document.getElementById('height1').value);
  const position1x = parseFloat(document.getElementById('position1x').value);
  const position1y = parseFloat(document.getElementById('position1y').value);

  if (width1 > border_x) {
    window.alert("Ширина первого тела не должна быть больше размеров оболочки");
    return;
  }
  if (height1 > border_y) {
    window.alert("Высота первого тела не должна быть больше размеров оболочки");
    return;
  }
  if (position1x < 0 || position1x + width1 > border_x) {
    window.alert("Расположение первого тела должно быть в пределах оболочки");
    return;
  }
  if (position1y < 0 || position1y + height1 > border_y) {
    window.alert("Расположение первого тела должно быть в пределах оболочки");
    return;
  }


  const mass2 = parseFloat(document.getElementById('mass2').value);
  const velocity2x = parseFloat(document.getElementById('velocity2x').value) / 1000;
  const velocity2y = parseFloat(document.getElementById('velocity2y').value) / 1000;

  const width2 = parseFloat(document.getElementById('width2').value);
  const height2 = parseFloat(document.getElementById('height2').value);
  const position2x = parseFloat(document.getElementById('position2x').value);
  const position2y = parseFloat(document.getElementById('position2y').value);
  if (width2 > border_x) {
    window.alert("Ширина второго тела не должна быть больше размеров оболочки");
    return;
  }
  if (height2 > border_y) {
    window.alert("Высота второго тела не должна быть больше размеров оболочки");
    return;
  }
  if (position2x < 0 || position2x + width2 > border_x) {
    window.alert("Расположение второго тела должно быть в пределах оболочки");
    return;
  }
  if (position2y < 0 || position2y + height2 > border_y) {
    window.alert("Расположение второго тела должно быть в пределах оболочки");
    return;
  }

  reloadModel(
    border_x, border_y, 
    [position1x, position1y], 
    [position2x, position2y], 
    [width1, height1],
    [width2, height2], 
    [velocity1x, velocity1y], 
    [velocity2x, velocity2y], 
    mass1, mass2
  );
}

window.onload = () => {
  const checkbox = document.getElementById('stop_simulation');
        
  checkbox.addEventListener('change', function() {
    is_moving = 1 - is_moving;
  });

  
  reloadForm();

  document.getElementById('collisionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    reloadForm();
  });

}
