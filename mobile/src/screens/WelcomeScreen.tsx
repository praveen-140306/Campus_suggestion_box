import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, fontScale, spacing, radius, screen } from '../utils/responsive';

const WelcomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Ionicons name="school" size={scale(64)} color="#4f46e5" style={styles.logoIcon} />
          <Text style={styles.title}>Campus</Text>
          <Text style={styles.titleAccent}>Suggestion Box</Text>
          <Text style={styles.subtitle}>Your voice shapes our campus</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <Text style={styles.chooseText}>Choose your role to continue</Text>

          <TouchableOpacity
            style={styles.studentButton}
            onPress={() => navigation.navigate('Login', { role: 'student' })}
            activeOpacity={0.8}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name="book" size={scale(22)} color="#ffffff" />
            </View>
            <View style={styles.buttonTextCol}>
              <Text style={styles.buttonTitle}>Student</Text>
              <Text style={styles.buttonSubtitle}>Submit & track your suggestions</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate('Login', { role: 'admin' })}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#eef2ff' }]}>
              <Ionicons name="shield-checkmark" size={scale(22)} color="#4f46e5" />
            </View>
            <View style={styles.buttonTextCol}>
              <Text style={[styles.buttonTitle, { color: '#4f46e5' }]}>Admin</Text>
              <Text style={[styles.buttonSubtitle, { color: '#6366f1' }]}>Manage & respond to suggestions</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Ionicons name="globe-outline" size={scale(14)} color="#94a3b8" />
          <Text style={styles.footer}>Campus Suggestion Portal</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: verticalScale(40),
  },
  logoContainer: { alignItems: 'center', marginTop: verticalScale(30) },
  logoIcon: { marginBottom: spacing.sm },
  title: { fontSize: fontScale(34), fontWeight: '800', color: '#0f172a', letterSpacing: -1 },
  titleAccent: { fontSize: fontScale(34), fontWeight: '800', color: '#4f46e5', letterSpacing: -1, marginTop: -scale(4) },
  subtitle: { fontSize: fontScale(15), color: '#64748b', marginTop: spacing.sm, letterSpacing: 0.3 },
  buttonsContainer: { gap: spacing.md, marginVertical: verticalScale(40) },
  chooseText: {
    color: '#94a3b8', fontSize: fontScale(11), textAlign: 'center',
    marginBottom: spacing.sm, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '600'
  },
  studentButton: {
    backgroundColor: '#0f172a',
    borderRadius: radius.xl,
    padding: scale(18),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(14),
    shadowColor: '#0f172a',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  adminButton: {
    backgroundColor: '#ffffff',
    borderRadius: radius.xl,
    padding: scale(18),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(14),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#94a3b8',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrapper: {
    backgroundColor: '#1e293b',
    width: scale(48), height: scale(48),
    borderRadius: radius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  buttonTextCol: { flex: 1 },
  buttonTitle: { fontSize: fontScale(17), fontWeight: '700', color: '#ffffff', marginBottom: scale(2) },
  buttonSubtitle: { fontSize: fontScale(12), color: '#94a3b8' },
  footerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(6), paddingBottom: spacing.md },
  footer: { color: '#94a3b8', fontSize: fontScale(12), fontWeight: '500' },
});

export default WelcomeScreen;
