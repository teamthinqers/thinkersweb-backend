import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface TopBarProps {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}

export default function TopBar({ onMenuPress, onNotificationPress }: TopBarProps) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>DotSpark</Text>
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <TouchableOpacity onPress={onNotificationPress}>
          <MaterialCommunityIcons name="bell" size={24} color="#1f2937" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMenuPress}>
          <Feather name="menu" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
