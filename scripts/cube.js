import * as THREE from '../resources/threejs/build/three.module.js';

let cube_state = "RYRWBOBGGBROWYYRGWGOYWORGWBYRYRYBGWOYWOGBRWOWBOYGGROBB"
//				 "012345678901234567890123456789012345678901234567890123"
let moveSequence = ['Xi', 'U', 'U', 'Li', 'D', 'D', 'B', 'B', 'Di', 'B', 'Li', 'U', 'U', 'Li', 'U', 'Di', 'Ri', 'F', 'F', 'R', 'R', 'U', 'U', 'B', 'B', 'U', 'U', 'L', 'L', 'Ui', 'R', 'R']
let cube

const red = new THREE.Color(1, 0, 0);
const green = new THREE.Color(0, 1, 0);
const blue = new THREE.Color(0, 0, 1);
const orange = new THREE.Color(1, 0.5, 0);
const white = new THREE.Color(1, 1, 1);
const yellow = new THREE.Color(1, 1, 0);
const black = new THREE.Color(0, 0, 0);
const magenta = new THREE.Color(1, 0, 1);
const c = {"W": white, "O": orange, "R": red, "B": blue, "Y": yellow, "G": green}
const boxSize = 0.97
const cubies = []
let rotatingCubies = []
let rotationAxes = 'x'
let rotationAmount = 0
let rotationTarget = 0
let moveCallback = null

window.makeMove = makeMove;
window.makeSequenceOfMoves = makeSequenceOfMoves;

window.solve = () => {makeSequenceOfMoves(moveSequence)}

function main() {
	const canvas = document.querySelector('#c');
	let size = window.innerWidth;
	if(size > window.innerHeight)
		size = window.innerHeight - 200
	canvas.width  = size
  	canvas.height = size
	const renderer = new THREE.WebGLRenderer({
		canvas
	});
	const fov = 50;
	const aspect = canvas.width/canvas.height // the canvas default
	const near = 0.01;
	const far = 9;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(3, 3, 5);
	camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.55)
	camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), -0.52)
	//camera.rotation.set(-Math.PI/4, Math.PI/4, 0)

	const scene = new THREE.Scene();

	{
		const color = 0xFFFFFF;
		const intensity = 2;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(3, 3, 3);
		light.rotation.set(-Math.PI/4, Math.PI/4, 0);
		scene.add(light);
	}

	createRubiksCube(scene)
	renderer.render(scene, camera);

	function render(time) {
		time *= 0.001; // convert time to seconds
		// if(rotating) {
		// 	for (let cube of cubies) {
		// 		rotateAboutAxis(cube, 0.01, 'x')
		// 		rotateAboutAxis(cube, 0.01, 'y')
		// 	}
		// }

		const rotationSpeed = Math.PI / 50
		if(rotatingCubies.length > 0) {
			for(let cube of rotatingCubies)
				rotateAboutAxis(cube,
					Math.sign(rotationTarget) * rotationSpeed, rotationAxes)
			rotationAmount += rotationSpeed
		}

		if(rotationAmount >= Math.abs(rotationTarget)) {
			let rot = Math.abs(rotationTarget) - rotationAmount
			for(let cube of rotatingCubies)
				rotateAboutAxis(cube,
					Math.sign(rotationTarget) * rot, rotationAxes)
			rotatingCubies = []
			rotationAmount = 0
			if(moveCallback)
				moveCallback()
		}

		renderer.render(scene, camera);

		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
}

function makeSequenceOfMoves(moves) {
	if(moves.length == 0)
		return

	makeMove(moves[0], () => {
		moves.splice(0, 1)
		makeSequenceOfMoves(moves)
	})
}

function makeMove(move, callback=null) {
	moveCallback = callback
	let cw = -1

	if(move.length > 1)
		cw = (move[1] == 'i') ? 1 : -1
	move = move[0]
	if(move == 'B' || move == 'L' || move == 'D')
		cw = -cw

	rotationTarget = cw * Math.PI/2

	if(move == 'Z' || move == 'S' || move == 'F' || move == 'B') {
		rotationAxes = 'z'
		if(move == 'Z')
			rotatingCubies = [...cubies]
		else {
			let dir = (move == 'F') ? 1 : (move == 'B' ? -1 : 0)
			for(let cube of cubies)
				if(Math.abs(cube.position.z - dir) < 0.1)
					rotatingCubies.push(cube)
		}
	}

	if(move == 'X' || move == 'M' || move == 'L' || move == 'R') {
		rotationAxes = 'x'
		if(move == 'X')
			rotatingCubies = [...cubies]
		else {
			let dir = (move == 'R') ? 1 : (move == 'L' ? -1 : 0)
			for(let cube of cubies)
				if(Math.abs(cube.position.x - dir) < 0.1)
					rotatingCubies.push(cube)
		}
	}

	if(move == 'Y' || move == 'E' || move == 'U' || move == 'D') {
		rotationAxes = 'y'
		if(move == 'Y')
			rotatingCubies = [...cubies]
		else {
			let dir = (move == 'U') ? 1 : (move == 'D' ? -1 : 0)
			for(let cube of cubies)
				if(Math.abs(cube.position.y - dir) < 0.1)
					rotatingCubies.push(cube)
		}
	}
}

function rotateAboutAxis(cube, angle, axis) {
	if(axis == 'x') {
		const x = cube.position.x
		cube.position.x = 0
    	cube.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), angle); // rotate the POSITION
    	cube.position.x = x
		cube.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), angle);
	}
	if(axis == 'z') {
		const z = cube.position.z
		cube.position.z = 0
    	cube.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle); // rotate the POSITION
    	cube.position.z = z
		cube.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), angle);
	}
	if(axis == 'y') {
		const y = cube.position.y
		cube.position.y = 0
    	cube.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle); // rotate the POSITION
    	cube.position.y = y
		cube.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), angle);
	}
}

function createRubiksCube(scene) {
	for(let x = -1; x <= 1; x++)
		for(let y = -1; y <= 1; y++)
			for(let z = -1; z <= 1; z++)
				createCubie(x, y, z)

	for(let cube of cubies)
		scene.add(cube)
}

// x, y, z range from -1 to 1
function createCubie(x, y, z) {
	let colors = new Array(6)
	if(x == 1) {
		colors[0] = c[cube_state[28 - y + 12*z]]
		colors[1] = black
	} else if(x == -1) {
		colors[0] = black
		colors[1] = c[cube_state[22 + y + 12*z]]
	} else {
		colors[0] = black
		colors[1] = black
	}

	if(y == 1) {
		colors[2] = c[cube_state[25 + x + 12*z]]
		colors[3] = black
	} else if(y == -1) {
		colors[2] = black
		colors[3] = c[cube_state[31 - x + 12*z]]
	} else {
		colors[2] = black
		colors[3] = black
	}

	if(z == 1) {
		colors[4] = c[cube_state[49 + x - 3*y]]
		colors[5] = black
	} else if(z == -1) {
		colors[4] = black
		colors[5] = c[cube_state[4 + x + 3*y]]
	} else {
		colors[4] = black
		colors[5] = black
	}
	let cube = createCube(colors)
	cube.position.x = x
	cube.position.y = y
	cube.position.z = z
}

// RLUDFB
function createCube(colors) {
	let materials = new Array(6)
	for (let i = 0; i < 6; i++) {
		if(!colors[i])
			colors[i] = magenta
		materials[i] = new THREE.MeshPhongMaterial({
			color: colors[i]
		})
	}

	const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
	const cube = new THREE.Mesh(geometry, materials)
	cubies.push(cube)
	return cube
}

/*
   RYR
   WBO
   BGG
BROWYYRGWGOY
WORGWBYRYRYB
GWOYWOGBRWOW
   BOY
   GGR
   OBB

RYRWBOBGGBROWYYRGWGOYWORGWBYRYRYBGWOYWOGBRWOWBOYGGROBB
*/

main()
