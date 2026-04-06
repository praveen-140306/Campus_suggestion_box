import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, StatusBar, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser, googleAuth } from '../services/api';
import { scale, verticalScale, fontScale, spacing, radius } from '../utils/responsive';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '688607881387-44sso8dgjmn0964lj2pd1hun5qtt1sfq.apps.googleusercontent.com';

const LoginScreen = ({ navigation, route }: any) => {
  const role = route?.params?.role || 'student';
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleToken(id_token);
    }
  }, [response]);

  const handleGoogleToken = async (idToken: string) => {
    setLoading(true);
    try {
      const data = await googleAuth(idToken, role);
      await login(data);
    } catch (err: any) {
      Alert.alert('Google Sign-In Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await loginUser(email, password, role);
      } else {
        if (!name) { Alert.alert('Missing Name', 'Please enter your name.'); setLoading(false); return; }
        data = await registerUser(name, email, password, role);
      }
      await login(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0e2a" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>{role === 'admin' ? '🛡️ Admin' : '📚 Student'}</Text>
            </View>
          </View>

          <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.subtitle}>{isLogin ? 'Sign in to continue' : 'Join the campus community'}</Text>

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@bitsathy.ac.in"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.googleBtn, (!request || loading) && { opacity: 0.6 }]}
              onPress={() => promptAsync()}
              disabled={!request || loading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.switchLink}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0e2a' },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  backBtn: { padding: spacing.xs },
  backText: { color: '#818cf8', fontSize: fontScale(14), fontWeight: '600' },
  roleTag: { backgroundColor: '#1e1b4b', paddingHorizontal: scale(14), paddingVertical: scale(6), borderRadius: radius.full },
  roleTagText: { color: '#818cf8', fontSize: fontScale(12), fontWeight: '600' },
  title: { fontSize: fontScale(28), fontWeight: '800', color: '#ffffff', marginBottom: scale(6) },
  subtitle: { fontSize: fontScale(14), color: '#64748b', marginBottom: spacing.xl },
  form: { gap: spacing.md },
  inputGroup: { gap: scale(6) },
  label: { color: '#94a3b8', fontSize: fontScale(12), fontWeight: '600', letterSpacing: 0.3 },
  input: {
    backgroundColor: '#1e1b4b',
    borderRadius: radius.md,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    color: '#ffffff',
    fontSize: fontScale(15),
    borderWidth: 1,
    borderColor: '#2d2b5e',
    minHeight: verticalScale(52),
  },
  primaryBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: radius.md,
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    marginTop: scale(4),
    minHeight: verticalScale(54),
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#ffffff', fontSize: fontScale(16), fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: scale(10) },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1e293b' },
  dividerText: { color: '#475569', fontSize: fontScale(12) },
  googleBtn: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    paddingVertical: verticalScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    minHeight: verticalScale(52),
  },
  googleIcon: { fontSize: fontScale(18), fontWeight: '900', color: '#4285F4' },
  googleBtnText: { color: '#1e1b4b', fontSize: fontScale(15), fontWeight: '700' },
  switchRow: { alignItems: 'center', paddingVertical: spacing.sm },
  switchText: { color: '#64748b', fontSize: fontScale(13) },
  switchLink: { color: '#818cf8', fontWeight: '700' },
});

export default LoginScreen;
