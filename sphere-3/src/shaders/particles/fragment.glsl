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
