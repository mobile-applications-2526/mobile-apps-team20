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
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { UserChatsView } from "@/domain/model/entities/chat/user_chat_view";
import { useUserChatListSocket } from "@/hooks/chat/use_user_chat_list_socket";
import { useUserAuthStore } from "@/store/auth/use_auth_store";
import { processImage } from "@/domain/infrastructure/mappers/user_profile_mapper";

export default function ChatsScreen() {
    const router = useRouter();
    const user = useUserAuthStore((state) => state.user);
    
    const { 
        chats, 
        isLoading, 
        fetchUserChats, 
        refreshUserChats,
        hasMore,
        unSeenMessagesCount // This is now a Record<string, number>
    } = useUserChatsStore();

    // Initialize socket listener for the list
    useUserChatListSocket();

    // Reload list logic
    useFocusEffect(
        useCallback(() => {
            if (chats.length === 0) {
                fetchUserChats(); 
            } else {
                refreshUserChats(); 
            }
        }, [chats.length]) 
    );

    const openChat = (
        chatId: string,
        eventName: string,
        eventId: string,
        eventImage?: string,
        currentUnseenCount?: number // Added param to pass count to next screen
    ) => {
        router.push({
            pathname: "/(private)/chat/[id]",
            params: {
                id: chatId,
                name: eventName,
                image: eventImage,
                eventId: eventId,
                unseenCount: currentUnseenCount // Pass it here
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
        const imageUri = processImage(item.eventImage);
        const isMe = item.lastMessage?.senderName === user?.username;
        const lastMessageUsername = isMe ? "You" : item.lastMessage?.senderName;

        // LOGIC FIX:
        // Access the store Record using the ID. 
        // If undefined (not tracked in store yet), fallback to item's initial count.
        const storeCount = unSeenMessagesCount[item.id];
        const count = storeCount !== undefined ? storeCount : item.unseenMessagesCount;
        
        const hasUnseen = count > 0;

        return (
            <TouchableOpacity style={styles.row} onPress={
                () => openChat(
                    item.id, 
                    item.eventName, 
                    item.eventId, 
                    item.eventImage,
                    count // Pass the calculated count
                )
            }>
                {imageUri ? (
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
                            ? `${lastMessageUsername}: ${item.lastMessage.content}`
                            : "Be the first one to say hello 👋"
                        }
                    </Text>
                </View>
                
                {/* Meta column for Time and Badge */}
                <View style={styles.metaContainer}>
                    <Text style={[styles.time, hasUnseen && styles.activeTime]}>
                        {formatTime(item.lastMessage?.sentAt)}
                    </Text>
                    {hasUnseen && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{count}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Chats</Text>
                </View>

                {isLoading && chats.length === 0 ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                ) : (
                    <FlatList
                        data={chats}
                        // This works correctly with Record (object) now
                        extraData={unSeenMessagesCount} 
                        keyExtractor={(item: UserChatsView) => String(item.id)}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingVertical: 12 }}
                        onEndReached={() => {
                            if (chats.length === 0) return;
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
        marginRight: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
    },
    lastMessage: {
        color: "#777",
        marginTop: 2,
    },
    metaContainer: {
        alignItems: "flex-end",
        justifyContent: "center",
        minWidth: 50,
    },
    time: {
        color: "#aaa",
        fontSize: 12,
        marginBottom: 4, 
    },
    activeTime: {
        color: "#25D366",
        fontWeight: "600",
    },
    badge: {
        backgroundColor: "#25D366",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    badgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    emptyText: {
        color: "#888",
        fontSize: 16,
    }
});