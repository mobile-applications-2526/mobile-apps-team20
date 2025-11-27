import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConversationScreen() {
    const router = useRouter();

    const conversations = [
        {
            id: "1",
            name: "Hiking",
            lastMessage: "Are you coming tomorrow?",
            time: "14:32",
        },
        {
            id: "2",
            name: "Studying",
            lastMessage: "Nice! Let's do it.",
            time: "12:11",
        },
        {
            id: "3",
            name: "Football",
            lastMessage: "See you soon 😊",
            time: "09:05",
        }
    ];
    // lets add id later for backend
    const openChat = (id) => {
        router.push("/(chat)/chat_screen");
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.row} onPress={() => openChat(item.id)}>
            <View style={styles.textArea}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView>
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingVertical: 12 }}
                /></SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
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
});
