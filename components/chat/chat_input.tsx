import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    bottomInset: number;
}

export const ChatInput = ({ value, onChangeText, onSend, bottomInset }: ChatInputProps) => {
    return (
        <View style={[styles.inputContainer, { paddingBottom: Math.max(bottomInset, 10) }]}>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="Message..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                />
            </View>
            
            <TouchableOpacity 
                onPress={onSend} 
                disabled={value.length === 0}
                style={[
                    styles.sendButton,
                    { backgroundColor: value.length > 0 ? "#3797F0" : "#EFEFEF" }
                ]}
            >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={value.length > 0 ? "#FFFFFF" : "#A8A8A8"} 
                    style={{ marginLeft: 2 }}
                  />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
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