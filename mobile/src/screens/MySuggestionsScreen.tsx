import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  StatusBar, ActivityIndicator, Image,
} from 'react-native';
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
    if (status === 'Resolved') return '#14532d';
    if (status === 'Under Review') return '#713f12';
    return '#1e293b';
  };

  const statusTextColor = (status: string) => {
    if (status === 'Resolved') return '#86efac';
    if (status === 'Under Review') return '#fde68a';
    return '#94a3b8';
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
      <StatusBar barStyle="light-content" backgroundColor="#0f0e2a" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Suggestions</Text>
        <Text style={styles.headerSub}>{suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} submitted</Text>
      </View>
      {loading ? (
        <ActivityIndicator color="#818cf8" style={{ marginTop: verticalScale(40) }} size="large" />
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
              <Text style={styles.emptyEmoji}>📝</Text>
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
  const map: any = { Academics: '#1e3a5f', Facilities: '#14532d', Events: '#3b0764', Others: '#1e293b' };
  return map[cat] || '#1e293b';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0e2a' },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { fontSize: fontScale(20), fontWeight: '800', color: '#ffffff' },
  headerSub: { fontSize: fontScale(12), color: '#64748b', marginTop: scale(2) },
  list: { padding: spacing.md, gap: scale(12), paddingBottom: spacing.xl },
  card: { backgroundColor: '#1e1b4b', borderRadius: radius.lg, padding: scale(16), gap: scale(10) },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: radius.full },
  statusText: { fontSize: fontScale(11), fontWeight: '700' },
  date: { color: '#475569', fontSize: fontScale(11) },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: scale(10), paddingVertical: scale(4), borderRadius: radius.full },
  catText: { color: '#ffffff', fontSize: fontScale(11), fontWeight: '700' },
  msg: { color: '#e2e8f0', fontSize: fontScale(14), lineHeight: fontScale(21) },
  img: { width: '100%', height: verticalScale(160), borderRadius: radius.md },
  replyBox: { backgroundColor: '#172554', borderRadius: radius.md, padding: scale(12) },
  replyLabel: { color: '#93c5fd', fontSize: fontScale(10), fontWeight: '700', textTransform: 'uppercase', marginBottom: scale(4) },
  replyText: { color: '#bfdbfe', fontSize: fontScale(12) },
  emptyContainer: { alignItems: 'center', marginTop: verticalScale(80), gap: scale(8) },
  emptyEmoji: { fontSize: scale(48) },
  emptyTitle: { color: '#e2e8f0', fontSize: fontScale(17), fontWeight: '700' },
  emptySubtitle: { color: '#475569', fontSize: fontScale(13), textAlign: 'center', paddingHorizontal: spacing.xl },
});

export default MySuggestionsScreen;
