import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const { width, height } = Dimensions.get('window');

export default function ViewPasswordScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params || {};

  const [showPassword, setShowPassword] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 4,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -4,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCopy = async () => {
    if (!item?.password || !showPassword) {
      triggerShake();
      Alert.alert('Password Hidden', 'Tap the eye icon to reveal the password first.');
      return;
    }

    await Clipboard.setStringAsync(item.password);
    Alert.alert('Copied', 'Password copied to clipboard');
  };

  const copyField = async (value, label) => {
    await Clipboard.setStringAsync(value);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❗ No password details provided.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🔐 Password Details</Text>

      <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
        <TouchableOpacity onLongPress={() => copyField(item.platform, 'Platform')}>
          <Text style={styles.label}>Platform:</Text>
          <Text style={styles.value}>{item.platform}</Text>
        </TouchableOpacity>

        <TouchableOpacity onLongPress={() => copyField(item.username, 'Username')}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{item.username}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Password:</Text>
        <View style={styles.passwordRow}>
          <Text style={styles.value}>
            {showPassword ? item.password : '••••••••••'}
          </Text>

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#6cf"
              style={styles.icon}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCopy}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={22} color="#6cf" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('AddPassword', { editItem: item })}
      >
        <Ionicons name="create-outline" size={20} color="#000" />
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: width * 0.06,
    paddingTop: height * 0.05,
  },
  heading: {
    fontSize: width * 0.065,
    color: '#6cf',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: height * 0.03,
  },
  card: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    padding: width * 0.05,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#6cf',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: height * 0.04,
  },
  label: {
    color: '#aaa',
    fontSize: width * 0.04,
    marginTop: 10,
  },
  value: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  icon: {
    marginLeft: 12,
  },
  editBtn: {
    flexDirection: 'row',
    backgroundColor: '#6cf',
    padding: width * 0.04,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6cf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  editText: {
    marginLeft: 10,
    fontSize: width * 0.045,
    color: '#000',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: width * 0.045,
    marginTop: height * 0.2,
  },
});
