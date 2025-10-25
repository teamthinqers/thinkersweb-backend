import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function LearningEngineScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.purple[600]} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Feather name="book-open" size={32} color={colors.purple[600]} />
          <Text style={styles.headerTitle}>Learning Engine</Text>
        </View>
      </View>

      {/* Main Card */}
      <Card style={styles.mainCard}>
        <View style={styles.iconContainer}>
          <Feather name="graduation-cap" size={64} color={colors.purple[600]} />
        </View>
        
        <Text style={styles.title}>Personalize Your Learning</Text>
        <Text style={styles.subtitle}>
          Configure your learning preferences, topics, and delivery formats for an optimized experience
        </Text>

        {/* Features List */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Feather name="bookmark" size={20} color={colors.primary[500]} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Custom Topics</Text>
              <Text style={styles.featureDesc}>Add learning topics that matter to you</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Feather name="book" size={20} color={colors.green[500]} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Resource Types</Text>
              <Text style={styles.featureDesc}>Books, papers, podcasts, and more</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Feather name="layout" size={20} color={colors.primary[500]} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Learning Formats</Text>
              <Text style={styles.featureDesc}>Notes, infographics, summaries</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Feather name="clock" size={20} color={colors.orange[500]} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Daily Time</Text>
              <Text style={styles.featureDesc}>Set your learning time commitment</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Feather name="message-circle" size={20} color={colors.green[500]} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>WhatsApp Prompts</Text>
              <Text style={styles.featureDesc}>Get learning reminders via WhatsApp</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Feather name="briefcase" size={20} color={colors.primary[500]} />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Domain Focus</Text>
              <Text style={styles.featureDesc}>Technology, business, health, and more</Text>
            </View>
          </View>
        </View>

        {/* Coming Soon Notice */}
        <View style={styles.comingSoonCard}>
          <Feather name="clock" size={24} color={colors.purple[600]} />
          <Text style={styles.comingSoonText}>
            Full learning configuration interface coming in next update!
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
  featuresList: {
    alignSelf: 'stretch',
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.purple[500],
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
    marginBottom: 2,
  },
  featureDesc: {
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
