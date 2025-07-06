import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
  Alert, Dimensions, Keyboard, RefreshControl, Animated
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Clipboard from 'expo-clipboard';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [passwords, setPasswords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) loadPasswords();
  }, [isFocused]);

  const loadPasswords = async () => {
    setRefreshing(true);
    try {
      const indexRaw = await SecureStore.getItemAsync('cryptix-index');
      const keys = indexRaw ? JSON.parse(indexRaw) : [];

      const entries = await Promise.all(
        keys.map(async (key) => {
          const value = await SecureStore.getItemAsync(key);
          try {
            const parsed = JSON.parse(value);
            if (parsed?.platform && parsed?.username && parsed?.password) {
              return { key, ...parsed };
            }
          } catch {
            return null;
          }
        })
      );

      let cleaned = entries.filter(Boolean);
      if (sortType === 'newest') cleaned = cleaned.reverse();
      else cleaned = cleaned.sort((a, b) => a.platform.localeCompare(b.platform));

      setPasswords(cleaned);
    } catch (err) {
      console.error('Error loading:', err);
    }
    setRefreshing(false);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  };

  const deleteEntry = async (key) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this password?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await SecureStore.deleteItemAsync(key);
          let indexRaw = await SecureStore.getItemAsync('cryptix-index');
          let index = indexRaw ? JSON.parse(indexRaw) : [];
          index = index.filter(k => k !== key);
          await SecureStore.setItemAsync('cryptix-index', JSON.stringify(index));
          loadPasswords();
        }
      }
    ]);
  };

  const renderRightActions = (item) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteEntry(item.key)}>
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const copyToClipboard = async (value, label) => {
    await Clipboard.setStringAsync(value);
    Alert.alert('Copied', `${label} copied to clipboard.`);
  };

  const renderItem = ({ item, index }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }) }],
          marginVertical: 6,
        }}
      >
        <BlurView intensity={40} tint="dark" style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => navigation.navigate('ViewPassword', { item })}
            onLongPress={() => copyToClipboard(item.platform, 'Platform')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="lock-closed-outline" size={20} color="#6cf" />
              <Text style={styles.platform}>{item.platform}</Text>
            </View>
            <TouchableOpacity onPress={() => copyToClipboard(item.username, 'Username')}>
              <Text style={styles.username}>
                👤 {item.username}
                <Text style={styles.copyLabel}>  [tap to copy]</Text>
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </Swipeable>
  );

  const toggleSort = () => {
    setSortType(prev => (prev === 'newest' ? 'az' : 'newest'));
    loadPasswords();
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={Keyboard.dismiss} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🔐 Cryptix Vault</Text>
          <Text style={styles.subtitle}>Your passwords secured in style</Text>
        </View>
        <Ionicons name="person-circle-outline" size={32} color="#6cf" />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search platform..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={toggleSort}>
          <Ionicons name="swap-vertical-outline" size={24} color="#6cf" />
        </TouchableOpacity>
      </View>

      {passwords.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="lock-outline" size={48} color="#555" />
          <Text style={styles.empty}>No passwords yet. Tap ➕ to add one.</Text>
        </View>
      ) : (
        <FlatList
          data={passwords.filter(item =>
            item.platform.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadPasswords}
              tintColor="#6cf"
            />
          }
          contentContainerStyle={{ paddingBottom: height * 0.14 }}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddPassword')}>
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.045,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: width * 0.07,
    color: '#6cf',
    fontWeight: '700',
  },
  subtitle: {
    color: '#999',
    fontSize: 13,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderColor: '#333',
    borderWidth: 1,
  },
  search: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderColor: '#2f2f2f',
    borderWidth: 1,
    backgroundColor: 'rgba(30,30,30,0.55)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  platform: {
    fontSize: width * 0.05,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  username: {
    fontSize: width * 0.042,
    color: '#ccc',
  },
  copyLabel: {
    fontSize: 12,
    color: '#6cf',
  },
  fab: {
    backgroundColor: '#6cf',
    borderRadius: 60,
    padding: 18,
    position: 'absolute',
    bottom: height * 0.04,
    right: width * 0.06,
    shadowColor: '#6cf',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  deleteButton: {
    backgroundColor: '#d62828',
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.18,
    marginVertical: 6,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: height * 0.15,
  },
  empty: {
    color: '#777',
    fontSize: 16,
    marginTop: 8,
  },
});
