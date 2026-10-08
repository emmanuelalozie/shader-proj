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
void main() { gl_FragColor = vec4(undefinedThing, 1.0); }
