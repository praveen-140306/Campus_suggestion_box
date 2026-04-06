import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, StatusBar, ActivityIndicator,
  Alert, Image, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
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
            <View style={[styles.badge, { backgroundColor: '#1e293b' }]}>
              <Text style={[styles.badgeText, { color: '#94a3b8' }]}>{s.status || 'Pending'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.upvoteBtn} onPress={() => handleUpvote(s._id)}>
          <Text style={styles.upvoteArrow}>▲</Text>
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
      <StatusBar barStyle="light-content" backgroundColor="#0f0e2a" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Suggestion Box</Text>
        <Text style={styles.headerSub}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
      </View>

      <View style={styles.tabs}>
        {(['submit', 'feed'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.activeTab]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>
              {t === 'submit' ? '✏️ Submit' : '📢 Feed'}
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
                <Text style={styles.successText}>✅ Suggestion submitted successfully!</Text>
              </View>
            )}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
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
              placeholderTextColor="#475569"
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

            <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
              <Text style={styles.imageBtnText}>{imageUri ? '📷 Change Image' : '📎 Attach Image (optional)'}</Text>
            </TouchableOpacity>
            {imageUri && (
              <View>
                <Image source={{ uri: imageUri }} style={styles.previewImg} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImg} onPress={() => setImageUri(null)}>
                  <Text style={styles.removeImgText}>✕ Remove</Text>
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
              ? <ActivityIndicator color="#818cf8" size="large" style={{ marginTop: verticalScale(60) }} />
              : <Text style={styles.emptyText}>No public suggestions yet. Be the first! 🚀</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const categoryColor = (cat: string) => {
  const map: any = { Academics: '#1d4ed8', Facilities: '#15803d', Events: '#7c3aed', Others: '#374151' };
  return map[cat] || '#374151';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0e2a' },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { fontSize: fontScale(20), fontWeight: '800', color: '#ffffff' },
  headerSub: { fontSize: fontScale(13), color: '#64748b', marginTop: scale(2) },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#1e1b4b',
    borderRadius: radius.md,
    padding: scale(4),
    gap: scale(4),
  },
  tab: { flex: 1, paddingVertical: verticalScale(10), alignItems: 'center', borderRadius: scale(10) },
  activeTab: { backgroundColor: '#4f46e5' },
  tabText: { color: '#64748b', fontWeight: '600', fontSize: fontScale(13) },
  activeTabText: { color: '#ffffff' },
  formContainer: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  label: { color: '#94a3b8', fontSize: fontScale(12), fontWeight: '600', letterSpacing: 0.3 },
  catRow: { flexDirection: 'row', gap: scale(8) },
  catChip: {
    paddingHorizontal: scale(14), paddingVertical: scale(8),
    borderRadius: radius.full, backgroundColor: '#1e1b4b',
    borderWidth: 1, borderColor: '#2d2b5e',
  },
  catChipActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  catChipText: { color: '#64748b', fontSize: fontScale(12), fontWeight: '600' },
  catChipTextActive: { color: '#ffffff' },
  textArea: {
    backgroundColor: '#1e1b4b', borderRadius: radius.md,
    padding: scale(14), color: '#ffffff', fontSize: fontScale(14),
    borderWidth: 1, borderColor: '#2d2b5e',
    minHeight: verticalScale(120),
  },
  radioRow: { flexDirection: 'row', gap: scale(24) },
  radioOption: { flexDirection: 'row', alignItems: 'center', gap: scale(8) },
  radio: { width: scale(18), height: scale(18), borderRadius: scale(9), borderWidth: 2, borderColor: '#4f46e5' },
  radioActive: { backgroundColor: '#4f46e5' },
  radioLabel: { color: '#94a3b8', fontSize: fontScale(13) },
  imageBtn: {
    backgroundColor: '#1e1b4b', borderRadius: radius.md,
    padding: verticalScale(14), alignItems: 'center',
    borderWidth: 1, borderColor: '#2d2b5e', borderStyle: 'dashed',
  },
  imageBtnText: { color: '#818cf8', fontSize: fontScale(13), fontWeight: '600' },
  previewImg: { width: '100%', height: verticalScale(180), borderRadius: radius.md },
  removeImg: { alignSelf: 'flex-end', marginTop: scale(4) },
  removeImgText: { color: '#f87171', fontSize: fontScale(12) },
  submitBtn: {
    backgroundColor: '#4f46e5', borderRadius: radius.md,
    paddingVertical: verticalScale(16), alignItems: 'center',
    minHeight: verticalScale(54), justifyContent: 'center',
  },
  submitBtnText: { color: '#ffffff', fontSize: fontScale(15), fontWeight: '700' },
  successBanner: { backgroundColor: '#14532d', borderRadius: radius.md, padding: scale(14) },
  successText: { color: '#86efac', fontSize: fontScale(13), fontWeight: '600' },
  errorBanner: { backgroundColor: '#450a0a', borderRadius: radius.md, padding: scale(14) },
  errorText: { color: '#fca5a5', fontSize: fontScale(13) },
  feedList: { padding: spacing.md, gap: scale(12), paddingBottom: spacing.xl },
  card: { backgroundColor: '#1e1b4b', borderRadius: radius.lg, padding: scale(16), gap: scale(10) },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badgeRow: { flexDirection: 'row', gap: scale(6), flexWrap: 'wrap' },
  badge: { paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: radius.full },
  badgeText: { color: '#ffffff', fontSize: fontScale(10), fontWeight: '700' },
  cardMsg: { color: '#e2e8f0', fontSize: fontScale(14), lineHeight: fontScale(21) },
  cardMeta: { color: '#475569', fontSize: fontScale(11) },
  upvoteBtn: {
    alignItems: 'center', backgroundColor: '#0f0e2a',
    borderRadius: scale(10), padding: scale(8), minWidth: scale(44),
  },
  upvoteArrow: { color: '#818cf8', fontSize: fontScale(13) },
  upvoteCount: { color: '#818cf8', fontSize: fontScale(12), fontWeight: '700' },
  attachImg: { width: '100%', height: verticalScale(160), borderRadius: radius.md },
  replyBox: { backgroundColor: '#172554', borderRadius: radius.md, padding: scale(12) },
  replyLabel: { color: '#93c5fd', fontSize: fontScale(10), fontWeight: '700', textTransform: 'uppercase', marginBottom: scale(4) },
  replyText: { color: '#bfdbfe', fontSize: fontScale(12) },
  emptyText: { color: '#475569', fontSize: fontScale(14), textAlign: 'center', marginTop: verticalScale(60) },
});

export default HomeScreen;
