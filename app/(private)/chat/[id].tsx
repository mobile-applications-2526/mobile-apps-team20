import { processImage, processProfileImage } from '@/domain/infrastructure/mappers/user_profile_mapper';
import { ChatMessage } from '@/domain/model/entities/chat/chat_message';
import { useChatMessageSocket } from '@/hooks/chat/use_chat_messages_socket';
import { useUserAuthStore } from '@/store/auth/use_auth_store';
import { useChatStore } from '@/store/chat/use_chat_messages_store';
import { useUserChatsStore } from '@/store/chat/use_user_chats_store';
import { useUserProfileStore } from '@/store/user/use_user_profile_store';
import { Ionicons } from '@expo/vector-icons';
import { format, isSameDay, isToday, isYesterday, parseISO } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export default function ConversationScreen() {
    const router = useRouter();
    
    // Retrieve unseenCount from params (snapshot at the moment of entry)
    const { id, name, image, eventId, unseenCount } = useLocalSearchParams(); 
    
    const chatId = Array.isArray(id) ? id[0] : id;
    const chatTitle = Array.isArray(name) ? name[0] : name; 
    const chatImage = Array.isArray(image) ? image[0] : (image ?? ""); 
    const eventChatImage = processImage(chatImage)
    const eventChatId = Array.isArray(eventId) ? eventId[0] : (eventId); 
    const user = useUserAuthStore((state) => state.user);
    const myProfile = useUserProfileStore((s) => s.profile);

    const { resetUnseenMessagesCount } = useUserChatsStore();
    const { sendLastMessageSeen } = useChatStore();

    // Use useRef to "freeze" the initial unseen count. 
    const initialUnseenCount = useRef(Number(unseenCount) || 0);

    // State to compensate if new messages arrive while inside.
    // If 1 socket message arrives, the banner must shift down 1 position to stay above the correct message.
    const [newMessagesOffset, setNewMessagesOffset] = useState(0);

    // Layout Hooks
    const insets = useSafeAreaInsets();
    
    // Socket & Store Hooks
    const { incomingMessage, sendMessage } = useChatMessageSocket(chatId);
    const { messages, hasMore, fetchHistory, addMessage, isLoading, clearChat } = useChatStore();

    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);

    const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

    useEffect(() => {
        clearChat();

        fetchHistory(chatId);

        return () => {
            // Cleanup on exit 
            resetUnseenMessagesCount(chatId)
            clearChat();
        };
    }, [chatId]);

    // Sync with Server when data is ready
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            // Mark as seen on server and global store
            sendLastMessageSeen(chatId);
            resetUnseenMessagesCount(chatId); 
        }
    }, [isLoading, messages.length, chatId]);

    // Handle incoming messages while chat is open
    useEffect(() => {
        if (incomingMessage) {
            addMessage(incomingMessage);
            // If a new message arrives while watching, increase offset
            // so the banner visually "moves down" and doesn't jump to the new message.
            setNewMessagesOffset(prev => prev + 1);
            
            sendLastMessageSeen(chatId);
        }
    }, [incomingMessage]);

    const handleSendMessage = () => {
        if (inputText.trim().length === 0) return;
        sendMessage(inputText);
        setInputText("");
        setTimeout(() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
    };

    const handleHeaderPress = () => {
        // Navigate to single event details screen
        router.push({
            pathname: "/(private)/event/[id]",
            params: { id: eventChatId }
        });
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

        // Prefer the logged-in user's saved profile image for "me",
        // otherwise fall back to whatever the backend sends for other users.
        let userPictureUri: string | null = null;
        if (isMe && myProfile?.profileImage) {
            userPictureUri = myProfile.profileImage;
        } else if (item.senderProfilePicture) {
            userPictureUri = processProfileImage(item.senderProfilePicture);
        }
        const currentMessageDate = parseISO(item.sentAt);
        
        const olderMessage = reversedMessages[index + 1];
        const showDateHeader = !olderMessage || !isSameDay(currentMessageDate, parseISO(olderMessage.sentAt));

        const newerMessage = reversedMessages[index - 1]; 
        const isLastInGroup = !newerMessage || newerMessage.senderName !== item.senderName;
        const isFirstInGroup = !olderMessage || olderMessage.senderName !== item.senderName || showDateHeader;

        // Banner Logic
        const currentBannerIndex = (initialUnseenCount.current + newMessagesOffset) - 1;
        const showUnseenBanner = initialUnseenCount.current > 0 && index === currentBannerIndex;

        let timeString = "";
        try { timeString = format(currentMessageDate, 'HH:mm'); } catch (e) {}

        const renderAvatar = () => {
            if (userPictureUri) {
                return (
                    <Image 
                        source={{ uri: userPictureUri }} 
                        style={styles.avatar}
                    />
                );
            }
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
                {showDateHeader && (
                    <View style={styles.dateHeader}>
                        <Text style={styles.dateHeaderText}>
                            {getDateLabel(item.sentAt)}
                        </Text>
                    </View>
                )}

                {/* The Unseen Messages Banner */}
                {showUnseenBanner && (
                    <View style={styles.unseenBannerContainer}>
                        <View style={styles.unseenBannerBox}>
                             <Text style={styles.unseenBannerText}>
                                {/* Use .current to keep the number fixed */}
                                {initialUnseenCount.current} unseen Messages
                             </Text>
                        </View>
                    </View>
                )}

                <View style={[
                    styles.messageRow, 
                    isMe ? styles.rowMe : styles.rowOther,
                    { marginBottom: isLastInGroup ? 8 : 2 } 
                ]}>
                    {!isMe && (
                        <View style={styles.avatarContainer}>
                            {isLastInGroup && renderAvatar()}
                        </View>
                    )}

                    <View style={{ maxWidth: "75%" }}> 
                        {!isMe && isFirstInGroup && (
                            <Text style={styles.senderNameLabel}>
                                {item.senderName}
                            </Text>
                        )}

                        <View style={[
                            styles.messageBubble,
                            isMe ? styles.bubbleMe : styles.bubbleOther,
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
    }, [reversedMessages, user, myProfile, newMessagesOffset]); // Added newMessagesOffset to dependencies

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    
                    {/* 1. Back Button (Leftmost) */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    
                    {/* 2. Image + Title (Clickable Group) */}
                    <TouchableOpacity 
                        style={styles.headerInfoContainer} 
                        onPress={handleHeaderPress}
                        activeOpacity={0.7}
                    >
                        {/* Event Image or Fallback Letter */}
                        {eventChatImage ? (
                            <Image source={{ uri: eventChatImage }} style={styles.headerImage} />
                        ) : (
                            <View style={[styles.headerImage, styles.headerImageFallback]}>
                                <Text style={styles.headerFallbackText}>
                                    {chatTitle ? chatTitle.charAt(0).toUpperCase() : "?"}
                                </Text>
                            </View>
                        )}

                        {/* Title (Stuck to the right of the image) */}
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {chatTitle || "Chat"}
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.chatBackground}
                keyboardVerticalOffset={0} 
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
                    
                    <TouchableOpacity 
                        onPress={handleSendMessage} 
                        disabled={inputText.length === 0}
                        style={[
                            styles.sendButton,
                            { backgroundColor: inputText.length > 0 ? "#3797F0" : "#EFEFEF" }
                        ]}
                    >
                          <Ionicons 
                            name="send" 
                            size={20} 
                            color={inputText.length > 0 ? "#FFFFFF" : "#A8A8A8"} 
                            style={{ marginLeft: 2 }}
                          />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    headerContainer: {
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#EFEFEF",
        zIndex: 10,
    },
    headerContent: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8, 
        paddingBottom: 4,
    },
    backButton: {
        padding: 4,
        marginRight: 8, 
    },
    headerInfoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4, 
    },
    headerImage: {
        width: 36, 
        height: 36, 
        borderRadius: 18, 
        marginRight: 10, 
        backgroundColor: '#EFEFEF',
    },
    headerImageFallback: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
    },
    headerFallbackText: {
        fontSize: 16, 
        fontWeight: 'bold',
        color: '#555',
    },
    headerTitle: {
        fontSize: 19, 
        fontWeight: '600',
        color: '#000',
        flex: 1, 
        textAlign: 'left',
    },
    // ----------------------

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
        paddingBottom: 12, 
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

    // --- UNSEEN BANNER (New Styles) ---
    unseenBannerContainer: {
        alignItems: 'center',
        marginVertical: 12,
        width: '100%',
        justifyContent: 'center',
    },
    unseenBannerBox: {
        backgroundColor: '#E3F2FD', // Very light blue
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    unseenBannerText: {
        color: '#1976D2', // Darker blue text
        fontSize: 12,
        fontWeight: '600',
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
        borderRadius: 22, 
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
});