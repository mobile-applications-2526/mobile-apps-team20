import React from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserChatsView } from "@/domain/model/entities/chat/user_chat_view";
import { processImage } from "@/domain/infrastructure/mappers/user_profile_mapper";
import { useChatsPage } from "@/hooks/chat/use_chat_page";

export default function ChatsScreen() {
    const { 
        user,
        chats, 
        isLoading, 
        unSeenMessagesCount, 
        handleOpenChat, 
        handleLoadMore,
        formatTime 
    } = useChatsPage();

    const renderItem = ({ item }: { item: UserChatsView }) => {
        const imageUri = processImage(item.eventImage);
        const isMe = item.lastMessage?.senderName === user?.username;
        const lastMessageUsername = isMe ? "You" : item.lastMessage?.senderName;

        // Calculate unseen messages priority (Store > Entity)
        const storeCount = unSeenMessagesCount[item.id];
        const count = storeCount !== undefined ? storeCount : item.unseenMessagesCount;
        const hasUnseen = count > 0;

        return (
            <TouchableOpacity 
                style={styles.row} 
                onPress={() => handleOpenChat(
                    item.id, 
                    item.eventName, 
                    item.eventId, 
                    item.eventImage,
                    count 
                )}
            >
                {/* Avatar Section */}
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.placeholderAvatar]}>
                        <Text style={styles.placeholderText}>
                            {item.eventName ? item.eventName.charAt(0).toUpperCase() : "?"}
                        </Text>
                    </View>
                )}

                {/* Info Section */}
                <View style={styles.textArea}>
                    <Text style={styles.name}>{item.eventName}</Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage 
                            ? `${lastMessageUsername}: ${item.lastMessage.content}`
                            : "Be the first one to say hello 👋"
                        }
                    </Text>
                </View>
                
                {/* Meta Section (Time & Badge) */}
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
                        extraData={unSeenMessagesCount} 
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingVertical: 12 }}
                        onEndReached={handleLoadMore}
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