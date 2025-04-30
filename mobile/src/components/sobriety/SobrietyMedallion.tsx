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
// Use react-native-gcanvas
// @ts-ignore
import {GCanvasView} from '@flyskywhy/react-native-gcanvas'; // Import GCanvasView
// @ts-ignore
import type {GCanvasRef} from '@flyskywhy/react-native-gcanvas'; // Import the ref type (assuming you created gcanvas.d.ts)

// Use core three.js
import * as THREE from 'three';
// Import OrbitControls from examples and rely on the custom declaration file
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

  // *** Adapt the context creation callback for gcanvas ***
  const onCanvasCreate = (canvas: GCanvasRef) => {
    // gcanvas might provide width/height directly on the canvas ref
    const {width, height} = canvas;
    if (!width || !height) {
      console.error('GCanvas dimensions not available immediately');
      // Handle resize or wait if necessary, depending on library behavior
      return;
    }

    // Get the WebGL context from the canvas ref
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('WebGL context creation failed via gcanvas');
      return;
    }

    // --- Three.js Setup (largely the same, but using gcanvas context/canvas) ---
    const renderer = new THREE.WebGLRenderer({
      context: gl as WebGLRenderingContext, // Use the context obtained from gcanvas
      // gcanvas might not expose a direct HTML-like canvas element,
      // pass the ref itself or adjust based on library needs if renderer requires it.
      // If THREE expects a canvas element, this might need adaptation or checks.
      // Sometimes you might not need to pass a canvas if context is provided.
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent background

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2.5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Pass the GCanvasView ref directly if OrbitControls needs a DOM element
    // This might require OrbitControls modifications or checking gcanvas examples
    // For now, let's assume it can work without a DOM element if camera is passed,
    // or requires specific event handling setup with gcanvas.
    // const controls = new OrbitControls(camera, /* Need a DOM element or equivalent listener */);
    // *** OrbitControls might need to be omitted or replaced with manual rotation ***
    // *** if it strictly requires a DOM element that gcanvas doesn't provide easily ***
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.25;
    // controls.enableZoom = false;

    const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(medallionConfig.color),
      metalness: 0.8,
      roughness: 0.2,
    });
    const medallion = new THREE.Mesh(geometry, material);
    medallion.rotation.x = Math.PI / 2;
    scene.add(medallion);

    // --- Animation Loop ---
    const animate = () => {
      // Auto-rotate the medallion (manual rotation)
      medallion.rotation.y += 0.01;

      // controls?.update(); // Update controls if enabled

      renderer.render(scene, camera);

      // gcanvas might handle frame updates differently, check its docs.
      // gl.endFrameEXP?.(); // This was likely specific to react-native-webgl

      requestAnimationFrame(animate); // Use standard RAF
    };

    animate(); // Start the loop
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
              // Keep rotation separate if OrbitControls are disabled
              // {
              //   rotate: rotateAnim.interpolate({
              //     inputRange: [0, 1],
              //     outputRange: ['0deg', '360deg'],
              //   }),
              // },
            ],
            shadowOpacity: glowAnim,
            shadowColor: medallionConfig.color,
          },
        ]}>
        <View style={styles.glViewContainer}>
          {/* *** Use GCanvasView and the new callback prop *** */}
          <GCanvasView
            style={styles.glView}
            onCanvasCreate={onCanvasCreate} // Use the correct prop name
            isGestureResponsible={true} // Example: Enable gestures if needed for OrbitControls later
          />
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
