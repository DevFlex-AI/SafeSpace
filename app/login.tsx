// SafeSpace Login/Register — Single auth page with OTP + Password
// Liquid Glass branding entry animation
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeIn, FadeInDown, FadeInUp, FadeOut,
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useAuth, useAlert } from '@/template';
import theme from '../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

type AuthStep = 'welcome' | 'login' | 'register' | 'otp';

// Liquid Glass animated logo component
function LiquidGlassLogo() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const liquid1 = useSharedValue(0);
  const liquid2 = useSharedValue(0);
  const liquid3 = useSharedValue(0);

  useEffect(() => {
    // Entry animation
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 400 });
    
    // Continuous liquid motion
    liquid1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    liquid2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    liquid3.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const blob1Style = useAnimatedStyle(() => ({
    transform: [{ 
      translateX: Math.sin(liquid1.value * Math.PI * 2) * 15 
    }],
    opacity: 0.6 + liquid1.value * 0.4,
  }));

  const blob2Style = useAnimatedStyle(() => ({
    transform: [{ 
      translateY: Math.cos(liquid2.value * Math.PI * 2) * 10 
    }],
    opacity: 0.5 + liquid2.value * 0.3,
  }));

  const blob3Style = useAnimatedStyle(() => ({
    transform: [{ 
      scale: 1 + liquid3.value * 0.2 
    }],
    opacity: 0.4 + liquid3.value * 0.3,
  }));

  return (
    <Animated.View style={[styles.liquidLogoContainer, containerStyle]}>
      {/* Liquid background blobs */}
      <Animated.View style={[styles.liquidBlob, styles.liquidBlob1, blob1Style]} />
      <Animated.View style={[styles.liquidBlob, styles.liquidBlob2, blob2Style]} />
      <Animated.View style={[styles.liquidBlob, styles.liquidBlob3, blob3Style]} />
      
      {/* Glass overlay */}
      <BlurView intensity={15} tint="light" style={styles.liquidGlassOverlay} />
      
      {/* Logo icon */}
      <View style={styles.liquidLogoIcon}>
        <MaterialIcons name="self-improvement" size={56} color={theme.primary} />
      </View>
    </Animated.View>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { sendOTP, verifyOTPAndLogin, signInWithPassword, operationLoading } = useAuth();
  const { showAlert } = useAlert();

  const [step, setStep] = useState<AuthStep>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    Haptics.selectionAsync();
    const { error } = await signInWithPassword(email.trim(), password);
    if (error) {
      showAlert('Login Failed', error);
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      showAlert('Missing Email', 'Please enter your email.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      showAlert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    Haptics.selectionAsync();
    const { error } = await sendOTP(email.trim());
    if (error) {
      showAlert('Error', error);
      return;
    }
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      showAlert('Enter Code', 'Please enter the verification code.');
      return;
    }
    Haptics.selectionAsync();
    const { error } = await verifyOTPAndLogin(email.trim(), otp.trim(), { password });
    if (error) {
      showAlert('Verification Failed', error);
    }
  };

  // Welcome screen
  if (step === 'welcome') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#F0EDF8', '#E8E4F0', '#F8F6FF']}
          style={StyleSheet.absoluteFill}
        />
        <ScrollView
          contentContainerStyle={styles.welcomeContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Liquid Glass Animated Logo */}
          <Animated.View entering={FadeInDown.duration(600)} style={styles.welcomeHero}>
            <LiquidGlassLogo />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(200)}>
            <Text style={styles.welcomeTitle}>SafeSpace</Text>
            <Text style={styles.welcomeSubtitle}>Your calm companion for daily emotional support</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.featureList}>
            {[
              { icon: 'emoji-emotions', label: 'Track your mood daily' },
              { icon: 'chat-bubble-outline', label: 'Talk to your AI companion' },
              { icon: 'check-circle-outline', label: 'Complete micro-tasks for XP' },
              { icon: 'air', label: 'Calm exercises for tough moments' },
            ].map((item, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <MaterialIcons name={item.icon as any} size={22} color={theme.primary} />
                </View>
                <Text style={styles.featureText}>{item.label}</Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(600).delay(600)} style={styles.welcomeButtons}>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => { Haptics.selectionAsync(); setStep('register'); }}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => { Haptics.selectionAsync(); setStep('login'); }}
            >
              <Text style={styles.secondaryBtnText}>I already have an account</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // OTP verification
  if (step === 'otp') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#F0EDF8', '#F8F6FF']}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable style={styles.backBtn} onPress={() => setStep('register')}>
              <MaterialIcons name="arrow-back" size={24} color={theme.textSecondary} />
            </Pressable>

            <Animated.View entering={FadeInDown.duration(400)}>
              <View style={styles.otpIcon}>
                <MaterialIcons name="mark-email-read" size={48} color={theme.primary} />
              </View>
              <Text style={styles.formTitle}>Check your email</Text>
              <Text style={styles.formSubtitle}>
                We sent a 4-digit code to {email}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.otpInputWrap}>
              <TextInput
                style={styles.otpInput}
                value={otp}
                onChangeText={setOtp}
                placeholder="0000"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                textAlign="center"
                autoFocus
              />
            </Animated.View>

            <Pressable
              style={[styles.primaryBtn, operationLoading && styles.btnDisabled]}
              onPress={handleVerifyOtp}
              disabled={operationLoading}
            >
              <Text style={styles.primaryBtnText}>
                {operationLoading ? 'Verifying...' : 'Verify & Create Account'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.resendBtn}
              onPress={handleSendOtp}
              disabled={operationLoading}
            >
              <Text style={styles.resendBtnText}>Resend code</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // Login / Register form
  const isRegister = step === 'register';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#F0EDF8', '#F8F6FF']}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={styles.backBtn} onPress={() => setStep('welcome')}>
            <MaterialIcons name="arrow-back" size={24} color={theme.textSecondary} />
          </Pressable>

          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.formTitle}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={styles.formSubtitle}>
              {isRegister ? 'Start your wellness journey' : 'Sign in to your safe space'}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrap}>
                <MaterialIcons name="email" size={20} color={theme.textMuted} />
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrap}>
                <MaterialIcons name="lock-outline" size={20} color={theme.textMuted} />
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min 6 characters"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry={!showPassword}
                  returnKeyType={isRegister ? 'next' : 'done'}
                  onSubmitEditing={isRegister ? () => confirmRef.current?.focus() : handleLogin}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={theme.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password (Register only) */}
            {isRegister && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrap}>
                  <MaterialIcons name="lock-outline" size={20} color={theme.textMuted} />
                  <TextInput
                    ref={confirmRef}
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter password"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleSendOtp}
                  />
                </View>
              </View>
            )}

            <Pressable
              style={[styles.primaryBtn, operationLoading && styles.btnDisabled]}
              onPress={isRegister ? handleSendOtp : handleLogin}
              disabled={operationLoading}
            >
              <Text style={styles.primaryBtnText}>
                {operationLoading
                  ? 'Please wait...'
                  : isRegister
                  ? 'Continue'
                  : 'Sign In'
                }
              </Text>
            </Pressable>
          </Animated.View>

          {/* Switch auth mode */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isRegister ? 'Already have an account?' : 'New to SafeSpace?'}
            </Text>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setStep(isRegister ? 'login' : 'register');
              }}
            >
              <Text style={styles.switchLink}>
                {isRegister ? 'Sign In' : 'Create Account'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  // Liquid Glass Logo Animation
  liquidLogoContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  liquidBlob: {
    position: 'absolute',
    borderRadius: 100,
  },
  liquidBlob1: {
    width: 100,
    height: 100,
    backgroundColor: theme.primaryLight,
    top: 20,
    left: 20,
  },
  liquidBlob2: {
    width: 70,
    height: 70,
    backgroundColor: theme.accentLight,
    bottom: 25,
    right: 15,
  },
  liquidBlob3: {
    width: 50,
    height: 50,
    backgroundColor: theme.warmLight,
    top: 10,
    right: 30,
  },
  liquidGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 70,
  },
  liquidLogoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },

  // Welcome
  welcomeContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  welcomeHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeImage: {
    width: 160,
    height: 160,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  featureList: {
    marginTop: 32,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary,
  },
  welcomeButtons: {
    marginTop: 40,
    gap: 14,
  },

  // Form
  formContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  formSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 6,
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    marginLeft: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: 14,
    gap: 10,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.textPrimary,
    paddingVertical: 14,
  },

  // OTP
  otpIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  otpInputWrap: {
    marginVertical: 24,
  },
  otpInput: {
    backgroundColor: '#FFF',
    borderRadius: theme.radius.xl,
    borderWidth: 2,
    borderColor: theme.primary,
    fontSize: 32,
    fontWeight: '700',
    color: theme.textPrimary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    letterSpacing: 16,
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
  },
  resendBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.primary,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: theme.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryBtn: {
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.border,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  btnDisabled: {
    opacity: 0.6,
  },

  // Switch
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  switchText: {
    fontSize: 15,
    color: theme.textSecondary,
  },
  switchLink: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.primary,
  },
});
