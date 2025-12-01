import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, TouchableOpacity, Text } from 'react-native';

// New Screens - exact replica of web app
import MyDotSparkScreen from '../screens/MyDotSparkScreen';
import MyNeuraScreenV2 from '../screens/MyNeuraScreenV2';
import SocialScreenV2 from '../screens/SocialScreenV2';
import ThinQCirclesScreenV2 from '../screens/ThinQCirclesScreenV2';
import CognitiveIdentityScreen from '../screens/CognitiveIdentityScreen';
import LearningEngineScreen from '../screens/LearningEngineScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Header with Hamburger and Notification Bell
function CustomHeader({ navigation }: any) {
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
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>DotSpark</Text>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <TouchableOpacity onPress={() => alert('Notifications')}>
          <MaterialCommunityIcons name="bell" size={24} color="#1f2937" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation?.openDrawer?.()}>
          <Feather name="menu" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Stack navigator for MyDotSpark tab (includes Cognitive Identity and Learning Engine)
function MyDotSparkStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={MyDotSparkScreen} />
      <Stack.Screen name="CognitiveIdentity" component={CognitiveIdentityScreen} />
      <Stack.Screen name="LearningEngine" component={LearningEngineScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingTop: 6,
          paddingBottom: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -2,
        },
        headerStyle: {
          backgroundColor: '#fff',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#1f2937',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Tab.Screen
        name="MyDotSpark"
        component={MyDotSparkStack}
        options={{
          title: 'My DotSpark',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyNeura"
        component={MyNeuraScreenV2}
        options={{
          title: 'MyNeura',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="brain" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreenV2}
        options={{
          title: 'Social',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="globe" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ThinQCircles"
        component={ThinQCirclesScreenV2}
        options={{
          title: 'Circles',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Account',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
