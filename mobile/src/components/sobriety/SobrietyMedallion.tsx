import React, {useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Text,
  Platform,
} from 'react-native';
// Use react-native-webgl for WebGL context
import {WebGLView, WebGLObject} from 'react-native-webgl';
// Use core three.js
import * as THREE from 'three';
// Import OrbitControls from examples and rely on the custom declaration file
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
// Note: For actual model loading, you'd need setup for GLTFLoader
// from 'three/examples/jsm/loaders/GLTFLoader' and asset loading.

interface SobrietyMedallionProps {
  sobrietyDays: number;
  milestone: string;
  onPress?: () => void;
  isNewMilestone?: boolean;
}

// Define milestone thresholds and colors
const MILESTONE_CONFIGS = {
  '1day': {
    color: '#CD7F32', // Bronze
    model: 'sobriety_chip_1day',
    text: '24 Hours',
  },
  '30days': {
    color: '#CD7F32', // Bronze
    model: 'sobriety_chip_30days',
    text: '30 Days',
  },
  '60days': {
    color: '#C0C0C0', // Silver
    model: 'sobriety_chip_60days',
    text: '60 Days',
  },
  '90days': {
    color: '#C0C0C0', // Silver
    model: 'sobriety_chip_90days',
    text: '90 Days',
  },
  '6months': {
    color: '#FFD700', // Gold
    model: 'sobriety_chip_6months',
    text: '6 Months',
  },
  '1year': {
    color: '#FFD700', // Gold
    model: 'sobriety_chip_1year',
    text: '1 Year',
  },
  '18months': {
    color: '#FFD700', // Gold
    model: 'sobriety_chip_18months',
    text: '18 Months',
  },
  '2years': {
    color: '#B9F2FF', // Platinum
    model: 'sobriety_chip_2years',
    text: '2 Years',
  },
  '3years': {
    color: '#B9F2FF', // Platinum
    model: 'sobriety_chip_3years',
    text: '3 Years',
  },
  '4years': {
    color: '#E5E4E2', // Platinum
    model: 'sobriety_chip_4years',
    text: '4 Years',
  },
  '5years': {
    color: '#50C878', // Emerald
    model: 'sobriety_chip_5years',
    text: '5 Years',
  },
};

const SobrietyMedallion: React.FC<SobrietyMedallionProps> = ({
  sobrietyDays,
  milestone,
  onPress,
  isNewMilestone = false,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.2)).current;

  // Fallback to simple rendering if milestone is not found
  const medallionConfig = MILESTONE_CONFIGS[
    milestone as keyof typeof MILESTONE_CONFIGS
  ] || {
    color: '#CD7F32',
    model: 'sobriety_chip_default',
    text: `${sobrietyDays} Days`,
  };

  useEffect(() => {
    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
    ).start();

    // If it's a new milestone, add celebration animations
    if (isNewMilestone) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.2,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isNewMilestone]);

  // Modified onContextCreate for react-native-webgl
  const onContextCreate = async (gl: WebGLObject) => {
    // Check if gl context is valid
    if (!gl || !gl.getContext) {
      console.error('WebGL context creation failed');
      return;
    }

    const {drawingBufferWidth: width, drawingBufferHeight: height} = gl;

    // Create a three.js renderer using the WebGL context
    const renderer = new THREE.WebGLRenderer({
      context: gl as any,
      canvas: gl.canvas,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    // Create a scene
    const scene = new THREE.Scene();

    // Create a camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2.5;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // OrbitControls setup
    // Use type assertion if direct import doesn't work
    const controls = new (OrbitControls as any)(camera, gl.canvas as any);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;

    // Create a medallion (coin) geometry
    const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);

    // Create a material for the medallion using the milestone color
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(medallionConfig.color),
      metalness: 0.8,
      roughness: 0.2,
    });

    // Create the medallion mesh
    const medallion = new THREE.Mesh(geometry, material);

    // Rotate to show the face
    medallion.rotation.x = Math.PI / 2;

    // Add the medallion to the scene
    scene.add(medallion);

    // Animation loop
    let lastFrameTime = 0;
    const render = (time: number) => {
      const delta = time - lastFrameTime;
      lastFrameTime = time;

      // Auto-rotate the medallion
      medallion.rotation.y += 0.001 * delta;

      // Update controls
      controls.update();

      // Render the scene
      renderer.render(scene, camera);

      // Ensure frame is flushed
      gl.endFrameEXP?.(); // Use optional chaining if method might not exist
    };

    // Start the animation loop
    requestAnimationFrame(render);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.container}>
      <Animated.View
        style={[
          styles.medallionContainer,
          {
            transform: [
              {scale: scaleAnim},
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            shadowOpacity: glowAnim,
            shadowColor: medallionConfig.color,
          },
        ]}>
        <View style={styles.glViewContainer}>
          <WebGLView style={styles.glView} onContextCreate={onContextCreate} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  medallionContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 15,
    elevation: 10,
    backgroundColor: 'transparent',
  },
  glViewContainer: {
    flex: 1,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  glView: {
    flex: 1,
  },
});

export default SobrietyMedallion;
