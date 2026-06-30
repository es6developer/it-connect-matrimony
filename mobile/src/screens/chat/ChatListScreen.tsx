import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, SIZING } from '../../constants';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Conversation } from '../../types';
import api from '../../services/api';

interface ChatListScreenProps {
  navigation: any;
}

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/api/v1/chat/conversations?page=1&limit=20');
        setConversations(response.data.data || response.data);
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUser = item.participants[0];
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() =>
          navigation.navigate('ChatDetail', {
            conversationId: item.id,
            recipientId: otherUser.id,
            recipientName: otherUser.name,
          })
        }
      >
        <View style={styles.avatarContainer}>
          <Avatar name={otherUser.name} size="lg" isPremium={otherUser.role === 'premium'} />
          {item.unreadCount > 0 && (
            <Badge count={item.unreadCount} style={styles.unreadBadge} />
          )}
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>
              {otherUser.name}
            </Text>
            {item.lastMessage && (
              <Text style={styles.conversationTime}>
                {formatTime(item.lastMessage.createdAt)}
              </Text>
            )}
          </View>
          {item.lastMessage && (
            <Text
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.text}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={() => Alert.alert('Compose', 'New message feature coming soon')}>
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={() => {
          setLoading(true);
          const fetchConversations = async () => {
            try {
              const response = await api.get('/api/v1/chat/conversations?page=1&limit=20');
              setConversations(response.data.data || response.data);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to load conversations');
            } finally {
              setLoading(false);
            }
          };
          fetchConversations();
        }}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="chatbubbles-outline"
              title="No messages yet"
              message="Start a conversation with your matches"
              actionLabel="Find Matches"
              onAction={() => navigation.navigate('Matches')}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  conversationInfo: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: SPACING.sm,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  conversationTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textTertiary,
  },
  lastMessage: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  unreadMessage: {
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
});
