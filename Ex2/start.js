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
			precision highp float;
			in vec3 position;
			in vec3 color;
			uniform mat4 model;
			uniform mat4 view;
			uniform mat4 proj;
			
			out vec3 Color;

			void main(void)
			{
				Color = color;
				gl_Position = proj * view * model * vec4(position, 1.0);
			}
			`;

	const fsSource =
		`#version 300 es
		   precision highp float;
		   in vec3 Color;

		   out vec4 frag_color;
		   void main(void)
			{
				frag_color = vec4(Color, 1.0);
				//frag_color = vec4(1.0, 0.5, 0.25, 1.0);
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
	gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 6 * 4, 0);

	const colorAttrib = gl.getAttribLocation(program, "color");
	gl.enableVertexAttribArray(colorAttrib);
	gl.vertexAttribPointer(colorAttrib, 3, gl.FLOAT, false, 6 * 4, 3 * 4);

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
		gl.drawArrays(gl.TRIANGLES, 0, n_draw);
		//window.requestAnimationFrame(draw);
		const FPS = 30;
		setTimeout(() => {
		  requestAnimationFrame(draw);
		}, 1000 / FPS);
	  }

	// Add the event listeners for mousedown, mousemove, and mouseup
	// window.addEventListener('mousedown', e => {
	// 	x = e.offsetX;
	// 	y = e.offsetY;
	// 	alert("x =" + x);
	// 	alert("y =" + y);
	// });

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
			-0.5, -0.5, -0.5, 0.0, 0.0, 0.0,
			0.5, -0.5, -0.5, 0.0, 0.0, 1.0,
			0.5, 0.5, -0.5, 0.0, 1.0, 1.0,
			0.5, 0.5, -0.5, 0.0, 1.0, 1.0,
			-0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
			-0.5, -0.5, -0.5, 0.0, 0.0, 0.0,

			-0.5, -0.5, 0.5, 0.0, 0.0, 0.0,
			0.5, -0.5, 0.5, 1.0, 0.0, 1.0,
			0.5, 0.5, 0.5, 1.0, 1.0, 1.0,
			0.5, 0.5, 0.5, 1.0, 1.0, 1.0,
			-0.5, 0.5, 0.5, 0.0, 1.0, 0.0,
			-0.5, -0.5, 0.5, 0.0, 0.0, 0.0,

			-0.5, 0.5, 0.5, 1.0, 0.0, 1.0,
			-0.5, 0.5, -0.5, 1.0, 1.0, 1.0,
			-0.5, -0.5, -0.5, 0.0, 1.0, 0.0,
			-0.5, -0.5, -0.5, 0.0, 1.0, 0.0,
			-0.5, -0.5, 0.5, 0.0, 0.0, 0.0,
			-0.5, 0.5, 0.5, 1.0, 0.0, 1.0,

			0.5, 0.5, 0.5, 1.0, 0.0, 1.0,
			0.5, 0.5, -0.5, 1.0, 1.0, 1.0,
			0.5, -0.5, -0.5, 0.0, 1.0, 0.0,
			0.5, -0.5, -0.5, 0.0, 1.0, 0.0,
			0.5, -0.5, 0.5, 0.0, 0.0, 0.0,
			0.5, 0.5, 0.5, 1.0, 0.0, 1.0,

			-0.5, -0.5, -0.5, 0.0, 1.0, 0.0,
			0.5, -0.5, -0.5, 1.0, 1.0, 1.0,
			0.5, -0.5, 0.5, 1.0, 0.0, 1.0,
			0.5, -0.5, 0.5, 1.0, 0.0, 1.0,
			-0.5, -0.5, 0.5, 0.0, 0.0, 0.0,
			-0.5, -0.5, -0.5, 0.0, 1.0, 0.0,

			-0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
			0.5, 0.5, -0.5, 1.0, 1.0, 1.0,
			0.5, 0.5, 0.5, 1.0, 0.0, 1.0,
			0.5, 0.5, 0.5, 1.0, 0.0, 1.0,
			-0.5, 0.5, 0.5, 0.0, 0.0, 0.0,
			-0.5, 0.5, -0.5, 0.0, 1.0, 0.0
		];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


		n_draw = points_;
	}

}