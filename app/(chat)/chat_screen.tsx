import { useState, useRef } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet
} from 'react-native';

export default function ChatPage() {

    const [messages, setMessages] = useState([
        { id: "1", text: "Welcome to the chat!", sender: "other" },
        { id: "2", text: "Thank you!", sender: "me" }
    ]);

    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);

    const sendMessage = () => {
        if (inputText.trim().length === 0) return;

        const newMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: "me",
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText("");

        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true })
        }, 100);
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.sender === "me";

        return (
            <View
                style={[
                    styles.messageContainer,
                    isMe ? styles.myMessage : styles.otherMessage,
                ]}
            >
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >   <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ padding: 16 }}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                />
            </SafeAreaView>

            {/* Input area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
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
        color: "#000",
    },

    inputContainer: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 8,
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
    },
});