#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uPointerDiff;



float isGridLine(vec2 coord) {
  vec2 pixelsPerGrid = vec2(50.);
  vec2 gridCoords = fract(coord/pixelsPerGrid);
  vec2 gridPixelCoords = gridCoords * pixelsPerGrid;
  vec2 gridLine = step(gridPixelCoords, vec2(1.));
  float isGridLine = max(gridLine.x, gridLine.y);
  return isGridLine;
}

void main() {
  vec2 coord = gl_FragCoord.xy - uPointerDiff;

  vec3 color = vec3(0.);

  color += isGridLine(coord) * 0.9;

  gl_FragColor = vec4(color, 1.);
}