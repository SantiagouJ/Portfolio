"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const vertexShader = /* glsl */ `
  attribute vec2 aPosition;
  attribute vec2 aUv;
  varying vec2 vUv;
  void main() {
    vUv = aUv;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float time;
  uniform float u_apparition;
  uniform float u_noise_granularity;
  uniform float u_noise_1_scale;
  uniform float u_noise_2_scale;
  uniform float u_noise_force;
  uniform vec3 u_color;
  uniform vec2 resolution;
  uniform vec2 mouse;

  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
  vec2 fade(vec2 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}

  float cnoise(vec2 P){
    vec4 Pi=floor(P.xyxy)+vec4(0.0,0.0,1.0,1.0);
    vec4 Pf=fract(P.xyxy)-vec4(0.0,0.0,1.0,1.0);
    Pi=mod(Pi,289.0);
    vec4 ix=Pi.xzxz;
    vec4 iy=Pi.yyww;
    vec4 fx=Pf.xzxz;
    vec4 fy=Pf.yyww;
    vec4 i=permute(permute(ix)+iy);
    vec4 gx=2.0*fract(i*0.0243902439)-1.0;
    vec4 gy=abs(gx)-0.5;
    vec4 tx=floor(gx+0.5);
    gx=gx-tx;
    vec2 g00=vec2(gx.x,gy.x);
    vec2 g10=vec2(gx.y,gy.y);
    vec2 g01=vec2(gx.z,gy.z);
    vec2 g11=vec2(gx.w,gy.w);
    vec4 norm=1.79284291400159-0.85373472095314*vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11));
    g00*=norm.x; g01*=norm.y; g10*=norm.z; g11*=norm.w;
    float n00=dot(g00,vec2(fx.x,fy.x));
    float n10=dot(g10,vec2(fx.y,fy.y));
    float n01=dot(g01,vec2(fx.z,fy.z));
    float n11=dot(g11,vec2(fx.w,fy.w));
    vec2 fade_xy=fade(Pf.xy);
    vec2 n_x=mix(vec2(n00,n01),vec2(n10,n11),fade_xy.x);
    float n_xy=mix(n_x.x,n_x.y,fade_xy.y);
    return 2.3*n_xy;
  }

  vec2 pixelate(vec2 uv, float granularity){
    float x=granularity/resolution.x;
    float y=granularity/resolution.y;
    vec4 d=vec4(x,y,1./x,1./y);
    return d.xy*(floor(uv*d.zw)+0.5);
  }

  void main(){
    float screenAspect=resolution.y/resolution.x;
    vec2 uv=vUv;
    vec2 mouse1=mouse;
    if(screenAspect<1.0){
      uv.y=(uv.y-0.5)*screenAspect+0.5;
      mouse1.y*=screenAspect;
    }else{
      uv.x=(uv.x-0.5)/screenAspect+0.5;
      mouse1.x/=screenAspect;
    }
    float t=time/100.0;
    vec2 noise1PixelatedUV=pixelate(uv*u_noise_1_scale,u_noise_granularity);
    vec2 noise2PixelatedUV=pixelate(uv*u_noise_2_scale,u_noise_granularity);
    vec2 st=(noise1PixelatedUV/5.0)-mouse1/2.0;
    st=st*2.0-1.0;
    float dist=length(st);
    float gradientFactor=smoothstep(u_apparition*2.0-0.55,u_apparition*2.0,dist);
    float circleAppear=1.0-min(max(0.0,gradientFactor),1.0);
    float reveal=-1.0+circleAppear*2.0;
    float noise1=cnoise(vec2(noise1PixelatedUV+t))/2.0*u_noise_force;
    float noise2=cnoise(vec2(noise2PixelatedUV-t))/2.0*u_noise_force;
    float curtainValue=min(1.0,ceil(noise1+noise2-reveal));
    float mask=u_apparition<0.01 ? 0.0 : max(0.0,min(1.0,curtainValue));
    gl_FragColor=mix(vec4(0.0),vec4(u_color,1.0),mask);
  }
`;

function clampedMap(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + (outMax - outMin) * t;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function PixelReveal() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const reduce = document.documentElement.classList.contains("reduce-motion");
    if (!root || !canvas || reduce) {
      document.documentElement.classList.remove("is-pixel-reveal");
      setGone(true);
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      depth: false,
      stencil: false,
    });

    const finish = () => {
      document.documentElement.classList.remove("is-pixel-reveal");
      window.dispatchEvent(new Event("pixel-reveal-done"));
      setGone(true);
    };

    if (!gl) {
      finish();
      return;
    }

    const vert = compile(gl, gl.VERTEX_SHADER, vertexShader);
    const frag = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vert || !frag) {
      finish();
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      finish();
      return;
    }
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.bindAttribLocation(program, 0, "aPosition");
    gl.bindAttribLocation(program, 1, "aUv");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      finish();
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 0, 0,
        1, -1, 1, 0,
        -1, 1, 0, 1,
        1, 1, 1, 1,
      ]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255]),
    );

    const darkPage = document.documentElement.dataset.mode === "dev";
    const color = darkPage ? [1, 1, 1] : [0, 0, 0];

    const loc = {
      time: gl.getUniformLocation(program, "time"),
      apparition: gl.getUniformLocation(program, "u_apparition"),
      granularity: gl.getUniformLocation(program, "u_noise_granularity"),
      scale1: gl.getUniformLocation(program, "u_noise_1_scale"),
      scale2: gl.getUniformLocation(program, "u_noise_2_scale"),
      force: gl.getUniformLocation(program, "u_noise_force"),
      color: gl.getUniformLocation(program, "u_color"),
      resolution: gl.getUniformLocation(program, "resolution"),
      mouse: gl.getUniformLocation(program, "mouse"),
    };

    gl.uniform1f(loc.granularity, 100);
    gl.uniform1f(loc.scale1, 5);
    gl.uniform1f(loc.scale2, 5);
    gl.uniform3f(loc.color, color[0], color[1], color[2]);

    const pointer = { x: 0.5, y: 0.5 };
    const mouse = { x: 0, y: 0 };
    const apparition = { value: 0.02 };
    const clock = { value: Math.random() * 1000 };
    let frame = 0;

    const resize = () => {
      const ratio = 0.75;
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      resize();
      const targetX = pointer.x + (0.5 - pointer.x) * apparition.value;
      const targetY = pointer.y + (0.5 - pointer.y) * apparition.value;
      mouse.x += (targetX * 2 - 1 - mouse.x) * 0.1;
      mouse.y += (1 - targetY * 2 - mouse.y) * 0.1;
      gl.uniform1f(loc.time, clock.value);
      gl.uniform1f(loc.apparition, apparition.value);
      gl.uniform1f(loc.force, clampedMap(apparition.value, 0.15, 0.4, 0, 1));
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform2f(loc.mouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (frame === 0) root.classList.add("is-ready");
      frame += 1;
    };

    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
    };

    resize();
    draw();

    let finished = false;
    const complete = () => {
      if (finished) return;
      finished = true;
      finish();
    };

    const tween = gsap.to(apparition, {
      value: 1,
      duration: 1.3,
      delay: 0.1,
      ease: "power1.in",
      onUpdate: draw,
      onComplete: complete,
    });

    const clockTween = gsap.to(clock, {
      value: clock.value + 90,
      duration: 1.5,
      ease: "none",
    });

    const safety = window.setTimeout(complete, 3200);
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      finished = true;
      tween.kill();
      clockTween.kill();
      window.clearTimeout(safety);
      window.removeEventListener("pointermove", onPointer);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={rootRef} className="pixel-reveal" aria-hidden="true">
      <div className="pixel-reveal-fallback" />
      <canvas ref={canvasRef} />
    </div>
  );
}
