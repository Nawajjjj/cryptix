import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function AddPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const editItem = route.params?.editItem;

  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (editItem) {
      setPlatform(editItem.platform);
      setUsername(editItem.username);
      setPassword(editItem.password);
    }
  }, [editItem]);

  const handleSave = async () => {
    if (!platform || !username || !password) {
      Alert.alert('All fields are required');
      return;
    }

    const entry = { platform, username, password };
    let key;

    if (editItem) {
      key = editItem.key;
    } else {
      const timestamp = new Date().getTime();
      key = `cryptix-${timestamp}`;
    }

    try {
      await SecureStore.setItemAsync(key, JSON.stringify(entry));

      // Update index
      const indexRaw = await SecureStore.getItemAsync('cryptix-index');
      let index = indexRaw ? JSON.parse(indexRaw) : [];

      if (!editItem) {
        index.push(key);
        await SecureStore.setItemAsync('cryptix-index', JSON.stringify(index));
      }

      Alert.alert('Success', editItem ? 'Password updated' : 'Password saved');
      navigation.navigate('Home');
    } catch (err) {
      console.error('Error saving password:', err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {editItem ? '✏️ Edit Password' : '➕ Add New Password'}
      </Text>

      <TextInput
        placeholder="Platform (e.g., Instagram)"
        placeholderTextColor="#888"
        style={styles.input}
        value={platform}
        onChangeText={setPlatform}
      />
      <TextInput
        placeholder="Username or Email"
        placeholderTextColor="#888"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Ionicons name="save" size={22} color="#000" />
        <Text style={styles.saveText}>{editItem ? 'Update' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.05,
  },
  title: {
    fontSize: width * 0.06,
    color: '#6cf',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: height * 0.03,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: width * 0.04,
    marginBottom: height * 0.02,
    borderRadius: 10,
    fontSize: width * 0.045,
    borderWidth: 1,
    borderColor: '#333',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#6cf',
    padding: width * 0.04,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.02,
  },
  saveText: {
    marginLeft: 10,
    fontSize: width * 0.045,
    color: '#000',
    fontWeight: 'bold',
  },
});
