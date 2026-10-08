#version 300 es
#define varying in
layout(location = 0) out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
#define texture2D texture
precision highp float;
precision highp int;
#define HIGH_PRECISION

#define SHADER_TYPE ShaderMaterial
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;
// Uniforms
uniform vec3 uColor;
uniform vec3 uBaseColor;

// Varyings
varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  // Blend from the valley colour to the peak colour
  vec3 color = mix(uBaseColor, uColor, smoothstep(0.0, 1.0, vDisplacement));

  // Fresnel rim, strongest where the surface faces away from the camera
  float fresnel = pow(1.0 - clamp(dot(normalize(vViewDir), normalize(vNormal)), 0.0, 1.0), 3.0);

  // Light rim glow tinted towards uColor
  vec3 rimColor = mix(vec3(1.0), uColor, 0.5);
  color += rimColor * fresnel * 0.8;

  gl_FragColor = vec4(color, 1.0);
}
