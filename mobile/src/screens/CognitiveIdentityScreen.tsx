import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function CognitiveIdentityScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.purple[600]} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Feather name="brain" size={32} color={colors.purple[600]} />
          <Text style={styles.headerTitle}>Cognitive Identity</Text>
        </View>
      </View>

      {/* Main Card */}
      <Card style={styles.mainCard}>
        <View style={styles.iconContainer}>
          <Feather name="fingerprint" size={64} color={colors.purple[600]} />
        </View>
        
        <Text style={styles.title}>Define Your Cognitive Fingerprint</Text>
        <Text style={styles.subtitle}>
          Configure parameters that reflect your unique thinking patterns and mental frameworks
        </Text>

        {/* Parameters List */}
        <View style={styles.parametersList}>
          <View style={styles.parameterItem}>
            <Feather name="bar-chart-2" size={20} color={colors.primary[500]} />
            <View style={styles.parameterText}>
              <Text style={styles.parameterTitle}>Memory Bandwidth</Text>
              <Text style={styles.parameterDesc}>Short Burst vs Deep Retainer</Text>
            </View>
          </View>

          <View style={styles.parameterItem}>
            <Feather name="layers" size={20} color={colors.green[500]} />
            <View style={styles.parameterText}>
              <Text style={styles.parameterTitle}>Thought Complexity</Text>
              <Text style={styles.parameterDesc}>Simple Direct vs Complex Layered</Text>
            </View>
          </View>

          <View style={styles.parameterItem}>
            <Feather name="zap" size={20} color={colors.primary[500]} />
            <View style={styles.parameterText}>
              <Text style={styles.parameterTitle}>Cognitive Pace</Text>
              <Text style={styles.parameterDesc}>Deep vs Rapid Processing</Text>
            </View>
          </View>

          <View style={styles.parameterItem}>
            <Feather name="target" size={20} color={colors.primary[500]} />
            <View style={styles.parameterText}>
              <Text style={styles.parameterTitle}>Signal Focus</Text>
              <Text style={styles.parameterDesc}>Narrow Beam vs Wide Scanner</Text>
            </View>
          </View>

          <View style={styles.parameterItem}>
            <Feather name="sliders" size={20} color={colors.orange[500]} />
            <View style={styles.parameterText}>
              <Text style={styles.parameterTitle}>Decision Making</Text>
              <Text style={styles.parameterDesc}>Intuitive vs Logical Thinking</Text>
            </View>
          </View>
        </View>

        {/* Coming Soon Notice */}
        <View style={styles.comingSoonCard}>
          <Feather name="clock" size={24} color={colors.purple[600]} />
          <Text style={styles.comingSoonText}>
            Full configuration interface coming in next update!
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.purple[900],
  },
  mainCard: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.purple[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  parametersList: {
    alignSelf: 'stretch',
    gap: 16,
    marginBottom: 32,
  },
  parameterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.purple[500],
  },
  parameterText: {
    flex: 1,
  },
  parameterTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
    marginBottom: 2,
  },
  parameterDesc: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
  },
  comingSoonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.purple[50],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.purple[200],
    alignSelf: 'stretch',
  },
  comingSoonText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.purple[900],
  },
});
