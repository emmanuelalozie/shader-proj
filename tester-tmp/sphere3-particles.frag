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
uniform float uOpacity;

// Varyings
varying float vAlpha;

void main() {
  // Soft round point: cut the square corners, fade towards the edge
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;
  float strength = pow(1.0 - d * 2.0, 2.0);

  // Tinted by the sphere colour, with a whiter core
  vec3 color = mix(uColor, vec3(1.0), strength * 0.4);

  gl_FragColor = vec4(color, strength * vAlpha * uOpacity);
}
