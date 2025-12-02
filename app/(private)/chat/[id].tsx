import { ChatMessage } from '@/domain/model/entities/chat/chat_message';
import { useChatMessageSocket } from '@/hooks/chat/use_chat_messages_socket';
import { useUserAuthStore } from '@/store/auth/use_auth_store';
import { useChatStore } from '@/store/chat/use_chat_messages_store';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format, parseISO, isSameDay, isToday, isYesterday } from 'date-fns';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons

export default function ConversationScreen() {
    const { id } = useLocalSearchParams();
    const chatId = Array.isArray(id) ? id[0] : id;
    const user = useUserAuthStore((state) => state.user);

    // Layout Hooks
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();

    // Socket & Store Hooks
    const { incomingMessage, sendMessage } = useChatMessageSocket(chatId);
    const { messages, hasMore, fetchHistory, addMessage, isLoading, clearChat } = useChatStore();

    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);

    // Memoize reversed messages for consistent index logic in inverted list
    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

    // Initial Load
    useEffect(() => {
        clearChat();
        fetchHistory(chatId);
    }, [chatId]);

    // Incoming Socket Message
    useEffect(() => {
        if (incomingMessage) addMessage(incomingMessage);
    }, [incomingMessage]);

    const handleSendMessage = () => {
        if (inputText.trim().length === 0) return;
        sendMessage(inputText);
        setInputText("");
        
        // Scroll to bottom (visually)
        setTimeout(() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
    };

    // Helper: Date Headers
    const getDateLabel = (dateString: string) => {
        const date = parseISO(dateString);
        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";
        return format(date, "MMM d, yyyy");
    };

    const renderMessage = useCallback(({ item, index }: { item: ChatMessage, index: number }) => {
        const isMe = item.senderName === user!.username;
        const currentMessageDate = parseISO(item.sentAt);
        
        // Logic: Date Header
        // In inverted list, index + 1 is the OLDER message
        const olderMessage = reversedMessages[index + 1];
        const showDateHeader = !olderMessage || !isSameDay(currentMessageDate, parseISO(olderMessage.sentAt));

        // Logic: Visual Grouping
        // index - 1 is the NEWER message
        const newerMessage = reversedMessages[index - 1]; 
        const isLastInGroup = !newerMessage || newerMessage.senderName !== item.senderName;
        const isFirstInGroup = !olderMessage || olderMessage.senderName !== item.senderName || showDateHeader;

        // Time Formatting
        let timeString = "";
        try { timeString = format(currentMessageDate, 'HH:mm'); } catch (e) {}

        // Helper: Render Avatar
        const renderAvatar = () => {
            if (item.senderProfilePictureUrl) {
                return (
                    <Image 
                        source={{ uri: item.senderProfilePictureUrl }} 
                        style={styles.avatar}
                    />
                );
            }
            // Fallback: First letter
            return (
                <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarFallbackText}>
                        {item.senderName.charAt(0).toUpperCase()}
                    </Text>
                </View>
            );
        };

        return (
            <View style={styles.itemContainer}>
                {/* Date Header */}
                {showDateHeader && (
                    <View style={styles.dateHeader}>
                        <Text style={styles.dateHeaderText}>
                            {getDateLabel(item.sentAt)}
                        </Text>
                    </View>
                )}

                <View style={[
                    styles.messageRow, 
                    isMe ? styles.rowMe : styles.rowOther,
                    { marginBottom: isLastInGroup ? 8 : 2 } 
                ]}>
                    {/* Avatar (Left side, only for others) */}
                    {!isMe && (
                        <View style={styles.avatarContainer}>
                            {isLastInGroup && renderAvatar()}
                        </View>
                    )}

                    {/* Message Content Wrapper */}
                    <View style={{ maxWidth: "75%" }}> 
                        {/* Sender Name (Above bubble) */}
                        {!isMe && isFirstInGroup && (
                            <Text style={styles.senderNameLabel}>
                                {item.senderName}
                            </Text>
                        )}

                        {/* Bubble */}
                        <View style={[
                            styles.messageBubble,
                            isMe ? styles.bubbleMe : styles.bubbleOther,
                            // Dynamic Border Radius (Squircle effect)
                            isMe && !isLastInGroup && { borderBottomRightRadius: 4 },
                            isMe && !isFirstInGroup && { borderTopRightRadius: 4 },
                            !isMe && !isLastInGroup && { borderBottomLeftRadius: 4 },
                            !isMe && !isFirstInGroup && { borderTopLeftRadius: 4 },
                        ]}>
                            <View style={styles.bubbleContent}>
                                <Text style={[styles.messageText, isMe ? styles.textMe : styles.textOther]}>
                                    {item.content}
                                </Text>
                                
                                <View style={styles.timeContainer}>
                                    <Text style={[styles.timeText, isMe ? styles.timeMe : styles.timeOther]}>
                                        {timeString}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }, [reversedMessages, user]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            keyboardVerticalOffset={headerHeight} 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
        >
            <View style={styles.chatBackground}>
                {isLoading && messages.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3797F0" />
                    </View>
                ) : (
                    <FlatList
                        inverted
                        ref={flatListRef}
                        data={reversedMessages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        // INCREASED PADDING HERE:
                        // In inverted list, paddingBottom is the SPACE AT THE TOP of the scroll view
                        contentContainerStyle={styles.listContent} 
                        onEndReached={() => {
                            if (messages.length > 0 && hasMore && !isLoading) fetchHistory(chatId);
                        }}
                        onEndReachedThreshold={0.5}
                    />
                )}
            </View>

            {/* Input Area */}
            <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Message..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                    />
                </View>
                
                {/* Circular Send Button with Diagonal Arrow (Paper Plane) */}
                <TouchableOpacity 
                    onPress={handleSendMessage} 
                    disabled={inputText.length === 0}
                    style={[
                        styles.sendButton,
                        { backgroundColor: inputText.length > 0 ? "#3797F0" : "#EFEFEF" }
                    ]}
                >
                     {/* 'send' is the paper plane icon (diagonal arrow) */}
                     <Ionicons 
                        name="send" 
                        size={20} 
                        color={inputText.length > 0 ? "#FFFFFF" : "#A8A8A8"} 
                        style={{ marginLeft: 2 }} // Visual optical centering
                     />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    chatBackground: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 12, 
        // Increased Visual Top Padding (start of conversation)
        paddingBottom: 90, 
    },
    itemContainer: {},
    
    // --- DATE HEADER ---
    dateHeader: {
        alignItems: 'center',
        marginVertical: 16,
        marginBottom: 12,
    },
    dateHeaderText: {
        color: '#8E8E8E',
        fontSize: 12,
        fontWeight: '500',
    },

    // --- ROWS ---
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    rowMe: {
        justifyContent: 'flex-end',
    },
    rowOther: {
        justifyContent: 'flex-start',
    },

    // --- SENDER NAME ---
    senderNameLabel: {
        fontSize: 12,
        color: '#8E8E8E',
        marginLeft: 12,
        marginBottom: 4,
    },

    // --- BUBBLES ---
    messageBubble: {
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minWidth: "18%", 
    },
    bubbleMe: {
        backgroundColor: "#3797F0", 
        marginLeft: 0, 
    },
    bubbleOther: {
        backgroundColor: "#EFEFEF", 
        marginLeft: 8, 
    },

    // --- INNER CONTENT ---
    bubbleContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',       
        alignItems: 'flex-end', 
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 2,
        marginRight: 6, 
    },
    textMe: {
        color: "#FFFFFF",
    },
    textOther: {
        color: "#000000",
    },

    // --- TIME ---
    timeContainer: {
        marginLeft: 'auto', 
        marginBottom: 1,
    },
    timeText: {
        fontSize: 10,
        textAlign: 'right',
    },
    timeMe: {
        color: "rgba(255, 255, 255, 0.7)", 
    },
    timeOther: {
        color: "#8E8E8E", 
    },

    // --- AVATAR ---
    avatarContainer: {
        width: 28,
        height: 28,
        justifyContent: 'flex-end',
        marginRight: 0, 
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#EFEFEF', 
    },
    avatarFallback: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#DBDBDB', 
    },
    avatarFallbackText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },

    // --- INPUT ---
    inputContainer: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingTop: 12,
        backgroundColor: "#FFFFFF",
        alignItems: 'flex-end',
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: "#EFEFEF",
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 4,
        minHeight: 44,
        justifyContent: 'center',
        marginBottom: 4,
    },
    input: {
        fontSize: 16,
        maxHeight: 100,
        color: "#000000",
        paddingTop: 8,
        paddingBottom: 8,
    },
    
    // --- SEND BUTTON ---
    sendButton: {
        marginLeft: 8,
        width: 44,
        height: 44,
        borderRadius: 22, // Circle
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
});