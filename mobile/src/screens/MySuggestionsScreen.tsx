import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  StatusBar, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMySuggestions } from '../services/api';
import { scale, verticalScale, fontScale, spacing, radius } from '../utils/responsive';

const MySuggestionsScreen = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMine = async () => {
    setLoading(true);
    try {
      const data = await getMySuggestions();
      setSuggestions(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchMine(); }, []);

  const statusColor = (status: string) => {
    if (status === 'Resolved') return '#dcfce7';
    if (status === 'Under Review') return '#fef3c7';
    return '#f1f5f9';
  };

  const statusTextColor = (status: string) => {
    if (status === 'Resolved') return '#166534';
    if (status === 'Under Review') return '#92400e';
    return '#475569';
  };

  const renderItem = ({ item: s }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(s.status || 'Pending') }]}>
          <Text style={[styles.statusText, { color: statusTextColor(s.status || 'Pending') }]}>
            {s.status || 'Pending'}
          </Text>
        </View>
        <Text style={styles.date}>{new Date(s.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={[styles.catBadge, { backgroundColor: categoryColor(s.category) }]}>
        <Text style={styles.catText}>{s.category}</Text>
      </View>
      <Text style={styles.msg}>{s.message}</Text>
      {s.attachmentUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
        <Image source={{ uri: s.attachmentUrl }} style={styles.img} resizeMode="cover" />
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
        <Text style={styles.headerTitle}>My Suggestions</Text>
        <Text style={styles.headerSub}>{suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} submitted</Text>
      </View>
      {loading ? (
        <ActivityIndicator color="#4f46e5" style={{ marginTop: verticalScale(40) }} size="large" />
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={fetchMine}
          refreshing={loading}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={scale(48)} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No suggestions yet</Text>
              <Text style={styles.emptySubtitle}>Submit your first suggestion from the Home tab!</Text>
            </View>
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
  headerSub: { fontSize: fontScale(13), color: '#64748b', marginTop: scale(2) },
  list: { padding: spacing.md, gap: scale(12), paddingBottom: spacing.xl },
  card: { backgroundColor: '#ffffff', borderRadius: radius.lg, padding: scale(16), gap: scale(10), borderWidth: 1, borderColor: '#e2e8f0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: radius.full },
  statusText: { fontSize: fontScale(11), fontWeight: '700' },
  date: { color: '#64748b', fontSize: fontScale(11) },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: radius.full },
  catText: { color: '#ffffff', fontSize: fontScale(11), fontWeight: '700' },
  msg: { color: '#334155', fontSize: fontScale(14), lineHeight: fontScale(21) },
  img: { width: '100%', height: verticalScale(160), borderRadius: radius.md, marginTop: scale(4) },
  replyBox: { backgroundColor: '#f0fdf4', borderRadius: radius.md, padding: scale(12), borderWidth: 1, borderColor: '#bbf7d0' },
  replyLabel: { color: '#166534', fontSize: fontScale(10), fontWeight: '700', textTransform: 'uppercase', marginBottom: scale(4) },
  replyText: { color: '#15803d', fontSize: fontScale(12) },
  emptyContainer: { alignItems: 'center', marginTop: verticalScale(80), gap: scale(8) },
  emptyTitle: { color: '#0f172a', fontSize: fontScale(17), fontWeight: '700' },
  emptySubtitle: { color: '#64748b', fontSize: fontScale(13), textAlign: 'center', paddingHorizontal: spacing.xl },
});

export default MySuggestionsScreen;
