import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/supabase';

interface Wish {
  id: string;
  content: string;
  likes: number;
  created_at: string;
}

export const WishesScreen: React.FC = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newWish, setNewWish] = useState('');

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    try {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishes(data || []);
    } catch (error) {
      console.error('Error fetching wishes:', error);
      Alert.alert('Chyba', 'Nepodarilo sa načítať želania');
    } finally {
      setLoading(false);
    }
  };

  const addWish = async () => {
    if (!newWish.trim()) return;

    try {
      const { error } = await supabase
        .from('wishes')
        .insert([
          {
            content: newWish.trim(),
            likes: 0,
          },
        ]);

      if (error) throw error;

      setNewWish('');
      setModalVisible(false);
      fetchWishes();
      Alert.alert('Úspech', 'Želanie bolo pridané! ✨');
    } catch (error) {
      console.error('Error adding wish:', error);
      Alert.alert('Chyba', 'Nepodarilo sa pridať želanie');
    }
  };

  const likeWish = async (wishId: string, currentLikes: number) => {
    try {
      const { error } = await supabase
        .from('wishes')
        .update({ likes: currentLikes + 1 })
        .eq('id', wishId);

      if (error) throw error;
      fetchWishes();
    } catch (error) {
      console.error('Error liking wish:', error);
      Alert.alert('Chyba', 'Nepodarilo sa lajkovať želanie');
    }
  };

  const renderWish = ({ item }: { item: Wish }) => (
    <View style={styles.wishCard}>
      <View style={styles.wishHeader}>
        <Text style={styles.wishIcon}>✨</Text>
        <Text style={styles.wishDate}>
          {new Date(item.created_at).toLocaleDateString('sk-SK', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>
      <Text style={styles.wishText}>{item.content}</Text>
      <View style={styles.wishFooter}>
        <TouchableOpacity 
          style={styles.likeButton} 
          onPress={() => likeWish(item.id, item.likes)}
          activeOpacity={0.6}
        >
          <Text style={styles.likeIcon}>🤍</Text>
          <Text style={styles.likeCount}>{item.likes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.loadingText}>Načítavam želania...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Zdieľaj svoje želania a podporuj želania ostatných
        </Text>
      </View>

      <FlatList
        data={wishes}
        renderItem={renderWish}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyText}>
              Zatiaľ nie sú žiadne želania.{'\n'}
              Buď prvý/á, kto pridá želanie!
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pridaj želanie</Text>
            <TextInput
              style={styles.input}
              placeholder="Čo si želáš?"
              value={newWish}
              onChangeText={setNewWish}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Zrušiť</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={addWish}
              >
                <Text style={styles.saveButtonText}>Uložiť</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDEFF2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDEFF2',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#FF6B9D',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
    textAlign: 'center',
  },
  list: {
    paddingVertical: 16,
  },
  wishCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
  },
  wishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wishIcon: {
    fontSize: 24,
  },
  wishDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  wishText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  wishFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
  },
  likeIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  likeCount: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#FF6B9D',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
}); 