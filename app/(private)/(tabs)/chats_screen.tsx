import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserChatsStore } from "@/store/chat/use_user_chats_store";
import { useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { UserChatsView } from "@/domain/model/entities/chat/user_chat_view";
import { useUserChatListSocket } from "@/hooks/chat/use_user_chat_list_socket";

export default function ChatsScreen() {
    const router = useRouter();
    
    const { 
        chats, 
        isLoading, 
        fetchUserChats, 
        refreshUserChats,
        hasMore
    } = useUserChatsStore();

    // Initialize socket listener for the list
    useUserChatListSocket();

    // Reload list logic
    useFocusEffect(
        useCallback(() => {
            // Initial load (Show Spinner)
            if (chats.length === 0) {
                fetchUserChats(); 
            } 
            // Returning from background or navigating back from a chat
            // Perform a silent refresh to catch up on any missed WebSocket events (e.g., connection drops)
            else {
                refreshUserChats(); 
            }
        }, [chats.length]) // Dependency ensures we distinguish between initial fetch and refresh
    );

    const openChat = (
        chatId: string,
        eventName: string,
        eventId: string,
        eventImage?: string
    ) => {
        router.push({
            pathname: "/(private)/chat/[id]",
            params: {
                id: chatId,
                name: eventName,
                image: eventImage,
                eventId: eventId
            },
        });
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return "";
        }
    };

    const renderItem = ({ item }: { item: UserChatsView }) => {
        const imageUri = item.eventImage ?? "";

        return (
            <TouchableOpacity style={styles.row} onPress={
                () => openChat(
                    item.id, item.eventName, item.eventId,item.eventImage
                )
                }>
                {imageUri !== "" ? (
                    <Image source={{ uri: imageUri }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.placeholderAvatar]}>
                        <Text style={styles.placeholderText}>
                            {item.eventName ? item.eventName.charAt(0).toUpperCase() : "?"}
                        </Text>
                    </View>
                )}

                <View style={styles.textArea}>
                    <Text style={styles.name}>{item.eventName}</Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage 
                            ? `${item.lastMessage.senderName}: ${item.lastMessage.content}`
                            : "Be the first one to say hello 👋"
                        }
                    </Text>
                </View>
                
                <Text style={styles.time}>
                    {formatTime(item.lastMessage?.sentAt)}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                
                {/* Header / AppBar */}
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Chats</Text>
                </View>

                {/* Only show full screen loader if we have NO data */}
                {isLoading && chats.length === 0 ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : (
                    <FlatList
                        data={chats}
                        keyExtractor={(item: UserChatsView) => String(item.id)}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingVertical: 12 }}
                        onEndReached={() => {
                            if (chats.length === 0) return
                            // Prevent fetching if already loading or no more data
                            if (chats.length > 0 && hasMore && !isLoading) {
                                fetchUserChats();
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Text style={styles.emptyText}>No conversations found</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    // New Header Styles
    headerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 12,
        backgroundColor: "#e0e0e0",
    },
    placeholderAvatar: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ddd",
    },
    placeholderText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#555",
    },
    textArea: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
    },
    lastMessage: {
        color: "#777",
        marginTop: 2,
    },
    time: {
        color: "#aaa",
        fontSize: 12,
        marginLeft: 8,
    },
    emptyText: {
        color: "#888",
        fontSize: 16,
    }
});