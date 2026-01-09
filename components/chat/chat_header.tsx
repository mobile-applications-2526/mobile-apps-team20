import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatHeaderProps {
    topInset: number;
    title: string | string[];
    imageUri: string | null;
    onBackPress: () => void;
    onTitlePress: () => void;
}

export const ChatHeader = ({ topInset, title, imageUri, onBackPress, onTitlePress }: ChatHeaderProps) => {
    return (
        <View style={[styles.headerContainer, { paddingTop: topInset }]}>
            <View style={styles.headerContent}>
                <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.headerInfoContainer} 
                    onPress={onTitlePress}
                    activeOpacity={0.7}
                >
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.headerImage} />
                    ) : (
                        <View style={[styles.headerImage, styles.headerImageFallback]}>
                            <Text style={styles.headerFallbackText}>
                                {typeof title === 'string' && title ? title.charAt(0).toUpperCase() : "?"}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {title || "Chat"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
});