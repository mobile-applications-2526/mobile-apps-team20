
import { ChatMessage } from '@/domain/model/entities/chat/ChatMessage';
import { useChatSocket } from '@/hooks/auth/use_chat_websocket';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
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

    // 1. Layout Hooks
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();

    // 2. Socket Hook
    const { incomingMessage, sendMessage } = useChatSocket(chatId);

    // Typed State using ChatMessage entity
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);

    // 3. Effect: Listen for new messages from Socket
    useEffect(() => {
        if (incomingMessage) {
            // Direct update since incomingMessage matches ChatMessage interface
            setMessages((prev) => [...prev, incomingMessage]);
            
            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [incomingMessage]);

    // 4. Send Handler
    const handleSendMessage = () => {
        if (inputText.trim().length === 0) return;

        sendMessage(inputText);
        setInputText("");
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
                {/* Avatar: Show only for others if URL exists */}
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
            // Fix: Offset by header height so keyboard doesn't hide input
            keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={{ flex: 1 }}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    // Fix: Add padding bottom so last message isn't hidden
                    contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                />
            </View>

            {/* Input area */}
            <View style={[
                styles.inputContainer,
                // Fix: dynamic padding for Home Indicator
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