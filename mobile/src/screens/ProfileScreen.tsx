import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { scale, verticalScale, fontScale, spacing, radius } from '../utils/responsive';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0e2a" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user?.name || '')}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role === 'admin' ? '🛡️ Admin' : '📚 Student'}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>ACCOUNT DETAILS</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>👤</Text>
              <View>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user?.name}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>✉️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{user?.email}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏛️</Text>
              <View>
                <Text style={styles.infoLabel}>Institution</Text>
                <Text style={styles.infoValue}>BIT Sathy</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>{user?.role === 'admin' ? '🛡️' : '📚'}</Text>
              <View>
                <Text style={styles.infoLabel}>Account Type</Text>
                <Text style={styles.infoValue}>{user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.appVersion}>Campus Suggestion Box v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0e2a' },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  avatarSection: { alignItems: 'center', gap: scale(10), paddingTop: spacing.md },
  avatarCircle: {
    width: scale(90), height: scale(90), borderRadius: scale(45),
    backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#818cf8', shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
  },
  avatarText: { color: '#ffffff', fontSize: fontScale(32), fontWeight: '800' },
  name: { fontSize: fontScale(22), fontWeight: '800', color: '#ffffff' },
  email: { fontSize: fontScale(13), color: '#64748b' },
  roleBadge: { backgroundColor: '#1e1b4b', paddingHorizontal: scale(16), paddingVertical: scale(6), borderRadius: radius.full },
  roleText: { color: '#818cf8', fontSize: fontScale(13), fontWeight: '700' },
  infoSection: { gap: scale(8) },
  sectionLabel: { color: '#475569', fontSize: fontScale(10), fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  infoCard: { backgroundColor: '#1e1b4b', borderRadius: radius.lg, paddingHorizontal: spacing.md, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: scale(14), paddingVertical: scale(14) },
  infoIcon: { fontSize: fontScale(20), width: scale(28), textAlign: 'center' },
  infoLabel: { color: '#64748b', fontSize: fontScale(11), marginBottom: scale(2) },
  infoValue: { color: '#e2e8f0', fontSize: fontScale(14), fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#0f0e2a', marginLeft: scale(42) },
  logoutBtn: {
    backgroundColor: '#450a0a', borderRadius: radius.md,
    paddingVertical: verticalScale(16), alignItems: 'center',
    borderWidth: 1, borderColor: '#7f1d1d',
  },
  logoutText: { color: '#fca5a5', fontSize: fontScale(15), fontWeight: '700' },
  appVersion: { color: '#334155', fontSize: fontScale(11), textAlign: 'center', paddingBottom: spacing.md },
});

export default ProfileScreen;
