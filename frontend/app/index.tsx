import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import Svg, { Circle } from 'react-native-svg';

import { getToken, getUserData, clearAuthToken } from '@/utils/authStorage';

// Create animated SVG Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Prevent native splash screen from hiding prematurely
SplashScreen.preventAutoHideAsync().catch(() => {});

const TOTAL_ANIMATION_DURATION = 6000; // 6 seconds
const CIRCLE_RADIUS = 115;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~722.56

export default function SplashScreenComponent() {
  const [progressPercent, setProgressPercent] = useState(0);

  // Core Animations
  const glowAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Staggered Typography Animations
  const word1Anim = useRef(new Animated.Value(0)).current; // College
  const word2Anim = useRef(new Animated.Value(0)).current; // Complaint
  const word3Anim = useRef(new Animated.Value(0)).current; // Management
  const word4Anim = useRef(new Animated.Value(0)).current; // System
  const underline1Anim = useRef(new Animated.Value(0)).current; // Underline for Complaint
  const underline2Anim = useRef(new Animated.Value(0)).current; // Underline for System

  // Progress Bar & Circle Drawing Animation (0 to 1 over 7000ms)
  const progressBarAnim = useRef(new Animated.Value(0)).current;
  const screenFadeAnim = useRef(new Animated.Value(1)).current;

  // Store target route to navigate after animation finishes
  const targetRouteRef = useRef<string>('/login');

  useEffect(() => {
    // Hide native splash screen so custom animation takes over immediately
    SplashScreen.hideAsync().catch(() => {});

    // Start auth verification in background
    checkAuthStatus();

    // 1. Ambient glow pulse
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // 2. Logo entrance (scale 0.6 -> 1.05 -> 1.0)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. Staggered words entrance spread nicely across the 7 seconds
    Animated.sequence([
      Animated.delay(600),
      // College
      Animated.timing(word1Anim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Complaint + underline
      Animated.parallel([
        Animated.timing(word2Anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(underline1Anim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(300),
      // Management
      Animated.timing(word3Anim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // System + underline
      Animated.parallel([
        Animated.timing(word4Anim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(underline2Anim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // 4. Draw Circle & Fill Progress Bar (starts from ONE point at 12 o'clock and completes full circle over 6 seconds)
    Animated.timing(progressBarAnim, {
      toValue: 1,
      duration: TOTAL_ANIMATION_DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        finishSplashAndNavigate();
      }
    });

    // 5. Counter listener from 0% to 100%
    const progressListener = progressBarAnim.addListener(({ value }) => {
      setProgressPercent(Math.min(100, Math.floor(value * 100)));
    });

    return () => {
      progressBarAnim.removeListener(progressListener);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      const user = await getUserData();

      if (!token || !user) {
        targetRouteRef.current = '/login';
        return;
      }

      const role = String(user.role).trim().toUpperCase();
      if (role === 'ADMIN') {
        targetRouteRef.current = '/admin/dashboard';
      } else if (role === 'STUDENT') {
        targetRouteRef.current = '/dashboard';
      } else {
        await clearAuthToken();
        targetRouteRef.current = '/login';
      }
    } catch {
      await clearAuthToken();
      targetRouteRef.current = '/login';
    }
  };

  const finishSplashAndNavigate = () => {
    // Smooth 450ms fade-out transition to target screen
    Animated.timing(screenFadeAnim, {
      toValue: 0,
      duration: 450,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      router.replace(targetRouteRef.current as any);
    });
  };

  // Interpolate circle stroke offset from full circumference (0%) to 0 (100% completed circle)
  const strokeDashoffset = progressBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_CIRCUMFERENCE, 0],
  });

  const progressWidth = progressBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 140],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenFadeAnim }]}>
      {/* 1. Gradient Background */}
      <LinearGradient
        colors={['#EEF5FF', '#FFFFFF', '#F1FAF7']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Unified Hero Area (keeps circle drawing and logo perfectly aligned with no text overlap) */}
      <View style={styles.heroSection}>
        {/* Ambient Radial Glow */}
        <Animated.View
          style={[
            styles.ambientGlow,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.85],
              }),
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.75, 1],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Circular drawing: starts from ONE point (top) and draws progressively until completing the circle */}
        <Svg width={250} height={250} style={styles.svgCircle}>
          {/* Subtle guide background track */}
          <Circle
            cx={125}
            cy={125}
            r={CIRCLE_RADIUS}
            stroke="rgba(27, 95, 196, 0.12)"
            strokeWidth={2}
            fill="transparent"
          />
          {/* Active drawing stroke from 1 single point to full 360 circle */}
          <AnimatedCircle
            cx={125}
            cy={125}
            r={CIRCLE_RADIUS}
            stroke="#1B5FC4"
            strokeWidth={3.5}
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </Svg>

        {/* App Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* 3. Typography (shifted well below heroSection with marginTop: 56 to guarantee zero overlap) */}
      <View style={styles.titleContainer}>
        {/* Row 1: College Complaint */}
        <View style={styles.textRow}>
          <Animated.Text
            style={[
              styles.titleWord,
              {
                opacity: word1Anim,
                transform: [
                  {
                    translateY: word1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            College{' '}
          </Animated.Text>

          <View style={styles.wordWithUnderline}>
            <Animated.Text
              style={[
                styles.titleWord,
                styles.complaintWord,
                {
                  opacity: word2Anim,
                  transform: [
                    {
                      translateY: word2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              Complaint
            </Animated.Text>
            <Animated.View
              style={[
                styles.underline,
                {
                  backgroundColor: '#1B5FC4',
                  width: underline1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Row 2: Management System */}
        <View style={styles.textRow}>
          <Animated.Text
            style={[
              styles.titleWord,
              {
                opacity: word3Anim,
                transform: [
                  {
                    translateY: word3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            Management{' '}
          </Animated.Text>

          <View style={styles.wordWithUnderline}>
            <Animated.Text
              style={[
                styles.titleWord,
                styles.systemWord,
                {
                  opacity: word4Anim,
                  transform: [
                    {
                      translateY: word4Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              System
            </Animated.Text>
            <Animated.View
              style={[
                styles.underline,
                {
                  backgroundColor: '#0B7A68',
                  width: underline2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* 4. Progress Loader & Counter */}
      <View style={styles.loaderContainer}>
        {/* Progress Bar Track */}
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[styles.progressBarFill, { width: progressWidth }]}
          />
        </View>

        {/* Percentage Counter */}
        <Text style={styles.progressText}>{progressPercent}%</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF5FF',
    paddingVertical: 20,
  },
  // Hero section bounds the logo, ambient glow, and drawing circle
  heroSection: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(27, 95, 196, 0.12)',
  },
  // Rotated -90deg so the single drawing point starts precisely at 12 o'clock (the top)
  svgCircle: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  logoContainer: {
    width: 176,
    height: 176,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1B5FC4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 170,
    height: 170,
    borderRadius: 40,
  },
  // Shifted well below the heroSection (marginTop: 56) to guarantee zero overlap with the circular line
  titleContainer: {
    marginTop: 56,
    alignItems: 'center',
    gap: 8,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWord: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F2A5C',
    letterSpacing: -0.4,
  },
  complaintWord: {
    color: '#1B5FC4',
  },
  systemWord: {
    color: '#0B7A68',
  },
  wordWithUnderline: {
    position: 'relative',
  },
  underline: {
    height: 3,
    borderRadius: 2,
    marginTop: 3,
  },
  loaderContainer: {
    marginTop: 54,
    alignItems: 'center',
    gap: 12,
  },
  progressBarTrack: {
    width: 140,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E3E9F3',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#1B5FC4',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5A78',
    letterSpacing: 1,
  },
});
