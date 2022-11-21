const howManyBuffers = 5;
let howManyLoaded = 0;

const urls = [
	"https://cdn.pixabay.com/photo/2013/09/22/19/14/brick-wall-185081_960_720.jpg",
	"https://cdn.pixabay.com/photo/2022/06/21/19/01/coast-7276345__340.jpg",
	"https://cdn.pixabay.com/photo/2022/06/21/19/01/coast-7276345__340.jpg",
	"https://cdn.pixabay.com/photo/2022/06/21/19/01/coast-7276345__340.jpg",
	"https://cdn.pixabay.com/photo/2022/06/21/19/01/coast-7276345__340.jpg"
]

const buffer = [];
let points = [];
let verticles = [];

async function loadFile(file) {
	text = await file.text();
	text = text.replaceAll('/', ' ');
	text = text.replaceAll('\n', ' ');
	let arrayCopy = text.split(' ');
	const vertices = [[]]; let licz_vertices = 0;
	const normals = [[]]; let licz_normals = 0;
	const coords = [[]]; let licz_coords = 0;
	const triangles = []; let licz_triangles = 0;
	for (let i = 0; i < arrayCopy.length - 1; i++) {
		if (arrayCopy[i] == 'v') {
			vertices.push([]);
			vertices[licz_vertices].push(parseFloat(arrayCopy[i + 1]));
			vertices[licz_vertices].push(parseFloat(arrayCopy[i + 2]));
			vertices[licz_vertices].push(parseFloat(arrayCopy[i + 3]));
			i += 3;
			licz_vertices++;
		}
		if (arrayCopy[i] == 'vn') {
			normals.push([]);
			normals[licz_normals].push(parseFloat(arrayCopy[i + 1]));
			normals[licz_normals].push(parseFloat(arrayCopy[i + 2]));
			normals[licz_normals].push(parseFloat(arrayCopy[i + 3]));
			i += 3;
			licz_normals++;
		}
		if (arrayCopy[i] == 'vt') {
			coords.push([]);
			coords[licz_coords].push(parseFloat(arrayCopy[i + 1]));
			coords[licz_coords].push(parseFloat(arrayCopy[i + 2]));
			i += 2;
			licz_coords++;
		}
		if (arrayCopy[i] == 'f') {
			triangles.push([]);
			for (let j = 1; j <= 9; j++)
				triangles[licz_triangles].push(parseFloat(arrayCopy[i + j]));
			i += 9;
			licz_triangles++;
		}
	}
	let vert_array = [];
	for (let i = 0; i < triangles.length; i++) {
		vert_array.push(vertices[triangles[i][0] - 1][0]);
		vert_array.push(vertices[triangles[i][0] - 1][1]);
		vert_array.push(vertices[triangles[i][0] - 1][2]);
		vert_array.push(normals[triangles[i][2] - 1][0]);
		vert_array.push(normals[triangles[i][2] - 1][1]);
		vert_array.push(normals[triangles[i][2] - 1][2]);
		vert_array.push(coords[triangles[i][1] - 1][0]);
		vert_array.push(coords[triangles[i][1] - 1][1]);
		vert_array.push(vertices[triangles[i][3] - 1][0]);
		vert_array.push(vertices[triangles[i][3] - 1][1]);
		vert_array.push(vertices[triangles[i][3] - 1][2]);
		vert_array.push(normals[triangles[i][5] - 1][0]);
		vert_array.push(normals[triangles[i][5] - 1][1]);
		vert_array.push(normals[triangles[i][5] - 1][2]);
		vert_array.push(coords[triangles[i][4] - 1][0]);
		vert_array.push(coords[triangles[i][4] - 1][1]);
		vert_array.push(vertices[triangles[i][6] - 1][0]);
		vert_array.push(vertices[triangles[i][6] - 1][1]);
		vert_array.push(vertices[triangles[i][6] - 1][2]);
		vert_array.push(normals[triangles[i][8] - 1][0]);
		vert_array.push(normals[triangles[i][8] - 1][1]);
		vert_array.push(normals[triangles[i][8] - 1][2]);
		vert_array.push(coords[triangles[i][7] - 1][0]);
		vert_array.push(coords[triangles[i][7] - 1][1]);
	}
	points[howManyLoaded] = triangles.length * 3;
	verticles[howManyLoaded] = vert_array;
	//gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert_array), gl.STATIC_DRAW);
	howManyLoaded++;
	console.log("Loaded " + howManyLoaded + " of " + howManyBuffers);
}

let gl;
let n_draw = 36;

function start() {
	/** @type {HTMLCanvasElement} */
	const canvas = document.getElementById("my_canvas");
	//Inicialize the GL contex
	gl = canvas.getContext("webgl2");
	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}

	console.log("WebGL version: " + gl.getParameter(gl.VERSION));
	console.log("GLSL version: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
	console.log("Vendor: " + gl.getParameter(gl.VENDOR));

	const vs = gl.createShader(gl.VERTEX_SHADER);
	const fs = gl.createShader(gl.FRAGMENT_SHADER);
	const program = gl.createProgram();

	const vsSource =
		`#version 300 es
		precision mediump float;
		uniform mat4 model;
		uniform mat4 view;
		uniform mat4 proj;
		in vec3 position;
		in vec3 color;
		out vec3 Color;
		in vec2 aTexCoord;
		out vec2 TexCoord;
		void main(void)
		{
			TexCoord = aTexCoord;
			Color = color;
			gl_Position = proj * view * model * vec4(position, 1.0);
		}	
	`;

	const fsSource =
		`#version 300 es
		precision mediump float;
		out vec4 frag_color;
		in vec3 Color;
		in vec2 TexCoord;
		uniform sampler2D texture1;
		uniform sampler2D texture2;
		void main(void)
		{
			//frag_color = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.5);
			frag_color = texture(texture1, TexCoord);// * vec4(Color, 1.0);
			//frag_color = vec4(Color, 1.0);
		}
	`;


	//compilation vs
	gl.shaderSource(vs, vsSource);
	gl.compileShader(vs);
	if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(vs));
	}

	//compilation fs
	gl.shaderSource(fs, fsSource);
	gl.compileShader(fs);
	if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(fs));
	}

	if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(fs));
	}

	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		alert(gl.getProgramInfoLog(program));
	}

	gl.useProgram(program);

	//*****************pointer lock object forking for cross browser**********************
	canvas.requestPointerLock =
		canvas.requestPointerLock || canvas.mozRequestPointerLock;
	document.exitPointerLock =
		document.exitPointerLock || document.mozExitPointerLock;
	canvas.onclick = function () {
		canvas.requestPointerLock();
	};
	// Hook pointer lock state change events for different browsers
	document.addEventListener("pointerlockchange", lockChangeAlert, false);
	document.addEventListener("mozpointerlockchange", lockChangeAlert, false);
	function lockChangeAlert() {
		if (
			document.pointerLockElement === canvas ||
			document.mozPointerLockElement === canvas
		) {
			console.log("The pointer lock status is now locked");
			document.addEventListener("mousemove", ustaw_kamere_mysz, false);
		} else {
			console.log("The pointer lock status is now unlocked");
			document.removeEventListener("mousemove", ustaw_kamere_mysz, false);
		}
	}
	//****************************************************************

	for (let i = 0; i < howManyBuffers; i++) {
		buffer[i] = gl.createBuffer();
	}

	// FPS-y ----------------------------------------------------------------------------------------

	let licznik = 0;
	const fpsElem = document.querySelector("#fps");
	let startTime = 0;
	let elapsedTime = 0;
	//-----------------------------------------------------------------------------------------------


	// macierz modelu -------------------------------------------------------------------------------

	const model = mat4.create();
	let kat_obrotu = 45 * Math.PI / 180; // in radians
	mat4.rotate(model, model, kat_obrotu, [0, 0, 1]);

	let uniModel = gl.getUniformLocation(program, 'model');
	gl.uniformMatrix4fv(uniModel, false, model);

	//-----------------------------------------------------------------------------------------------

	// Zmiany modelu - ruch -------------------------------------------------------------------------

	var pressedKey = {};
	window.onkeyup = (e) => (pressedKey[e.key] = false);
	window.onkeydown = (e) => (pressedKey[e.key] = true);

	uniView = gl.getUniformLocation(program, "view");

	// macierz widoku -------------------------------------------------------------------------------


	const view = mat4.create();
	mat4.lookAt(view, [0, 0, 3], [0, 0, -1], [0, 1, 0]);

	let cameraPos = glm.vec3(0, 0, 3);
	let cameraFront = glm.vec3(0, 0, -1);
	let cameraUp = glm.vec3(0, 1, 0);

	function ustaw_kamere() {
		let cameraSpeed = 0.01 * elapsedTime;

		if (pressedKey["ArrowUp"]) {
			cameraPos.x += cameraSpeed * cameraFront.x;
			cameraPos.y += cameraSpeed * cameraFront.y;
			cameraPos.z += cameraSpeed * cameraFront.z;
		}
		if (pressedKey["ArrowDown"]) {
			cameraPos.x -= cameraSpeed * cameraFront.x;
			cameraPos.y -= cameraSpeed * cameraFront.y;
			cameraPos.z -= cameraSpeed * cameraFront.z;
		}

		if (pressedKey["ArrowRight"]) {
			let cameraPos_tmp = glm.normalize(glm.cross(cameraFront, cameraUp));
			cameraPos.x += cameraPos_tmp.x * cameraSpeed;
			cameraPos.y += cameraPos_tmp.y * cameraSpeed;
			cameraPos.z += cameraPos_tmp.z * cameraSpeed;

			console.log(cameraSpeed, elapsedTime, cameraPos)

		}

		if (pressedKey["ArrowLeft"]) {
			let cameraPos_tmp = glm.normalize(glm.cross(cameraFront, cameraUp));
			cameraPos.x -= cameraPos_tmp.x * cameraSpeed;
			cameraPos.y -= cameraPos_tmp.y * cameraSpeed;
			cameraPos.z -= cameraPos_tmp.z * cameraSpeed;
		}

		let cameraFront_tmp = glm.vec3(1, 1, 1);

		cameraFront_tmp.x = cameraPos.x + cameraFront.x;
		cameraFront_tmp.y = cameraPos.y + cameraFront.y;
		cameraFront_tmp.z = cameraPos.z + cameraFront.z;
		mat4.lookAt(view, cameraPos, cameraFront_tmp, cameraUp);
		gl.uniformMatrix4fv(uniView, false, view);
	}

	ustaw_kamere();

	//

	let x = 50; //zmiana położenia w kierunku x
	let y = 50; //zmiana położenia w kierunku y
	//W celu kontroli aktualnego nachylenia kamery potrzebne będą dwa kąty:
	let yaw = -90; //obrót względem osi X
	let pitch = 0; //obrót względem osi Y

	function ustaw_kamere_mysz(e) {
		//return;
		//Wyznaczyć zmianę pozycji myszy względem ostatniej klatki
		let xoffset = e.movementX;
		let yoffset = e.movementY;
		let sensitivity = 0.1;
		let cameraSpeed = 0.05 * elapsedTime;
		xoffset *= sensitivity;
		yoffset *= sensitivity;
		//Uaktualnić kąty
		yaw += xoffset * cameraSpeed;
		pitch -= yoffset * cameraSpeed;
		//Nałożyć ograniczenia co do ruchy kamery
		if (pitch > 89.0) pitch = 89.0;
		if (pitch < -89.0) pitch = -89.0;
		let front = glm.vec3(1, 1, 1);
		//Wyznaczenie wektora kierunku na podstawie kątów Eulera
		front.x = Math.cos(glm.radians(yaw)) * Math.cos(glm.radians(pitch));
		front.y = Math.sin(glm.radians(pitch));
		front.z = Math.sin(glm.radians(yaw)) * Math.cos(glm.radians(pitch));
		cameraFront = glm.normalize(front);
	}

	//-----------------------------------------------------------------------------------------------


	// macierz projekcji -------------------------------------------------------------------------------

	const proj = mat4.create();
	mat4.perspective(proj, 60 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);

	let uniProj = gl.getUniformLocation(program, 'proj');
	gl.uniformMatrix4fv(uniProj, false, proj);

	const texture = [];

	for (let i = 0; i < howManyBuffers; i++) {
		texture[i] = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture[i]);
		const level = 0;
		const internalFormat = gl.RGBA;
		const width = 1;
		const height = 1;
		const border = 0;
		const srcFormat = gl.RGBA;
		const srcType = gl.UNSIGNED_BYTE;
		const pixel = new Uint8Array([0, 0, 255, 255]);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
			width, height, border, srcFormat, srcType,
			pixel);
		const image = new Image();
		image.onload = function () {
			gl.bindTexture(gl.TEXTURE_2D, texture[i]);
			gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		};
		image.crossOrigin = "";
		console.log(urls[i])
		image.src = urls[i];
	}
	//-----------------------------------------------------------------------------------------------

	///Z-BUFFER
	gl.enable(gl.DEPTH_TEST);

	draw();

	function draw() {
		elapsedTime = performance.now() - startTime;

		startTime = performance.now();

		licznik++;
		let fFps = 1000 / elapsedTime;
		// ograniczenie częstotliwości odświeżania napisu do ok 1/s
		if (licznik > fFps) {
			fpsElem.textContent = fFps.toFixed(1);
			licznik = 0;
		}

		ustaw_kamere();

		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		//console.log(verticles);
		
		for (let i = 0; i < howManyBuffers; i++) {
			if(verticles[i]){
				gl.bindBuffer(gl.ARRAY_BUFFER, buffer[i]);

				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticles[i]), gl.STATIC_DRAW);
	
				const positionAttrib = gl.getAttribLocation(program, "position");
				gl.enableVertexAttribArray(positionAttrib);
				gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 8 * 4, 0);
	
				const texCoord = gl.getAttribLocation(program, "aTexCoord");
				gl.enableVertexAttribArray(texCoord);
				gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, 8 * 4, 6 * 4);
	
				gl.bindTexture(gl.TEXTURE_2D, texture[i]);
				gl.drawArrays(gl.TRIANGLES, 0, points[i]);
			}
		}

		gl.viewport(0, 0, canvas.width, canvas.height);

		//window.requestAnimationFrame(draw);
		const FPS = 144;
		setTimeout(() => { requestAnimationFrame(draw); }, 1000 / FPS);
	}

	//Add the event listeners for keydown, keyup
	window.addEventListener('keydown', function (event) {
		switch (event.key) {
			case "z":
				if (gl.isEnabled(gl.DEPTH_TEST)) {
					gl.disable(gl.DEPTH_TEST);
				}
				else {
					gl.enable(gl.DEPTH_TEST);
				}
				break;
			case 'Escape':
				if (confirm("Close Window?")) {
					close();
				}
				break;
		}
	}, false);
}