import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user?.name || '')}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name={user?.role === 'admin' ? 'shield-checkmark' : 'book'} size={scale(14)} color="#4f46e5" />
            <Text style={styles.roleText}>{user?.role === 'admin' ? 'Admin' : 'Student'}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionLabel}>ACCOUNT DETAILS</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={scale(20)} color="#64748b" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user?.name}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={scale(20)} color="#64748b" style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{user?.email}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name={user?.role === 'admin' ? 'shield-outline' : 'book-outline'} size={scale(20)} color="#64748b" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Account Type</Text>
                <Text style={styles.infoValue}>{user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={scale(18)} color="#dc2626" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.appVersion}>Campus Suggestion Box v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  avatarSection: { alignItems: 'center', gap: scale(10), paddingTop: spacing.md },
  avatarCircle: {
    width: scale(90), height: scale(90), borderRadius: scale(45),
    backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  avatarText: { color: '#ffffff', fontSize: fontScale(32), fontWeight: '800' },
  name: { fontSize: fontScale(22), fontWeight: '800', color: '#0f172a' },
  email: { fontSize: fontScale(13), color: '#64748b' },
  roleBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: scale(16), paddingVertical: scale(6), borderRadius: radius.full, flexDirection: 'row', alignItems: 'center', gap: scale(6) },
  roleText: { color: '#4f46e5', fontSize: fontScale(13), fontWeight: '700' },
  infoSection: { gap: scale(8) },
  sectionLabel: { color: '#94a3b8', fontSize: fontScale(10), fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  infoCard: { backgroundColor: '#ffffff', borderRadius: radius.lg, paddingHorizontal: spacing.md, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: scale(14), paddingVertical: scale(14) },
  infoIcon: { width: scale(28), textAlign: 'center' },
  infoLabel: { color: '#64748b', fontSize: fontScale(11), marginBottom: scale(2) },
  infoValue: { color: '#0f172a', fontSize: fontScale(14), fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginLeft: scale(42) },
  logoutBtn: {
    backgroundColor: '#fef2f2', borderRadius: radius.md,
    paddingVertical: verticalScale(16), alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: scale(8),
    borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { color: '#dc2626', fontSize: fontScale(15), fontWeight: '700' },
  appVersion: { color: '#94a3b8', fontSize: fontScale(11), textAlign: 'center', paddingBottom: spacing.md },
});

export default ProfileScreen;
