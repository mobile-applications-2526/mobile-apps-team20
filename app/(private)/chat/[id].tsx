import { ChatMessage } from '@/domain/model/entities/chat/chat_message';
import { useChatSocket } from '@/hooks/chat/use_chat_websocket';
import { useChatStore } from '@/store/chat/use_chat_store';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
    const { id } = useLocalSearchParams();
    const chatId = Array.isArray(id) ? id[0] : id;

    // Layout Hooks
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();

    // Socket Hook
    const { incomingMessage, sendMessage } = useChatSocket(chatId);

    // Global State (Zustand)
    const { 
        messages,
        hasMore, 
        fetchHistory, 
        addMessage, 
        clearChat, 
        isLoading 
    } = useChatStore();

    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);

    // Effect: Initial Load & Cleanup
    useEffect(() => {
        // Load history 
        fetchHistory(chatId);

    }, [chatId]);

    // Effect: Listen for new messages from Socket
    useEffect(() => {
        if (incomingMessage) {
            addMessage(incomingMessage);
        }
    }, [incomingMessage]);

    // Send Handler
    const handleSendMessage = () => {
        if (inputText.trim().length === 0) return;

        sendMessage(inputText);
        setInputText("");
        // Scroll down
        setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }, 100);
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isMe = item.isMine;

        return (
            <View
                style={[
                    styles.messageContainer,
                    isMe ? styles.myMessage : styles.otherMessage,
                ]}
            >
                {!isMe && item.senderProfilePictureUrl && (
                    <Image 
                        source={{ uri: item.senderProfilePictureUrl }} 
                        style={styles.avatar}
                    />
                )}
                
                <Text style={[styles.messageText, isMe ? styles.myText : styles.otherText]}>
                    {item.content}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={{ flex: 1 }}>
                {/* Initial Loading State */}
                {isLoading && messages.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2e64e5" />
                    </View>
                ) : (
                    <FlatList
                        inverted
                        ref={flatListRef}
                        data={[...messages].reverse()}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}

                        onEndReached={() => {
                            if (messages.length === 0) return
                            // Prevent fetching if already loading or no more data
                            if (messages.length > 0 && hasMore && !isLoading) {
                                fetchHistory(chatId);
                            }
                        }}
                        onEndReachedThreshold={0.5}

                         // Loading indicator for "End" (Top of screen)
                        ListFooterComponent={
                            isLoading ? <ActivityIndicator size="small" color="#999" style={{ margin: 10 }} /> : null
                        }
                    />
                )}
            </View>

            {/* Input area */}
            <View style={[
                styles.inputContainer,
                { paddingBottom: Math.max(insets.bottom, 10) }
            ]}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f7f7",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageContainer: {
        padding: 10,
        marginVertical: 4,
        maxWidth: "80%",
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8
    },
    myMessage: {
        backgroundColor: "#2e64e5",
        alignSelf: "flex-end",
        borderBottomRightRadius: 0,
    },
    otherMessage: {
        backgroundColor: "#e5e5ea",
        alignSelf: "flex-start",
        borderBottomLeftRadius: 0,
    },
    messageText: {
        fontSize: 16,
    },
    myText: {
        color: "#fff",
    },
    otherText: {
        color: "#000",
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ccc'
    },
    inputContainer: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingTop: 10,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#f1f1f1",
        borderRadius: 20,
    },
    sendButton: {
        marginLeft: 8,
        backgroundColor: "#2e64e5",
        paddingHorizontal: 16,
        justifyContent: "center",
        borderRadius: 20,
        height: 40,
        marginTop: 2
    },
});