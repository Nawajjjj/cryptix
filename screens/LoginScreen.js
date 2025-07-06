import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(null);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const storedPin = await SecureStore.getItemAsync('cryptix-pin');
      setSavedPin(storedPin);
    })();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const handlePinLogin = async () => {
    if (!savedPin) {
      if (pin.length === 4) {
        await SecureStore.setItemAsync('cryptix-pin', pin);
        Alert.alert('Success', 'PIN has been set!');
        navigation.replace('Home');
      } else {
        triggerShake();
        Alert.alert('Invalid PIN', 'PIN must be 4 digits.');
      }
    } else {
      if (pin === savedPin) {
        navigation.replace('Home');
      } else {
        triggerShake();
        Alert.alert('Incorrect PIN', 'Please enter the correct PIN.');
      }
    }
  };

  const handleBiometricLogin = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!compatible || !enrolled) {
      Alert.alert('Unavailable', 'Biometric authentication is not available.');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Use your biometric to unlock',
    });

    if (result.success) {
      navigation.replace('Home');
    } else {
      Alert.alert('Failed', 'Biometric authentication failed.');
    }
  };

  const handleForgotPin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirm your identity',
    });

    if (result.success) {
      await SecureStore.deleteItemAsync('cryptix-pin');
      setSavedPin(null);
      setPin('');
      Alert.alert('Reset Successful', 'Set a new PIN to continue.');
    } else {
      Alert.alert('Reset Failed', 'Biometric verification failed.');
    }
  };

  return (
    <LinearGradient colors={['#0c0f13', '#1a2230']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Animated.View style={{ opacity: fadeAnim, width: '90%' }}>
          <BlurView intensity={50} tint="dark" style={styles.loginBox}>
            <Text style={styles.brand}>🔐 Cryptix</Text>
            <Text style={styles.title}>
              {savedPin ? 'Enter Your PIN' : 'Set a New 4-Digit PIN'}
            </Text>

            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <TextInput
                style={styles.input}
                value={pin}
                onChangeText={setPin}
                placeholder="••••"
                placeholderTextColor="#999"
                secureTextEntry
                keyboardType="numeric"
                maxLength={4}
              />
            </Animated.View>

            <TouchableOpacity style={styles.button} onPress={handlePinLogin}>
              <Text style={styles.buttonText}>{savedPin ? 'Unlock' : 'Set PIN'}</Text>
            </TouchableOpacity>

            {savedPin && (
              <>
                <TouchableOpacity style={styles.fingerprintButton} onPress={handleBiometricLogin}>
                  <Ionicons name="finger-print" size={30} color="#6cf" />
                  <Text style={styles.fingerprintText}>Use Biometric</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPin} style={styles.forgotButton}>
                  <Text style={styles.forgotText}>Forgot PIN?</Text>
                </TouchableOpacity>
              </>
            )}
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    padding: 28,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#6cf',
    backgroundColor: 'rgba(25, 25, 25, 0.55)',
    alignItems: 'center',
    shadowColor: '#6cf',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 25,
  },
  brand: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6cf',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    width: 200,
    backgroundColor: '#1c1c1e',
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    textAlign: 'center',
    color: '#fff',
    letterSpacing: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6cf',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  fingerprintButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  fingerprintText: {
    color: '#6cf',
    marginTop: 6,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  forgotButton: {
    marginTop: 12,
  },
  forgotText: {
    color: '#aaa',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
