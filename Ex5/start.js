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
	n_draw = triangles.length * 3;
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vert_array), gl.STATIC_DRAW);
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


	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	n_draw = 36;
	cube();

	// dane wierzchołkowe -------------------------------------------------------------------------
	const positionAttrib = gl.getAttribLocation(program, "position");
	gl.enableVertexAttribArray(positionAttrib);
	gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 8 * 4, 0);

	const colorAttrib = gl.getAttribLocation(program, "color");
	gl.enableVertexAttribArray(colorAttrib);
	gl.vertexAttribPointer(colorAttrib, 3, gl.FLOAT, false, 8 * 4, 3 * 4);

	const texCoord = gl.getAttribLocation(program, "aTexCoord");
	gl.enableVertexAttribArray(texCoord);
	gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, 8 * 4, 6 * 4);

	//-----------------------------------------------------------------------------------------------

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

	//ustaw_kamere_mysz();

	//-----------------------------------------------------------------------------------------------


	// macierz projekcji -------------------------------------------------------------------------------

	const proj = mat4.create();
	mat4.perspective(proj, 60 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);

	let uniProj = gl.getUniformLocation(program, 'proj');
	gl.uniformMatrix4fv(uniProj, false, proj);


	// textury
	const texture1 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture1);
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
		gl.bindTexture(gl.TEXTURE_2D, texture1);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	};
	image.crossOrigin = "";
	image.src = "https://cdn.pixabay.com/photo/2013/09/22/19/14/brick-wall-185081_960_720.jpg";


	const texture2 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture2);
	const level2 = 0;
	const internalFormat2 = gl.RGBA;
	const width2 = 1;
	const height2 = 1;
	const border2 = 0;
	const srcFormat2 = gl.RGBA;
	const srcType2 = gl.UNSIGNED_BYTE;
	const pixel2 = new Uint8Array([0, 0, 255, 255]);
	gl.texImage2D(gl.TEXTURE_2D, level2, internalFormat2, width2, height2, border2, srcFormat2, srcType2, pixel2);
	const image2 = new Image();
	image2.onload = function () {
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.texImage2D(gl.TEXTURE_2D, level2, internalFormat2, srcFormat2, srcType2, image2);

		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	};
	image2.crossOrigin = "";
	image2.src = "https://cdn.pixabay.com/photo/2022/06/21/19/01/coast-7276345__340.jpg"
	gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
	gl.uniform1i(gl.getUniformLocation(program, "texture2"), 1);

	//-----------------------------------------------------------------------------------------------

	let separateLeft = -6.0;
	let separateRight = 6.0;
	let seperateBottom = -4.8;
	let seperateTop = 4.8;
	let eyeRed = -0.1;
	let eyeBlue = 0.1;

	//-----------------------------------------------------------------------------------------------
	let projection = 0;
	gl.enable(gl.DEPTH_TEST);
	///Z-BUFFER

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
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

		//1
		gl.activeTexture(gl.TEXTURE0);

		// gl.bindTexture(gl.TEXTURE_2D, texture1);
		// gl.drawArrays(gl.TRIANGLES, 0, n_draw);

		//2
		gl.bindTexture(gl.TEXTURE_2D, texture1);
		gl.drawArrays(gl.TRIANGLES, 0, n_draw/2);

		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.drawArrays(gl.TRIANGLES, n_draw/2, n_draw);

		//3
		// gl.activeTexture(gl.TEXTURE0);
		// gl.bindTexture(gl.TEXTURE_2D, texture1);
		// gl.activeTexture(gl.TEXTURE1);
		// gl.bindTexture(gl.TEXTURE_2D, texture2);
		// gl.drawArrays(gl.TRIANGLES, 0, n_draw);
		switch (projection) {
			default:
			case 0: // mono
				gl.viewport(0, 0, canvas.width, canvas.height);

				gl.bindTexture(gl.TEXTURE_2D, texture1);
				gl.drawArrays(gl.TRIANGLES, 0, n_draw);

				break;
			case 1: //stereo
				gl.viewport(0, 0, canvas.width, canvas.height);
				StereoProjection(separateLeft, separateRight, seperateBottom, seperateTop, 12.99, -100, 0, 13, eyeRed);
				gl.colorMask(true, false, false, false);

				gl.bindTexture(gl.TEXTURE_2D, texture1);
				gl.drawArrays(gl.TRIANGLES, 0, n_draw);

				gl.clear(gl.DEPTH_BUFFER_BIT);
				StereoProjection(separateLeft, separateRight, seperateBottom, seperateTop, 12.99, -100, 0, 13, eyeBlue);
				gl.colorMask(false, false, true, false);

				gl.bindTexture(gl.TEXTURE_2D, texture1);
				gl.drawArrays(gl.TRIANGLES, 0, n_draw);

				gl.colorMask(true, true, true, true);
				break;
			case 2: //side by side
				gl.viewport(canvas.width / 2, 0, canvas.width / 2, canvas.height);

				StereoProjection(separateLeft, separateRight, seperateBottom, seperateTop, 12.99, -100, 0, 13, eyeRed);
				//StereoProjection(-6, 6, -4.8, 4.8, 12.99, -100, 0, 13, -0.1);

				gl.bindTexture(gl.TEXTURE_2D, texture1);
				gl.drawArrays(gl.TRIANGLES, 0, n_draw);

				gl.clear(gl.DEPTH_BUFFER_BIT);

				gl.viewport(0, 0, canvas.width / 2, canvas.height);
				StereoProjection(separateLeft, separateRight, seperateBottom, seperateTop, 12.99, -100, 0, 13, eyeBlue);

				gl.bindTexture(gl.TEXTURE_2D, texture1);
				gl.drawArrays(gl.TRIANGLES, 0, n_draw);

				break;
		}

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
			case '1':
				projection = 0;
				break;
			case '2':
				projection = 1;
				break;
			case '3':
				projection = 2;
				break;
			case '[':
				eyeRed += 0.1;
				eyeBlue -= 0.1;
				break;
			case ']':
				eyeRed -= 0.1;
				eyeBlue += 0.1;
				break;
		}
	}, false);

	function cube() {

		let points_ = 36;

		var vertices = [
			-0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 0.0, 0.0,
			0.5, -0.5, -0.5, 0.0, 0.0, 1.0, 1.0, 0.0,
			0.5, 0.5, -0.5, 0.0, 1.0, 1.0, 1.0, 1.0,
			0.5, 0.5, -0.5, 0.0, 1.0, 1.0, 1.0, 1.0,
			-0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 1.0,
			-0.5, -0.5, -0.5, 0.0, 0.0, 0.0, 0.0, 0.0,

			-0.5, -0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0,
			0.5, -0.5, 0.5, 1.0, 0.0, 1.0, 1.0, 0.0,
			0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0,
			0.5, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0,
			-0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 0.0, 1.0,
			-0.5, -0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0,

			-0.5, 0.5, 0.5, 1.0, 0.0, 1.0, 0.0, 0.0,
			-0.5, 0.5, -0.5, 1.0, 1.0, 1.0, 1.0, 0.0,
			-0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 1.0,
			-0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 1.0,
			-0.5, -0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 1.0,
			-0.5, 0.5, 0.5, 1.0, 0.0, 1.0, 0.0, 0.0,

			0.5, 0.5, 0.5, 1.0, 0.0, 1.0, 0.0, 0.0,
			0.5, 0.5, -0.5, 1.0, 1.0, 1.0, 1.0, 0.0,
			0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 1.0,
			0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 1.0,
			0.5, -0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 1.0,
			0.5, 0.5, 0.5, 1.0, 0.0, 1.0, 0.0, 0.0,

			-0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 0.0,
			0.5, -0.5, -0.5, 1.0, 1.0, 1.0, 1.0, 0.0,
			0.5, -0.5, 0.5, 1.0, 0.0, 1.0, 1.0, 1.0,
			0.5, -0.5, 0.5, 1.0, 0.0, 1.0, 1.0, 1.0,
			-0.5, -0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 1.0,
			-0.5, -0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 0.0,

			-0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 0.0,
			0.5, 0.5, -0.5, 1.0, 1.0, 1.0, 1.0, 0.0,
			0.5, 0.5, 0.5, 1.0, 0.0, 1.0, 1.0, 1.0,
			0.5, 0.5, 0.5, 1.0, 0.0, 1.0, 1.0, 1.0,
			-0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 1.0,
			-0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 0.0
		];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		n_draw = points_;
	}

	function StereoProjection(_left, _right, _bottom, _top, _near, _far, _zero_plane, _dist, _eye) {
		// Perform the perspective projection for one eye's subfield.
		// The projection is in the direction of the negative z-axis.
		// _left=-6.0;
		// _right=6.0;
		// _bottom=-4.8;
		// _top=4.8;
		// [default: -6.0, 6.0, -4.8, 4.8]
		// left, right, bottom, top = the coordinate range, in the plane of zero parallax setting,
		// which will be displayed on the screen.
		// The ratio between (right-left) and (top-bottom) should equal the aspect
		// ratio of the display.
		// _near=6.0;
		// _far=-20.0;
		// [default: 6.0, -6.0]
		// near, far = the z-coordinate values of the clipping planes.
		// _zero_plane=0.0;
		// [default: 0.0]
		// zero_plane = the z-coordinate of the plane of zero parallax setting.
		// [default: 14.5]
		// _dist=10.5;
		// dist = the distance from the center of projection to the plane of zero parallax.
		// [default: -0.3]
		// _eye=-0.3;
		// eye = half the eye separation; positive for the right eye subfield,
		// negative for the left eye subfield.
		let _dx = _right - _left;
		let _dy = _top - _bottom;
		let _xmid = (_right + _left) / 2.0;
		let _ymid = (_top + _bottom) / 2.0;
		let _clip_near = _dist + _zero_plane - _near;
		let _clip_far = _dist + _zero_plane - _far;
		let _n_over_d = (_clip_near / _dist);
		let _topw = _n_over_d * _dy / 2.0;
		let _bottomw = -_topw;
		let _rightw = _n_over_d * (_dx / 2.0 - _eye);
		let _leftw = _n_over_d * (-_dx / 2.0 - _eye);
		const proj = mat4.create();
		mat4.frustum(proj, _leftw, _rightw, _bottomw, _topw, _clip_near, _clip_far)
		mat4.translate(proj, proj, [-_xmid - _eye, -_ymid, 0]);
		let uniProj = gl.getUniformLocation(program, 'proj');
		gl.uniformMatrix4fv(uniProj, false, proj);
	}
}