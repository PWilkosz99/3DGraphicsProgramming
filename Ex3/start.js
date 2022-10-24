function start() {
	/** @type {HTMLCanvasElement} */
	const canvas = document.getElementById("my_canvas");
	//Inicialize the GL contex
	const gl = canvas.getContext("webgl2");
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
			gl_Position = proj*view*model*vec4(position, 1.0);
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
			frag_color = mix(texture(texture1, TexCoord),texture(texture2, TexCoord),0.5);
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

	var n_draw = 36;
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
		console.log(pressedKey)
		let cameraSpeed = 0.002 * elapsedTime;

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
	gl.texImage2D(gl.TEXTURE_2D, level2, internalFormat2,
		width2, height2, border2, srcFormat2, srcType2,
		pixel2);
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
	image2.src = "https://images.pexels.com/photos/866351/pexels-photo-866351.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260";

	//gl.uniform1i(gl.getUniformLocation(program, "texture1"), 0);
	gl.uniform1i(gl.getUniformLocation(program, "texture2"), 1);

	//-----------------------------------------------------------------------------------------------

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

		gl.bindTexture(gl.TEXTURE_2D, texture1);
		gl.drawArrays(gl.TRIANGLES, 0, 36);

		//2
		// gl.bindTexture(gl.TEXTURE_2D, texture1);
		// gl.drawArrays(gl.TRIANGLES, 0, 18);

		// gl.bindTexture(gl.TEXTURE_2D, texture2);
		// gl.drawArrays(gl.TRIANGLES, 18, 18)

		//3
		// gl.activeTexture(gl.TEXTURE0);
		// gl.bindTexture(gl.TEXTURE_2D, texture1);
		// gl.activeTexture(gl.TEXTURE1);
		// gl.bindTexture(gl.TEXTURE_2D, texture2);

		gl.drawArrays(gl.TRIANGLES, 0, n_draw);
		//window.requestAnimationFrame(draw);
		const FPS = 30;
		setTimeout(() => { requestAnimationFrame(draw); }, 1000 / FPS);
	}

	//Add the event listeners for keydown, keyup
	window.addEventListener('keydown', function (event) {
		if (event.keyCode === 90) {
			// Z - bufor ----------
			if (gl.isEnabled(gl.DEPTH_TEST)) {
				gl.disable(gl.DEPTH_TEST);
			}
			else {
				gl.enable(gl.DEPTH_TEST);
			}
		} else if (event.keyCode === 27) {
			if (confirm("Close Window?")) {
				close();
			}
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

}