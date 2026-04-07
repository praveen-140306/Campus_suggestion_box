import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator,
  Alert, Image, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { getPublicSuggestions, submitSuggestion, upvoteSuggestion } from '../services/api';
import { scale, verticalScale, fontScale, spacing, radius, screen } from '../utils/responsive';

const CATEGORIES = ['Academics', 'Facilities', 'Events', 'Others'];

const HomeScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'submit' | 'feed'>('submit');
  const [category, setCategory] = useState('Academics');
  const [message, setMessage] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'personal'>('public');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'feed') fetchFeed();
  }, [activeTab]);

  const fetchFeed = async () => {
    setLoadingFeed(true);
    try {
      const data = await getPublicSuggestions();
      setSuggestions(data);
    } catch (e) { console.error(e); }
    setLoadingFeed(false);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed', 'Please allow access to your gallery.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed', 'Please allow camera access.'); return; }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!message.trim()) { Alert.alert('Required', 'Please enter a suggestion.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await submitSuggestion(user?.name || '', category, message, visibility, imageUri);
      setMessage(''); setImageUri(null); setCategory('Academics'); setVisibility('public');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: any) { setError(e.message); }
    setSubmitting(false);
  };

  const handleUpvote = async (id: string) => {
    try {
      const updated = await upvoteSuggestion(id);
      setSuggestions(prev => prev.map(s => s._id === id ? updated : s));
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const renderSuggestion = ({ item: s }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: categoryColor(s.category) }]}>
              <Text style={styles.badgeText}>{s.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#f1f5f9' }]}>
              <Text style={[styles.badgeText, { color: '#64748b' }]}>{s.status || 'Pending'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.upvoteBtn} onPress={() => handleUpvote(s._id)}>
          <Ionicons name="caret-up" size={scale(18)} color="#4f46e5" />
          <Text style={styles.upvoteCount}>{(s.upvotes || []).length}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardMsg}>{s.message}</Text>
      <Text style={styles.cardMeta}>by {s.name || 'Anonymous'} · {new Date(s.createdAt).toLocaleDateString()}</Text>
      {s.attachmentUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
        <Image source={{ uri: s.attachmentUrl }} style={styles.attachImg} resizeMode="cover" />
      )}
      {s.adminReply && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Admin Reply</Text>
          <Text style={styles.replyText}>{s.adminReply}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Suggestion Box</Text>
        <Text style={styles.headerSub}>Hello, {user?.name?.split(' ')[0]}</Text>
      </View>

      <View style={styles.tabs}>
        {(['submit', 'feed'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.activeTab]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>
              {t === 'submit' ? 'Submit Suggestion' : 'All Suggestions'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'submit' ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {success && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={scale(18)} color="#166534" />
                <Text style={styles.successText}>Suggestion submitted successfully!</Text>
              </View>
            )}
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning" size={scale(18)} color="#991b1b" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
              <View style={styles.catRow}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c} style={[styles.catChip, category === c && styles.catChipActive]} onPress={() => setCategory(c)}>
                    <Text style={[styles.catChipText, category === c && styles.catChipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Your Suggestion *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your suggestion in detail..."
              placeholderTextColor="#94a3b8"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Visibility</Text>
            <View style={styles.radioRow}>
              {(['public', 'personal'] as const).map(v => (
                <TouchableOpacity key={v} style={styles.radioOption} onPress={() => setVisibility(v)}>
                  <View style={[styles.radio, visibility === v && styles.radioActive]} />
                  <Text style={styles.radioLabel}>{v === 'public' ? '🌐 Public' : '🔒 Personal'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.mediaRow}>
              <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                <Feather name="image" size={scale(18)} color="#4f46e5" />
                <Text style={styles.imageBtnText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageBtn} onPress={takePhoto}>
                <Feather name="camera" size={scale(18)} color="#4f46e5" />
                <Text style={styles.imageBtnText}>Camera</Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImg} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImg} onPress={() => setImageUri(null)}>
                  <Ionicons name="close" size={scale(16)} color="#ef4444" />
                  <Text style={styles.removeImgText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Suggestion</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={item => item._id}
          renderItem={renderSuggestion}
          contentContainerStyle={styles.feedList}
          onRefresh={fetchFeed}
          refreshing={loadingFeed}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loadingFeed
              ? <ActivityIndicator color="#4f46e5" size="large" style={{ marginTop: verticalScale(60) }} />
              : <Text style={styles.emptyText}>No public suggestions yet</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const categoryColor = (cat: string) => {
  const map: any = { Academics: '#ef4444', Facilities: '#10b981', Events: '#8b5cf6', Others: '#64748b' };
  return map[cat] || '#64748b';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { fontSize: fontScale(22), fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  headerSub: { fontSize: fontScale(14), color: '#64748b', marginTop: scale(2) },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#f1f5f9',
    borderRadius: radius.md,
    padding: scale(4),
    gap: scale(4),
  },
  tab: { flex: 1, paddingVertical: verticalScale(10), alignItems: 'center', borderRadius: scale(8) },
  activeTab: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  tabText: { color: '#64748b', fontWeight: '600', fontSize: fontScale(13) },
  activeTabText: { color: '#0f172a' },
  formContainer: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  label: { color: '#475569', fontSize: fontScale(12), fontWeight: '600', letterSpacing: 0.3 },
  catRow: { flexDirection: 'row', gap: scale(8) },
  catChip: {
    paddingHorizontal: scale(14), paddingVertical: scale(8),
    borderRadius: radius.full, backgroundColor: '#f8fafc',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  catChipActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  catChipText: { color: '#64748b', fontSize: fontScale(12), fontWeight: '600' },
  catChipTextActive: { color: '#ffffff' },
  textArea: {
    backgroundColor: '#f8fafc', borderRadius: radius.md,
    padding: scale(14), color: '#0f172a', fontSize: fontScale(14),
    borderWidth: 1, borderColor: '#e2e8f0',
    minHeight: verticalScale(120),
  },
  radioRow: { flexDirection: 'row', gap: scale(24) },
  radioOption: { flexDirection: 'row', alignItems: 'center', gap: scale(8) },
  radio: { width: scale(18), height: scale(18), borderRadius: scale(9), borderWidth: 2, borderColor: '#cbd5e1' },
  radioActive: { borderColor: '#4f46e5', backgroundColor: '#4f46e5' },
  radioLabel: { color: '#334155', fontSize: fontScale(13) },
  mediaRow: { flexDirection: 'row', gap: scale(12) },
  imageBtn: {
    flex: 1,
    backgroundColor: '#f8fafc', borderRadius: radius.md,
    padding: verticalScale(14), alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed', flexDirection: 'row', gap: scale(8)
  },
  imageBtnText: { color: '#0f172a', fontSize: fontScale(13), fontWeight: '600' },
  previewContainer: { marginTop: scale(4) },
  previewImg: { width: '100%', height: verticalScale(180), borderRadius: radius.md },
  removeImg: { position: 'absolute', top: scale(8), right: scale(8), backgroundColor: '#ffffff', paddingHorizontal: scale(10), paddingVertical: scale(6), borderRadius: radius.sm, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  removeImgText: { color: '#ef4444', fontSize: fontScale(11), fontWeight: '700' },
  submitBtn: {
    backgroundColor: '#4f46e5', borderRadius: radius.md,
    paddingVertical: verticalScale(16), alignItems: 'center',
    minHeight: verticalScale(54), justifyContent: 'center',
    shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  submitBtnText: { color: '#ffffff', fontSize: fontScale(15), fontWeight: '700' },
  successBanner: { backgroundColor: '#f0fdf4', borderRadius: radius.md, padding: scale(14), borderWidth: 1, borderColor: '#bbf7d0', flexDirection: 'row', alignItems: 'center', gap: scale(8) },
  successText: { color: '#166534', fontSize: fontScale(13), fontWeight: '600', flex: 1 },
  errorBanner: { backgroundColor: '#fef2f2', borderRadius: radius.md, padding: scale(14), borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', gap: scale(8) },
  errorText: { color: '#991b1b', fontSize: fontScale(13), flex: 1 },
  feedList: { padding: spacing.md, gap: scale(12), paddingBottom: spacing.xl },
  card: { backgroundColor: '#ffffff', borderRadius: radius.lg, padding: scale(16), borderWidth: 1, borderColor: '#e2e8f0', gap: scale(10) },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badgeRow: { flexDirection: 'row', gap: scale(6), flexWrap: 'wrap' },
  badge: { paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: radius.full },
  badgeText: { color: '#ffffff', fontSize: fontScale(10), fontWeight: '700' },
  cardMsg: { color: '#334155', fontSize: fontScale(14), lineHeight: fontScale(21) },
  cardMeta: { color: '#64748b', fontSize: fontScale(11) },
  upvoteBtn: {
    alignItems: 'center', backgroundColor: '#f1f5f9',
    borderRadius: scale(10), padding: scale(8), minWidth: scale(44),
  },
  upvoteArrow: { color: '#4f46e5', fontSize: fontScale(13) },
  upvoteCount: { color: '#4f46e5', fontSize: fontScale(12), fontWeight: '700' },
  attachImg: { width: '100%', height: verticalScale(160), borderRadius: radius.md, marginTop: scale(4) },
  replyBox: { backgroundColor: '#f0fdf4', borderRadius: radius.md, padding: scale(12), borderWidth: 1, borderColor: '#bbf7d0' },
  replyLabel: { color: '#166534', fontSize: fontScale(10), fontWeight: '700', textTransform: 'uppercase', marginBottom: scale(4) },
  replyText: { color: '#15803d', fontSize: fontScale(12) },
  emptyText: { color: '#64748b', fontSize: fontScale(14), textAlign: 'center', marginTop: verticalScale(60) },
});

export default HomeScreen;
