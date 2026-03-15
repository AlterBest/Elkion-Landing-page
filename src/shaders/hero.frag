precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA; // Deep Navy
uniform vec3 uColorB; // Indigo/Blue
uniform vec3 uAccent; // Light Accent

varying vec2 vUv;

#include "/node_modules/lygia/generative/cnoise.glsl"
#include "/node_modules/lygia/generative/fbm.glsl"

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float starLayer(vec2 uv, float density, float size, float twinkleSpeed) {
  vec2 grid = uv * density;
  vec2 cell = floor(grid);
  vec2 jitter = vec2(hash(cell + 1.7), hash(cell + 8.3)) - 0.5;
  vec2 f = fract(grid) - 0.5 + jitter * 0.35;
  float rnd = hash(cell);
  
  float star = smoothstep(1.0 - size, 1.0, rnd);
  float dist = length(f);
  float core = exp(-dist * dist * 80.0);
  float halo = exp(-dist * dist * 12.0) * 0.3;
  
  float speed = twinkleSpeed * (0.5 + rnd * 0.5);
  float twinkle = 0.6 + 0.4 * sin(uTime * speed + rnd * 6.28);
  
  return star * (core + halo) * twinkle;
}



void main() {
  vec2 st = vUv;
  vec2 uv = st * 2.0 - 1.0;
  uv.x *= uResolution.x / max(uResolution.y, 1.0);

  // Use the raw elapsed time for the noise
  float t = uTime;

  // 1. Deep Blue Starry Sky
  vec3 skyBottom = vec3(0.04, 0.12, 0.30); // Atmospheric blue horizon
  vec3 skyTop = vec3(0.002, 0.005, 0.03);  // Deep space black/navy
  vec3 skyColor = mix(skyBottom, skyTop, smoothstep(-0.5, 0.8, uv.y));
  
  // Stars
  float stars = 0.0;
  stars += starLayer(uv * 1.5, 80.0, 0.04, 0.8);
  stars += starLayer(uv * 2.5 + vec2(1.0), 120.0, 0.025, 1.2) * 0.6;
  stars += starLayer(uv * 4.0 - vec2(0.5), 200.0, 0.015, 1.5) * 0.4;
  
  vec3 color = skyColor + stars * 1.5;

  // 2. Random Scattered Scattered Clouds (Multi-scale)
  vec2 cloudUV = uv;
  
  // Layer 1: Large, slow distinct clouds
  vec2 largeUV = cloudUV * 1.2;
  // Move X negatively to make clouds drift from left-to-right
  vec2 motionLarge = vec2(-t * 0.02, t * 0.002);
  
  float largeNoise = fbm(largeUV + motionLarge);
  float largeDetail = fbm(cloudUV * 4.0 - motionLarge * 1.5) * 0.4;
  float largeDensity = largeNoise - largeDetail;
  
  // High threshold to ensure they only form distinct scattered blobs, not full fog
  float largeMask = smoothstep(0.45, 0.8, largeDensity);
  
  // Layer 2: Smaller, faster wisps
  vec2 smallUV = cloudUV * 3.0;
  // Faster left-to-right movement for small wisps
  vec2 motionSmall = vec2(-t * 0.04, t * 0.005);
  
  float smallNoise = fbm(smallUV + motionSmall);
  float smallDetail = fbm(cloudUV * 8.0 + motionSmall * 0.5) * 0.3;
  float smallDensity = smallNoise - smallDetail;
  
  // Even tighter threshold for small scattered patches
  float smallMask = smoothstep(0.5, 0.75, smallDensity);
  
  // Combine masks
  float cloudMask = max(largeMask, smallMask);
  
  // Cloud Colors (Atmospheric blending)
  vec3 cloudLight = vec3(0.85, 0.9, 0.95); // Light grey/white highlight
  vec3 cloudDark = mix(uColorB, vec3(0.1, 0.15, 0.25), 0.7); // Dark indigo shadow
  
  // Light scattering (lit from top-right)
  vec2 lightDir = normalize(vec2(1.0, 1.0)) * 0.04;
  float densityAtLightLarge = fbm(largeUV + motionLarge + lightDir) - largeDetail;
  float densityAtLightSmall = fbm(smallUV + motionSmall + lightDir) - smallDetail;
  
  // Compute lighting
  float litLarge = smoothstep(-0.1, 0.2, largeDensity - densityAtLightLarge);
  float litSmall = smoothstep(-0.1, 0.1, smallDensity - densityAtLightSmall);
  
  // Mix light factors based on which cloud is prominent
  float lit = mix(litLarge, litSmall, smallMask);
  
  vec3 cloudColor = mix(cloudDark, cloudLight, lit);
  
  // Blend over sky (opacity 0.85 for slight transparency)
  color = mix(color, cloudColor, cloudMask * 0.85);


  gl_FragColor = vec4(color, 1.0);
}

