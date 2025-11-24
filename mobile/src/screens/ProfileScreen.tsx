import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: 'user', label: 'Edit Profile', onPress: () => {} },
    { icon: 'settings', label: 'Settings', onPress: () => {} },
    { icon: 'bell', label: 'Notifications', onPress: () => {} },
    { icon: 'help-circle', label: 'Help & Support', onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Section Header */}
      <View style={styles.appHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.brainIconContainer}>
            <Feather name="user" size={28} color="#fff" />
          </View>
          <Text style={styles.appHeaderTitle}>Account</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.standaloneIcon} onPress={() => alert('Notifications')}>
            <MaterialCommunityIcons name="bell" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.standaloneIcon} onPress={() => alert('Menu')}>
            <Feather name="menu" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.fullName || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Thoughts</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Circles</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Feather name={item.icon as any} size={22} color="#6b7280" />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Feather name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={signOut}
        activeOpacity={0.8}
      >
        <Feather name="log-out" size={20} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.primary[600],
    borderRadius: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  brainIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appHeaderTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  standaloneIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    padding: 20,
  },
});
