import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';

import { getToken, getUserData, clearAuthToken } from '@/utils/authStorage';

// Prevent native splash screen from hiding prematurely
SplashScreen.preventAutoHideAsync().catch(() => {});

const { width } = Dimensions.get('window');

export default function SplashScreenComponent() {
  const [progressPercent, setProgressPercent] = useState(0);

  // Animations
  const glowAnim = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Words animations
  const word1Anim = useRef(new Animated.Value(0)).current; // College
  const word2Anim = useRef(new Animated.Value(0)).current; // Complaint
  const word3Anim = useRef(new Animated.Value(0)).current; // Management
  const word4Anim = useRef(new Animated.Value(0)).current; // System
  const underline1Anim = useRef(new Animated.Value(0)).current; // Underline for Complaint
  const underline2Anim = useRef(new Animated.Value(0)).current; // Underline for System

  // Progress bar animation
  const progressBarAnim = useRef(new Animated.Value(0)).current;
  const screenFadeAnim = useRef(new Animated.Value(1)).current;

  // Store target route to navigate after animation finishes
  const targetRouteRef = useRef<string>('/login');

  useEffect(() => {
    // Hide native splash screen so custom animation takes over immediately
    SplashScreen.hideAsync().catch(() => {});

    // Start auth verification in background
    checkAuthStatus();

    // 1. Continuous ring rotation
    Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Ambient glow pulse
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // 3. Ring fade in
    Animated.timing(ringOpacity, {
      toValue: 1,
      duration: 600,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // 4. Logo entrance (scale 0.6 -> 1.04 -> 1.0)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 5. Staggered words entrance
    Animated.sequence([
      Animated.delay(350),
      // College
      Animated.timing(word1Anim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Complaint + underline
      Animated.parallel([
        Animated.timing(word2Anim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(underline1Anim, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
      // Management
      Animated.timing(word3Anim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // System + underline
      Animated.parallel([
        Animated.timing(word4Anim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(underline2Anim, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // 6. Progress bar (0% -> 100% over 2.6s)
    const totalDuration = 2600;
    Animated.timing(progressBarAnim, {
      toValue: 1,
      duration: totalDuration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        finishSplashAndNavigate();
      }
    });

    // 7. Counter listener from 0% to 100%
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
    // Fade out and smoothly replace route
    Animated.timing(screenFadeAnim, {
      toValue: 0,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      router.replace(targetRouteRef.current as any);
    });
  };

  // Interpolations
  const spinInterpolation = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseSpinInterpolation = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
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

      {/* 2. Ambient Radial Glow */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.9],
            }),
            transform: [
              {
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
              },
            ],
          },
        ]}
      />

      {/* 3. Orbiting Dual Ring */}
      <Animated.View
        style={[
          styles.ringContainer,
          {
            opacity: ringOpacity,
            transform: [{ rotate: spinInterpolation }],
          },
        ]}
      >
        <View style={styles.ringHalfTop} />
      </Animated.View>

      <Animated.View
        style={[
          styles.ringContainer,
          {
            opacity: ringOpacity,
            transform: [{ rotate: reverseSpinInterpolation }],
          },
        ]}
      >
        <View style={styles.ringHalfBottom} />
      </Animated.View>

      {/* 4. App Logo */}
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

      {/* 5. Typography */}
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
                      outputRange: [14, 0],
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
                        outputRange: [14, 0],
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
                      outputRange: [14, 0],
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
                        outputRange: [14, 0],
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

      {/* 6. Progress Loader & Counter */}
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
  },
  ambientGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(27, 95, 196, 0.14)',
    top: '22%',
  },
  ringContainer: {
    position: 'absolute',
    width: 248,
    height: 248,
    borderRadius: 124,
    top: '26%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringHalfTop: {
    position: 'absolute',
    width: 248,
    height: 248,
    borderRadius: 124,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#1B5FC4',
    borderRightColor: '#1B5FC4',
  },
  ringHalfBottom: {
    position: 'absolute',
    width: 248,
    height: 248,
    borderRadius: 124,
    borderWidth: 3,
    borderColor: 'transparent',
    borderBottomColor: '#1B5FC4',
    borderLeftColor: '#1B5FC4',
  },
  logoContainer: {
    width: 196,
    height: 196,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1B5FC4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: -80,
  },
  logoImage: {
    width: 190,
    height: 190,
    borderRadius: 44,
  },
  titleContainer: {
    marginTop: 36,
    alignItems: 'center',
    gap: 6,
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
    marginTop: 2,
  },
  loaderContainer: {
    marginTop: 48,
    alignItems: 'center',
    gap: 10,
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
