import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GiftedChat, Bubble, Send, InputToolbar, IMessage, Day } from 'react-native-gifted-chat';
import { COLORS, FONTS, SPACING, SIZING } from '../../constants';
import { Avatar } from '../../components/ui/Avatar';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';

interface ChatScreenProps {
  navigation: any;
  route: {
    params: {
      conversationId: string;
      userId: string;
      userName: string;
    };
  };
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { conversationId, userId, userName } = route.params;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { emit, on } = useSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/api/v1/chat/conversations/${conversationId}/messages?page=1&limit=50`);
        const data = response.data.data || response.data;
        const formatted: IMessage[] = (Array.isArray(data) ? data : []).map((msg: any) => ({
          _id: msg._id,
          text: msg.text,
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.user._id,
            name: msg.user.name,
          },
        }));
        setMessages(formatted.reverse());
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to load messages');
      }
    };
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    const cleanup = on('typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    });
    return cleanup;
  }, [on]);

  const onSend = useCallback(
    async (newMessages: IMessage[]) => {
      const message = newMessages[0];
      setMessages((prev) => GiftedChat.append(prev, newMessages));

      try {
        const response = await api.post('/api/v1/chat/messages', {
          conversationId,
          content: message.text,
          messageType: 'text',
        });
        const sent = response.data.data || response.data;
        setMessages((prev) =>
          prev.map((m) =>
            m._id === message._id
              ? { ...m, _id: sent._id, sent: true, received: true }
              : m
          )
        );
      } catch (error: any) {
        setMessages((prev) =>
          prev.map((m) => (m._id === message._id ? { ...m, failed: true } : m))
        );
        Alert.alert('Error', error.response?.data?.message || 'Failed to send message');
      }
    },
    [conversationId]
  );

  const handleTyping = () => {
    emit('typing', { chatId: conversationId });
  };

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: styles.bubbleLeft,
          right: styles.bubbleRight,
        }}
        textStyle={{
          left: styles.bubbleTextLeft,
          right: styles.bubbleTextRight,
        }}
        timeTextStyle={{
          left: styles.bubbleTimeLeft,
          right: styles.bubbleTimeRight,
        }}
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props} containerStyle={styles.sendContainer}>
        <View style={styles.sendButton}>
          <Ionicons name="send" size={20} color={COLORS.white} />
        </View>
      </Send>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputToolbarPrimary}
        textInputStyle={styles.textInput}
      />
    );
  };

  const renderDay = (props: any) => {
    return (
      <Day
        {...props}
        textStyle={styles.dayText}
        containerStyle={styles.dayContainer}
      />
    );
  };

  const renderAvatar = (props: any) => {
    if (props.currentMessage?.user?._id === 'me') return null;
    return (
      <Avatar
        name={props.currentMessage?.user?.name}
        size="sm"
        style={styles.chatAvatar}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Avatar name={userName} size="sm" isOnline />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{userName}</Text>
          <Text style={styles.headerStatus}>
            {isTyping ? 'Typing...' : 'Online'}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="ellipsis-vertical" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{ _id: 'me', name: 'You' }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderInputToolbar={renderInputToolbar}
        renderDay={renderDay}
        renderAvatar={renderAvatar}
        onInputTextChanged={handleTyping}
        isTyping={isTyping}
        placeholder="Type a message..."
        showUserAvatar={false}
        scrollToBottom
        scrollToBottomComponent={() => (
          <View style={styles.scrollToBottom}>
            <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
          </View>
        )}
        minComposerHeight={44}
        maxComposerHeight={120}
        textInputProps={{
          style: styles.composerInput,
        }}
        alwaysShowSend
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
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  headerBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
  },
  headerStatus: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatar: {
    marginRight: SPACING.sm,
  },
  bubbleLeft: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 4,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleRight: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    borderTopRightRadius: 4,
    paddingHorizontal: 4,
    marginVertical: 2,
  },
  bubbleTextLeft: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
  },
  bubbleTextRight: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
  },
  bubbleTimeLeft: {
    color: COLORS.textTertiary,
    fontSize: 10,
  },
  bubbleTimeRight: {
    color: COLORS.white + 'CC',
    fontSize: 10,
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputToolbar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  inputToolbarPrimary: {
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    maxHeight: 100,
    marginHorizontal: SPACING.sm,
  },
  composerInput: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
  },
  dayText: {
    color: COLORS.textTertiary,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
  },
  dayContainer: {
    marginVertical: SPACING.sm,
  },
  scrollToBottom: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
