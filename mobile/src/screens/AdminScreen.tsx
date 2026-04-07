import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
  TouchableOpacity, ActivityIndicator, TextInput, Alert, Modal, Image,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllSuggestions, updateStatus, sendReply, deleteSuggestion } from '../services/api';
import { scale, verticalScale, fontScale, spacing, radius } from '../utils/responsive';

const STATUSES = ['Pending', 'Under Review', 'Resolved'];

const AdminScreen = () => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [filter, setFilter] = useState<string>('All');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await getAllSuggestions();
      setSuggestions(data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updated = await updateStatus(id, status);
      setSuggestions(prev => prev.map(s => s._id === id ? updated : s));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedSuggestion) return;
    setReplyLoading(true);
    try {
      const updated = await sendReply(selectedSuggestion._id, replyText);
      setSuggestions(prev => prev.map(s => s._id === updated._id ? updated : s));
      setReplyText('');
      setSelectedSuggestion(null);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setReplyLoading(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteSuggestion(id);
          setSuggestions(prev => prev.filter(s => s._id !== id));
        } catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  const filtered = filter === 'All' ? suggestions : suggestions.filter(s => (s.status || 'Pending') === filter);

  const statusColor = (status: string) => {
    if (status === 'Resolved') return '#14532d';
    if (status === 'Under Review') return '#713f12';
    return '#1e293b';
  };

  const renderItem = ({ item: s }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, paddingRight: scale(8) }}>
          <Text style={styles.cardName} numberOfLines={1}>{s.name || 'Anonymous'}</Text>
          <Text style={styles.cardDate}>{new Date(s.createdAt).toLocaleDateString()} · {s.category}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(s._id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={scale(18)} color="#ef4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardMsg}>{s.message}</Text>
      {s.attachmentUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
        <Image source={{ uri: s.attachmentUrl }} style={styles.img} resizeMode="cover" />
      )}

      <View style={styles.statusRow}>
        {STATUSES.map(st => (
          <TouchableOpacity
            key={st}
            style={[styles.statusBtn, (s.status || 'Pending') === st && { backgroundColor: statusColor(st) }]}
            onPress={() => handleStatusChange(s._id, st)}
          >
            <Text style={[(s.status || 'Pending') === st ? styles.statusBtnActiveText : styles.statusBtnText]}>
              {st}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {s.adminReply ? (
        <TouchableOpacity style={styles.replyBox} onPress={() => { setSelectedSuggestion(s); setReplyText(s.adminReply); }}>
          <Text style={styles.replyLabel}>Your Reply (Tap to Edit)</Text>
          <Text style={styles.replyText}>{s.adminReply}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.replyBtn} onPress={() => { setSelectedSuggestion(s); setReplyText(''); }}>
          <Ionicons name="chatbubble-outline" size={scale(16)} color="#4f46e5" />
          <Text style={styles.replyBtnText}>Add Reply</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSub}>{suggestions.length} total suggestions</Text>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {['All', ...STATUSES].map(f => (
            <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator color="#818cf8" size="large" style={{ marginTop: verticalScale(40) }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={fetchAll}
          refreshing={loading}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
               <Ionicons name="shield-checkmark" size={scale(40)} color="#e2e8f0" style={styles.emptyIcon} />
               <Text style={styles.emptyTitle}>No suggestions found</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!selectedSuggestion} transparent animationType="slide" onRequestClose={() => setSelectedSuggestion(null)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalDismiss} activeOpacity={1} onPress={() => setSelectedSuggestion(null)} />
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Reply to {selectedSuggestion?.name?.split(' ')[0] || 'Student'}</Text>
            <ScrollView style={styles.modalMsgScroll}>
               <Text style={styles.modalMsg}>{selectedSuggestion?.message}</Text>
            </ScrollView>
            <TextInput
              style={styles.replyInput}
              placeholder="Type your reply here..."
              placeholderTextColor="#475569"
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedSuggestion(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendBtn} onPress={handleReply} disabled={replyLoading}>
                {replyLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send Reply</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { fontSize: fontScale(22), fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  headerSub: { fontSize: fontScale(13), color: '#64748b', marginTop: scale(2) },
  filterWrapper: { paddingBottom: spacing.sm },
  filterRow: { paddingHorizontal: spacing.md, gap: scale(8) },
  filterBtn: { paddingHorizontal: scale(14), paddingVertical: scale(8), borderRadius: radius.full, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', minWidth: scale(60), alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  filterText: { color: '#64748b', fontSize: fontScale(12), fontWeight: '600' },
  filterTextActive: { color: '#ffffff' },
  list: { padding: spacing.md, gap: scale(14), paddingBottom: spacing.xxl },
  card: { backgroundColor: '#ffffff', borderRadius: radius.lg, padding: scale(16), gap: scale(12), borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardName: { color: '#0f172a', fontWeight: '800', fontSize: fontScale(15) },
  cardDate: { color: '#64748b', fontSize: fontScale(11), marginTop: scale(2) },
  deleteBtn: { padding: scale(4) },
  deleteIcon: { fontSize: fontScale(18) },
  cardMsg: { color: '#334155', fontSize: fontScale(14), lineHeight: fontScale(21) },
  img: { width: '100%', height: verticalScale(160), borderRadius: radius.md },
  statusRow: { flexDirection: 'row', gap: scale(8) },
  statusBtn: { flex: 1, paddingVertical: verticalScale(10), borderRadius: radius.md, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  statusBtnText: { color: '#64748b', fontSize: fontScale(10), fontWeight: '600' },
  statusBtnActiveText: { color: '#ffffff', fontSize: fontScale(11), fontWeight: '700' },
  replyBox: { backgroundColor: '#f0fdf4', borderRadius: radius.md, padding: scale(12), borderWidth: 1, borderColor: '#bbf7d0' },
  replyLabel: { color: '#166534', fontSize: fontScale(10), fontWeight: '700', textTransform: 'uppercase', marginBottom: scale(4) },
  replyText: { color: '#15803d', fontSize: fontScale(13) },
  replyBtn: { backgroundColor: '#f1f5f9', borderRadius: radius.md, padding: verticalScale(12), alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: scale(8) },
  replyBtnText: { color: '#4f46e5', fontSize: fontScale(13), fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: verticalScale(60) },
  emptyIcon: { marginBottom: spacing.sm },
  emptyTitle: { color: '#64748b', fontSize: fontScale(15), textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalDismiss: { flex: 1 },
  modalBox: { backgroundColor: '#ffffff', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md, maxHeight: '80%' },
  modalHandle: { width: scale(40), height: scale(4), backgroundColor: '#e2e8f0', borderRadius: radius.full, alignSelf: 'center', marginBottom: scale(-4) },
  modalTitle: { fontSize: fontScale(18), fontWeight: '800', color: '#0f172a' },
  modalMsgScroll: { maxHeight: verticalScale(100) },
  modalMsg: { color: '#475569', fontSize: fontScale(14), lineHeight: fontScale(20), fontStyle: 'italic' },
  replyInput: { backgroundColor: '#f8fafc', borderRadius: radius.md, padding: scale(16), color: '#0f172a', fontSize: fontScale(15), minHeight: verticalScale(120), borderWidth: 1, borderColor: '#e2e8f0' },
  modalBtns: { flexDirection: 'row', gap: scale(12), marginTop: scale(4) },
  cancelBtn: { flex: 1, backgroundColor: '#ffffff', borderRadius: radius.md, paddingVertical: verticalScale(14), alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  cancelText: { color: '#64748b', fontWeight: '700', fontSize: fontScale(14) },
  sendBtn: { flex: 2, backgroundColor: '#4f46e5', borderRadius: radius.md, paddingVertical: verticalScale(14), alignItems: 'center', justifyContent: 'center', shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  sendText: { color: '#ffffff', fontWeight: '700', fontSize: fontScale(14) },
});

export default AdminScreen;
