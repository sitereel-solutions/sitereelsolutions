/* =========================================================
   HEADER SCROLL EFFECT
========================================================= */

const header = document.getElementById("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});


/* =========================================================
   WEBGL SHADER
========================================================= */

const canvas = document.getElementById("shader-canvas");

if (canvas) {

    const gl =
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");


    if (gl) {

        /* -------------------------------------------------
           VERTEX SHADER
        ------------------------------------------------- */

        const vertexShaderSource = `
            attribute vec2 a_position;

            varying vec2 v_texCoord;

            void main() {

                v_texCoord =
                    a_position * 0.5 + 0.5;

                gl_Position =
                    vec4(
                        a_position,
                        0.0,
                        1.0
                    );

            }
        `;


        /* -------------------------------------------------
           FRAGMENT SHADER
        ------------------------------------------------- */

        const fragmentShaderSource = `
            precision highp float;

            varying vec2 v_texCoord;

            uniform float u_time;

            uniform vec2 u_resolution;


            void main() {

                vec2 uv = v_texCoord;


                /* Colors */

                vec3 black =
                    vec3(
                        0.0,
                        0.0,
                        0.0
                    );

                vec3 royalBlue =
                    vec3(
                        0.0,
                        0.18,
                        1.0
                    );

                vec3 skyBlue =
                    vec3(
                        0.0,
                        0.65,
                        1.0
                    );


                /* Organic movement */

                float noise =
                    sin(
                        uv.x * 3.0 +
                        u_time * 0.5
                    )
                    *
                    cos(
                        uv.y * 2.0 +
                        u_time * 0.3
                    );


                float noise2 =
                    sin(
                        uv.y * 4.0 -
                        u_time * 0.4
                    )
                    *
                    cos(
                        uv.x * 2.5 +
                        u_time * 0.6
                    );


                /* Waves */

                float wave =
                    smoothstep(
                        0.3,
                        0.7,
                        0.5 +
                        0.5 *
                        sin(
                            uv.x * 2.0 +
                            uv.y * 1.5 +
                            u_time * 0.2 +
                            noise * 2.0
                        )
                    );


                float wave2 =
                    smoothstep(
                        0.4,
                        0.8,
                        0.5 +
                        0.5 *
                        cos(
                            uv.y * 1.5 -
                            uv.x * 2.0 +
                            u_time * 0.3 +
                            noise2 * 1.5
                        )
                    );


                /* Mix colors */

                vec3 color =
                    mix(
                        black,
                        royalBlue,
                        wave * 0.6
                    );


                color =
                    mix(
                        color,
                        skyBlue,
                        wave2 * 0.4
                    );


                /* Vignette */

                float dist =
                    distance(
                        uv,
                        vec2(0.5)
                    );


                color *=
                    smoothstep(
                        1.2,
                        0.3,
                        dist
                    );


                gl_FragColor =
                    vec4(
                        color,
                        1.0
                    );

            }
        `;


        /* =================================================
           SHADER FUNCTIONS
        ================================================= */

        function createShader(type, source) {

            const shader =
                gl.createShader(type);

            gl.shaderSource(
                shader,
                source
            );

            gl.compileShader(shader);


            if (
                !gl.getShaderParameter(
                    shader,
                    gl.COMPILE_STATUS
                )
            ) {

                console.error(
                    gl.getShaderInfoLog(shader)
                );

                gl.deleteShader(shader);

                return null;
            }

            return shader;
        }


        function createProgram(
            vertexShader,
            fragmentShader
        ) {

            const program =
                gl.createProgram();

            gl.attachShader(
                program,
                vertexShader
            );

            gl.attachShader(
                program,
                fragmentShader
            );

            gl.linkProgram(program);


            if (
                !gl.getProgramParameter(
                    program,
                    gl.LINK_STATUS
                )
            ) {

                console.error(
                    gl.getProgramInfoLog(program)
                );

                return null;
            }

            return program;
        }


        /* =================================================
           CREATE SHADERS
        ================================================= */

        const vertexShader =
            createShader(
                gl.VERTEX_SHADER,
                vertexShaderSource
            );


        const fragmentShader =
            createShader(
                gl.FRAGMENT_SHADER,
                fragmentShaderSource
            );


        if (
            vertexShader &&
            fragmentShader
        ) {

            const program =
                createProgram(
                    vertexShader,
                    fragmentShader
                );


            gl.useProgram(program);


            /* =================================================
               BUFFER
            ================================================= */

            const buffer =
                gl.createBuffer();

            gl.bindBuffer(
                gl.ARRAY_BUFFER,
                buffer
            );


            gl.bufferData(
                gl.ARRAY_BUFFER,

                new Float32Array([
                    -1, -1,
                     1, -1,
                    -1,  1,
                     1,  1
                ]),

                gl.STATIC_DRAW
            );


            /* =================================================
               POSITION ATTRIBUTE
            ================================================= */

            const positionLocation =
                gl.getAttribLocation(
                    program,
                    "a_position"
                );


            gl.enableVertexAttribArray(
                positionLocation
            );


            gl.vertexAttribPointer(
                positionLocation,
                2,
                gl.FLOAT,
                false,
                0,
                0
            );


            /* =================================================
               UNIFORMS
            ================================================= */

            const timeLocation =
                gl.getUniformLocation(
                    program,
                    "u_time"
                );


            const resolutionLocation =
                gl.getUniformLocation(
                    program,
                    "u_resolution"
                );


            const mouseLocation =
                gl.getUniformLocation(
                    program,
                    "u_mouse"
                );


            /* =================================================
               MOUSE
            ================================================= */

            let mouse = {
                x: canvas.width / 2,
                y: canvas.height / 2
            };


            window.addEventListener(
                "mousemove",
                (event) => {

                    const rect =
                        canvas.getBoundingClientRect();


                    if (
                        rect.width &&
                        rect.height
                    ) {

                        const normalizedX =
                            (
                                event.clientX -
                                rect.left
                            ) / rect.width;


                        const normalizedY =
                            1 -
                            (
                                event.clientY -
                                rect.top
                            ) / rect.height;


                        mouse.x =
                            normalizedX *
                            canvas.width;


                        mouse.y =
                            normalizedY *
                            canvas.height;

                    }

                }
            );


            /* =================================================
               CANVAS RESIZE
            ================================================= */

            function resizeCanvas() {

                const width =
                    canvas.clientWidth ||
                    1280;

                const height =
                    canvas.clientHeight ||
                    720;


                if (
                    canvas.width !== width ||
                    canvas.height !== height
                ) {

                    canvas.width = width;
                    canvas.height = height;

                }

            }


            resizeCanvas();


            if (
                typeof ResizeObserver !==
                "undefined"
            ) {

                const resizeObserver =
                    new ResizeObserver(
                        resizeCanvas
                    );

                resizeObserver.observe(canvas);

            }


            /* =================================================
               RENDER LOOP
            ================================================= */

            function render(time) {

                resizeCanvas();


                gl.viewport(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                if (timeLocation) {

                    gl.uniform1f(
                        timeLocation,
                        time * 0.001
                    );

                }


                if (resolutionLocation) {

                    gl.uniform2f(
                        resolutionLocation,
                        canvas.width,
                        canvas.height
                    );

                }


                if (mouseLocation) {

                    gl.uniform2f(
                        mouseLocation,
                        mouse.x,
                        mouse.y
                    );

                }


                gl.drawArrays(
                    gl.TRIANGLE_STRIP,
                    0,
                    4
                );


                requestAnimationFrame(render);

            }


            requestAnimationFrame(render);

        }

    } else {

        console.warn(
            "WebGL is not supported by this browser."
        );

    }

}

/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const menuToggle = document.getElementById("menuToggle");
const navigation = document.querySelector(".navigation");


menuToggle.addEventListener("click", () => {

    navigation.classList.toggle("open");

    menuToggle.classList.toggle("active");

});


/* =========================================================
   CLOSE MENU WHEN A LINK IS CLICKED
========================================================= */

const navLinks =
    document.querySelectorAll(".nav-link");


navLinks.forEach((link) => {

    link.addEventListener("click", () => {

        navigation.classList.remove("open");

        menuToggle.classList.remove("active");

    });

});

/* =========================================================
   Our Services
========================================================= */

(function () {
    const section = document.getElementById("our-services");
    if (!section) return;
 
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealEls = section.querySelectorAll(".reveal");
 
    // apply stagger delay from data-delay
    revealEls.forEach((el) => {
        el.style.setProperty("--d", el.dataset.delay || 0);
    });
 
    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealEls.forEach((el) => el.classList.add("in-view"));
        return;
    }
 
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
 
    revealEls.forEach((el) => io.observe(el));
})();

/* =====================================================================
   ABOUT US SECTION — JS
   Paste this into script.js
   Handles: staggered slide-in-from-sides reveal for .about-reveal elements
===================================================================== */

(function () {
    const section = document.getElementById("about-us");
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealEls = section.querySelectorAll(".about-reveal");

    revealEls.forEach((el) => {
        el.style.setProperty("--d", el.dataset.delay || 0);
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealEls.forEach((el) => el.classList.add("in-view"));
        return;
    }

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    io.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach((el) => io.observe(el));
})();