import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface EventItem {
    id: string;
    title: string;
    description?: string;
    date: string;
    location?: string;
    createdAt: string;
}


export default function EventsPage() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newEvent, setNewEvent] = useState<Omit<EventItem, "id" | "createdAt">>({
        title: "",
        description: "",
        date: "",
        location: "",
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const saved = await AsyncStorage.getItem("events");
            if (saved) setEvents(JSON.parse(saved));
        } catch (err) {
            console.log("Error loading events:", err);
        }
    };

    const saveEvents = async (updated: any[]) => {
        try {
            await AsyncStorage.setItem("events", JSON.stringify(updated));
        } catch (err) {
            console.log("Error saving events:", err);
        }
    };

    const handleAddEvent = async () => {
        if (!newEvent.title || !newEvent.date) return;
        const updated = [
            ...events,
            { ...newEvent, id: Date.now().toString(), createdAt: new Date().toISOString() },
        ];
        setEvents(updated);
        await saveEvents(updated);
        setNewEvent({ title: "", description: "", date: "", location: "" });
        setShowForm(false);
    };

    const renderEvent = ({ item }: { item: EventItem }) => (
        <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventMeta}>{item.date}</Text>
            {item.location ? <Text style={styles.eventMeta}>{item.location}</Text> : null}
            {item.description ? <Text style={styles.eventDescription}>{item.description}</Text> : null}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Moments Near You</Text>

            {events.length === 0 ? (
                <Text style={styles.emptyText}>No events yet. Create your first one!</Text>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEvent}
                />
            )}

            {/* Floating Add Button */}
            <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
                <Text style={styles.addButtonText}>＋</Text>
            </TouchableOpacity>

            {/* Modal Form */}
            <Modal visible={showForm} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalHeader}>Create a Moment</Text>

                        <TextInput
                            placeholder="Title"
                            value={newEvent.title}
                            onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Date"
                            value={newEvent.date}
                            onChangeText={(text) => setNewEvent({ ...newEvent, date: text })}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Location"
                            value={newEvent.location}
                            onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Description (optional)"
                            value={newEvent.description}
                            onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                            style={[styles.input, { height: 80 }]}
                            multiline
                        />

                        <View style={styles.formButtons}>
                            <TouchableOpacity onPress={() => setShowForm(false)}>
                                <Text style={styles.cancelButton}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddEvent}>
                                <Text style={styles.saveButton}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 12, marginTop: 30, },
    emptyText: { color: "#999", textAlign: "center", marginTop: 40 },
    eventCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
    },
    eventTitle: { fontSize: 18, fontWeight: "600" },
    eventMeta: { color: "#666", fontSize: 14 },
    eventDescription: { marginTop: 5, color: "#333" },
    addButton: {
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: "#007AFF",
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
    },
    addButtonText: { color: "white", fontSize: 36, lineHeight: 36 },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "white",
        width: "85%",
        borderRadius: 16,
        padding: 20,
        marginBottom: 100,
    },
    modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    formButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    cancelButton: { color: "#555", fontSize: 16 },
    saveButton: { color: "#007AFF", fontWeight: "bold", fontSize: 16 },
});
