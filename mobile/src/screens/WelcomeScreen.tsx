import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { scale, verticalScale, fontScale, spacing, radius, screen } from '../utils/responsive';

const WelcomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0e2a" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🎓</Text>
          <Text style={styles.title}>Campus</Text>
          <Text style={styles.titleAccent}>Suggestion Box</Text>
          <Text style={styles.subtitle}>Your voice shapes our campus</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <Text style={styles.chooseText}>Choose your role to continue</Text>

          <TouchableOpacity
            style={styles.studentButton}
            onPress={() => navigation.navigate('Login', { role: 'student' })}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonEmoji}>📚</Text>
            <View style={styles.buttonTextCol}>
              <Text style={styles.buttonTitle}>Student</Text>
              <Text style={styles.buttonSubtitle}>Submit & track your suggestions</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate('Login', { role: 'admin' })}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonEmoji}>🛡️</Text>
            <View style={styles.buttonTextCol}>
              <Text style={[styles.buttonTitle, { color: '#1e1b4b' }]}>Admin</Text>
              <Text style={[styles.buttonSubtitle, { color: '#3730a3' }]}>Manage & respond to suggestions</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>BIT Sathy Campus Portal</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0e2a' },
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: verticalScale(40),
  },
  logoContainer: { alignItems: 'center', marginTop: verticalScale(30) },
  logoEmoji: { fontSize: scale(60), marginBottom: spacing.md },
  title: { fontSize: fontScale(34), fontWeight: '800', color: '#ffffff', letterSpacing: -1 },
  titleAccent: { fontSize: fontScale(34), fontWeight: '800', color: '#818cf8', letterSpacing: -1, marginTop: -scale(4) },
  subtitle: { fontSize: fontScale(14), color: '#94a3b8', marginTop: spacing.sm, letterSpacing: 0.3 },
  buttonsContainer: { gap: spacing.md, marginVertical: verticalScale(40) },
  chooseText: {
    color: '#64748b', fontSize: fontScale(11), textAlign: 'center',
    marginBottom: spacing.sm, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  studentButton: {
    backgroundColor: '#3730a3',
    borderRadius: radius.lg,
    padding: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(14),
    shadowColor: '#818cf8',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  adminButton: {
    backgroundColor: '#818cf8',
    borderRadius: radius.lg,
    padding: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(14),
    shadowColor: '#818cf8',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonEmoji: { fontSize: scale(28) },
  buttonTextCol: { flex: 1 },
  buttonTitle: { fontSize: fontScale(17), fontWeight: '700', color: '#ffffff', marginBottom: scale(2) },
  buttonSubtitle: { fontSize: fontScale(12), color: '#c7d2fe' },
  footer: { color: '#334155', fontSize: fontScale(12), textAlign: 'center', paddingBottom: spacing.md },
});

export default WelcomeScreen;
