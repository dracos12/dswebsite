var canvas = document.createElement( 'canvas' ),
    ctx = canvas.getContext( '2d' ),
    fl = 300,
    count = 200,
    points = [],
    startSpeed = 0,
    tick = 0,
    width,
    height,
    bounds,
    vp,
    mouse,
    canvasOffset;
/* sunburst vars */
	const lineAmount = 200;
	const radius = 0;
	const inverted = true;
	const random = (min, max) => ~~(Math.random() * (max - min)) + min;
	let lines = [];
	let explosion = null;
	let timeout = null;

function rand( min, max ) {
  return Math.random() * ( max - min ) + min;
}

function norm( val, min, max ) {
  return ( val - min ) / ( max - min );
}

function resetPoint( p, init ) {
  p.z = init ? rand( 1, bounds.z.max ) : bounds.z.max;
  p.x = rand( bounds.x.min, bounds.x.max ) / ( fl / ( fl + p.z ) );
  p.y = rand( bounds.y.min, bounds.y.max ) / ( fl / ( fl + p.z ) );
  p.ox = p.x;
  p.oy = p.y;
  p.oz = p.z;
  p.vx = 0;
  p.vy = 0;
  p.vz = rand( -1, -10 ) + startSpeed;
  p.ax = 0;
  p.ay = 0;
  p.az = 0;
  p.s = 0;
  p.sx = 0;
  p.sy = 0;
  p.os = p.s;
  p.osx = p.sx;
  p.osy = p.sy;
  p.hue = rand( 120, 200 );
  p.lightness = rand( 70, 100 );
  p.alpha = 0;
  return p;
}

function create() {
  vp = {
    x: width / 2,
    y: height / 2
  };
  mouse = {
    x: vp.x,
    y: vp.y,
    down: false
  };
  bounds = {
      x: { min: -vp.x, max: width - vp.x },
      y: { min: -vp.y, max: height - vp.y },
      z: { min: -fl, max: 1000 }
  };
  init();
}

function init() {
 while(lines.length <= lineAmount) 
				lines.push(new Line(360 / lineAmount * lines.length)); 
}

function Line(angle) {
		this.angle = angle;
		this.width = random(1, 10);
		this.centerOffset = radius;
		this.length = random(75,250);
		this.initialNoise = random(5,20);
		this.noise = random(this.length / 2, this.length);
}

Line.prototype = {
  draw: function(i) {
    let angle = this.angle + tick / 10;
    let startX = this.centerOffset * Math.cos(angle * Math.PI / 180);
    let startY = this.centerOffset * Math.sin(angle * Math.PI / 180);
    let endX = startX + (this.length + (Math.sin((tick / 10 + this.noise) / 2) * this.noise)) * Math.cos(angle * Math.PI / 180);
    let endY = startY + (this.length + (Math.sin((tick / 10 + this.noise) / 2) * this.noise)) * Math.sin(angle * Math.PI / 180);

    ctx.fillStyle = 'hsl(' + i / 2 * Math.sin(tick / 100) + ',50%,50%)';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + this.width / 2 * Math.cos((angle + 90) * Math.PI / 180), startY + this.width / 2 * Math.sin((angle + 90) * Math.PI / 180));
    ctx.lineTo(endX, endY);
    ctx.lineTo(startX + this.width / 2 * Math.cos((angle - 90) * Math.PI / 180), startY + this.width / 2 * Math.sin((angle - 90) * Math.PI / 180));
    ctx.closePath();
    ctx.fill();
  }
}

function update() {
  if( mouse.down ) {
    if( startSpeed > -30 ) {
      startSpeed -= 0.1;
    } else {
      startSpeed = -30;
    }
  } else {
    if( startSpeed < 0 ) {
      startSpeed += 1;
    } else {
      startSpeed = 0;
    }
  }
  
  vp.x += ( ( width / 2 - ( mouse.x - width / 2 ) ) - vp.x ) * 0.025;
  vp.y += ( ( height / 2 - ( mouse.y - height / 2 ) ) - vp.y ) * 0.025;
  bounds = {
      x: { min: -vp.x, max: width - vp.x },
      y: { min: -vp.y, max: height - vp.y },
      z: { min: -fl, max: 1000 }
  };  
  
  if( points.length < count ) {
    points.push( resetPoint( {} ) );
  }
  var i = points.length;
  while( i-- ) {
    var p = points[ i ];
    p.vx += p.ax;
    p.vy += p.ay;
    p.vz += p.az;
    p.x += p.vx;
    p.y += p.vy;
    p.z += p.vz;
    if( mouse.down ) {
      p.az = -0.5;
    }
    if( 
      p.sx - p.sr > bounds.x.max ||
      p.sy - p.sr > bounds.y.max ||
      p.z > bounds.z.max ||
      p.sx + p.sr < bounds.x.min ||
      p.sy + p.sr < bounds.y.min ||
      p.z < bounds.z.min
    ) {
      resetPoint( p );
    }
    p.ox = p.x;
    p.oy = p.y;
    p.oz = p.z;
    p.os = p.s;
    p.osx = p.sx;
    p.osy = p.sy;
  }
}

function render() {
  ctx.save();
  ctx.translate( vp.x, vp.y );
  ctx.clearRect( -vp.x, -vp.y, width, height );
  /* draw lines here */
  ctx.globalCompositeOperation = 'lighter';
  lines.forEach((line, i) => line.draw(i));
  ctx.globalCompositeOperation = 'source-over';
  
  var i = points.length;
  while( i-- ) {
    var p = points[ i ];    
    p.s = fl / ( fl + p.z );
    p.sx = p.x * p.s;
    p.sy = p.y * p.s;
    p.alpha = ( bounds.z.max - p.z ) / ( bounds.z.max / 2 );
    ctx.beginPath();
    ctx.moveTo( p.sx, p.sy );
    ctx.lineTo( p.osx, p.osy );
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'hsla(' + p.hue + ', 100%, ' + p.lightness + '%, ' + p.alpha + ')';
    ctx.stroke();
  }

 
  ctx.restore();
}

function resize() {
  width = canvas.width = 800;
  height = canvas.height = 600;
  canvasOffset = { x: canvas.offsetLeft, y: canvas.offsetTop };
}

function mousemove( e ) {
  mouse.x = e.pageX - canvasOffset.x;
  mouse.y = e.pageY - canvasOffset.y;
}

function mousedown() {
  mouse.down = true;
}

function mouseup() {
  mouse.down = false;
}

function loop() {
  requestAnimationFrame( loop );
  update();
  render();
  tick++;
}

window.addEventListener( 'resize', resize );
// canvas.addEventListener( 'mousemove', mousemove );
// canvas.addEventListener( 'mousedown', mousedown );
// canvas.addEventListener( 'mouseup', mouseup );
document.body.appendChild( canvas );
resize();
create();
loop();