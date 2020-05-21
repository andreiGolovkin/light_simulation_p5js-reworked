let shapes;
let light_sources = [];
let light_source;

function setup(){
	createCanvas(800, 800);

	shapes = [new Shape([[384, 96],
									 		 [288, 192],
									 	 	 [352, 288],
									 	 	 [416, 320],
									 	 	 [460, 192]]),
						new Shape([[96, 384],
									 		 [64, 480],
									 	 	 [192, 448],
									 		 [192, 352]]),
						new Shape([[480, 576],
									 		 [576, 672],
									 	 	 [640, 608]]),
						new Shape([[672, 384],
											 [672, 480],
											 [736, 544],
											 [768, 416],
											 [736, 448]]),
						new Shape([[0, 0],
											 [799, 0],
										 	 [799, 799],
										 	 [0, 799]])];
	light_source = new LightSource();
	light_sources.push(new LightSource());
	light_sources.push(new LightSource());
	light_sources.push(new LightSource());
	light_sources.push(new LightSource());
	light_sources.push(new LightSource());
	light_sources.push(new LightSource());
	light_sources.push(new LightSource());
	light_sources.push(new LightSource());
	light_sources.push(new LightSource());
}

function draw(){
	if(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
		light_source.set_pos(mouseX, mouseY);
		for(let n = 0; n < light_sources.length; n++){
			let angle = PI * 2 * (n/light_sources.length);
			let x = mouseX + cos(angle) * 10;
			let y = mouseY + sin(angle) * 10;
			light_sources[n].set_pos(x, y);
		}
	}

	background(0, 0, 0);

	light_source.draw(shapes);
	for(ls of light_sources){
		ls.draw(shapes);
	}

	light_source.draw_center();
	for(ls of light_sources){
		ls.draw_center();
	}

	stroke(255, 255, 255);
	for(var shape of shapes){
		shape.draw();
	}
}

class Shape{
	constructor(points){
		this.points = [];
		for(var point of points){
			let x = point[0];
			let y = point[1];

			this.points.push(createVector(x, y));
		}
	}

	draw(){
		let prev_index = this.points.length - 1;
		for(var index = 0; index < this.points.length; index++){
			let p1 = this.points[prev_index];
			let p2 = this.points[index];

			line(p1.x, p1.y, p2.x, p2.y);
			prev_index = index;
		}
	}

	get_walls(){
		let walls = [];

		let prev_index = this.points.length - 1;
		for(var index = 0; index < this.points.length; index++){
			let p1 = this.points[prev_index];
			let p2 = this.points[index];

			prev_index = index;

			let wall = [p1, p2];

			walls.push(wall);
		}

		return walls;
	}
}

class LightSource{
	constructor(){
		this.pos = createVector(width/2, height/2);
	}

	draw(shapes){
		let rays = this.create_rays(shapes);

		let rays2 = [];

		for(let ray of rays){
			let intersection;
			let current_dist;

			for(let shape of shapes){
				let walls = shape.get_walls();
				for(let wall of walls){
					//print(wall)
					let new_intersection = this.get_intersection(this.pos, ray.end_point, wall[0], wall[1]);
					//print(new_intersection)
					if(new_intersection.is_intersects){
						let new_dist = dist(new_intersection.intersection_point.x,
															  new_intersection.intersection_point.y,
															  this.pos.x, this.pos.y)

						if(intersection == null || new_dist < current_dist){
							intersection = new_intersection;
							current_dist = new_dist;
						}
					}
				}
			}
			if(intersection != null && intersection.is_intersects){
				ray = intersection.intersection_point;
				rays2.push(ray);
			}
			//ellipse(ray.x, ray.y, 5, 5);
		}

		noStroke();
		fill(255, 255, 255, 100);
		beginShape();

		for(let ray of rays2){
			vertex(ray.x, ray.y);
		}

		endShape(CLOSE);

		/*stroke(100, 100, 100);
		for(let ray of rays2){
			line(this.pos.x, this.pos.y, ray.x, ray.y);
		}*/
	}

	draw_center(){
		fill(255, 0, 0, 255);
		stroke(255, 0, 0, 255);

		ellipse(this.pos.x, this.pos.y, 5, 5);
	}

	set_pos(x, y){
		this.pos.x = x;
		this.pos.y = y;
	}

	create_rays(shapes){
		let rays = [];

		for(let shape of shapes){
			for(let point of shape.points){
				let angle = atan2(point.y - this.pos.y, point.x - this.pos.x);
				let c_ray = {end_point: createVector(this.pos.x + cos(angle), this.pos.y + sin(angle)), angle: angle};
				let r_ray = {end_point: createVector(this.pos.x + cos(angle + 0.00001), this.pos.y + sin(angle + 0.00001)), angle: angle + 0.00001};
				let l_ray = {end_point: createVector(this.pos.x + cos(angle - 0.00001), this.pos.y + sin(angle - 0.00001)), angle: angle - 0.00001};

				rays.push(r_ray);
				rays.push(c_ray);
				rays.push(l_ray);
			}
		}

		rays.sort(function(a, b){
			return a.angle - b.angle;
		});

		return rays;
	}

	get_intersection(p11, p12, p21, p22){
		let intersection = {is_intersects: false, intersection_point: null};

		let x1 = p11.x;
		let y1 = p11.y;
		let x2 = p12.x;
		let y2 = p12.y;

		let x3 = p21.x;
		let y3 = p21.y;
		let x4 = p22.x;
		let y4 = p22.y;

		const div = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

		if(div != 0){

			let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / div;
			let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / div;

			if(t >= 0 && u >= 0 && u <= 1){
				let px = x1 + t * (x2 - x1);
				let py = y1 + t * (y2 - y1);

				intersection.is_intersects = true;
				intersection.intersection_point = createVector(px, py);
			}
		}

		return intersection;
	}
}
