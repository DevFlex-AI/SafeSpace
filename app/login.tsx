// SafeSpace Login/Register — Single auth page with OTP + Password
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth, useAlert } from '@/template';
import theme from '../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

type AuthStep = 'welcome' | 'login' | 'register' | 'otp';

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
          <Animated.View entering={FadeInDown.duration(600)} style={styles.welcomeHero}>
            <Image
              source={require('../assets/images/chat-companion.png')}
              style={styles.welcomeImage}
              contentFit="contain"
            />
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
