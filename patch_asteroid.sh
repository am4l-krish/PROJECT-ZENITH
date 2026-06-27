#!/bin/bash

# ============================================================
# Asteroid Monitor Patcher
# Run from the folder containing AsteroidMonitor.jsx:
#   bash patch_asteroid.sh
# ============================================================

FILE="AsteroidMonitor.jsx"

if [ ! -f "$FILE" ]; then
  echo "❌ ERROR: $FILE not found in current directory."
  echo "   cd into the folder containing AsteroidMonitor.jsx first."
  exit 1
fi

echo "🛠  Backing up original → AsteroidMonitor.jsx.bak"
cp "$FILE" "${FILE}.bak"

# ------------------------------------------------------------------
# 1. HOLOGRAPHIC EARTH — replace MeshPhongMaterial with ShaderMaterial
# ------------------------------------------------------------------
echo "🌍 Applying holographic Earth..."

python3 - <<'PYEOF'
import re

with open("AsteroidMonitor.jsx", "r") as f:
    src = f.read()

old_earth = """  const dayTex = makeEarthDayTexture()
  const nightTex = makeEarthNightTexture()
  const earthGeo = new THREE.SphereGeometry(1.8, 64, 64)
  const earthMat = new THREE.MeshPhongMaterial({
    map: dayTex,
    emissiveMap: nightTex,
    emissive: 0xffffff,
    emissiveIntensity: 1.1,
    specular: 0x112244,
    shininess: 12,
  })
  const earth = new THREE.Mesh(earthGeo, earthMat)
  earthGroup.add(earth)

  // Cloud layer — slightly larger radius, rotates independently
  const cloudGeo = new THREE.SphereGeometry(1.83, 64, 64)
  const cloudMat = new THREE.MeshLambertMaterial({
    map: makeCloudTexture(),
    transparent: true,
    depthWrite: false,
  })
  const clouds = new THREE.Mesh(cloudGeo, cloudMat)
  earthGroup.add(clouds)"""

new_earth = """  const earthGeo = new THREE.SphereGeometry(1.8, 64, 64)
  const earthMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      uniform float time;
      void main() {
        float grid = step(0.96, fract(vUv.x * 32.0)) + step(0.96, fract(vUv.y * 16.0));
        float rim = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 1.8);
        float scan = step(0.96, fract(vUv.y * 60.0 + time * 0.4));
        float pulse = 0.5 + 0.5 * sin(time * 1.5);
        vec3 col = vec3(0.0, 0.9, 1.0) * (grid * 0.9 + rim * 0.7 + scan * 0.4 + 0.05);
        col += vec3(0.0, 0.3, 0.6) * pulse * 0.08;
        gl_FragColor = vec4(col, grid * 0.85 + rim * 0.65 + 0.08);
      }`,
    transparent: true,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const earth = new THREE.Mesh(earthGeo, earthMat)
  earthGroup.add(earth)"""

if old_earth in src:
    src = src.replace(old_earth, new_earth)
    print("  ✅ Holographic Earth material applied")
else:
    print("  ⚠️  Could not find Earth material block — skipping (may already be patched)")

with open("AsteroidMonitor.jsx", "w") as f:
    f.write(src)
PYEOF

# ------------------------------------------------------------------
# 2. Remove clouds from buildScene return
# ------------------------------------------------------------------
echo "☁️  Removing clouds from return value..."
sed -i "s/return { scene, camera, renderer, earth, clouds }/return { scene, camera, renderer, earth }/" "$FILE"
echo "  ✅ Done"

# ------------------------------------------------------------------
# 3. Remove clouds.rotation line from animate loop
# ------------------------------------------------------------------
echo "🔄 Removing clouds animation..."
sed -i "/clouds\.rotation\.y += 0\.0013/d" "$FILE"
echo "  ✅ Done"

# ------------------------------------------------------------------
# 4. Animate hologram — add time uniform update after earth.rotation.y
# ------------------------------------------------------------------
echo "⏱  Adding hologram time animation..."
sed -i "s/earth\.rotation\.y += 0\.0008/earth.rotation.y += 0.0008\n      if (earth.material.uniforms) earth.material.uniforms.time.value += delta/" "$FILE"
echo "  ✅ Done"

# ------------------------------------------------------------------
# 5. BIGGER ASTEROIDS — base geometry radius
# ------------------------------------------------------------------
echo "🪨 Making asteroids bigger (geometry)..."
sed -i "s/const geo = new THREE\.IcosahedronGeometry(0\.07, 3)/const geo = new THREE.IcosahedronGeometry(0.18, 3)/" "$FILE"
echo "  ✅ Done"

# ------------------------------------------------------------------
# 6. BIGGER ASTEROIDS — scale clamp
# ------------------------------------------------------------------
echo "📐 Increasing asteroid scale range..."
sed -i "s/const scale = THREE\.MathUtils\.clamp(diameterM \/ 900, 0\.55, 2\.6)/const scale = THREE.MathUtils.clamp(diameterM \/ 900, 1.4, 5.0)/" "$FILE"
echo "  ✅ Done"

# ------------------------------------------------------------------
# 7. REMOVE DOTTED ORBIT LINES — make invisible
# ------------------------------------------------------------------
echo "🚫 Removing dotted orbit lines..."
sed -i "s/const mat = new THREE\.LineDashedMaterial({ color, transparent: true, opacity: 0\.16, dashSize: 0\.06, gapSize: 0\.08 })/const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.0 })/" "$FILE"
echo "  ✅ Done"

# ------------------------------------------------------------------
# 8. LONGER TRAILS — increase trail history from 22 to 65
# ------------------------------------------------------------------
echo "✨ Extending asteroid trails..."
sed -i "s/if (obj\.trailPts\.length > 22) obj\.trailPts\.shift()/if (obj.trailPts.length > 65) obj.trailPts.shift()/" "$FILE"
echo "  ✅ Done"

# ------------------------------------------------------------------
# 9. BRIGHTER TRAILS — increase opacity from 0.5 to 0.9
# ------------------------------------------------------------------
echo "💫 Brightening asteroid trails..."
sed -i "s/new THREE\.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0\.5 })/new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 })/" "$FILE"
echo "  ✅ Done"

echo ""
echo "✅ All patches applied to $FILE"
echo "   Original saved as ${FILE}.bak"
echo ""
echo "👉 Restart your dev server to see the changes!"
