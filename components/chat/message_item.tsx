import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ChatMessage } from '@/domain/model/entities/chat/chat_message';

interface MessageItemProps {
    message: ChatMessage;
    isMe: boolean;
    userPictureUri: string | null;
    timeString: string;
    showDateHeader: boolean;
    dateLabel: string;
    showUnseenBanner: boolean;
    unseenCount: number;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
}

export const MessageItem = memo(({ 
    message, isMe, userPictureUri, timeString, 
    showDateHeader, dateLabel, showUnseenBanner, unseenCount,
    isFirstInGroup, isLastInGroup 
}: MessageItemProps) => {

    const renderAvatar = () => {
        if (userPictureUri) {
            return <Image source={{ uri: userPictureUri }} style={styles.avatar} />;
        }
        return (
            <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarFallbackText}>
                    {message.senderName.charAt(0).toUpperCase()}
                </Text>
            </View>
        );
    };

    return (
        <View>
            {showDateHeader && (
                <View style={styles.dateHeader}>
                    <Text style={styles.dateHeaderText}>{dateLabel}</Text>
                </View>
            )}

            {showUnseenBanner && (
                <View style={styles.unseenBannerContainer}>
                    <View style={styles.unseenBannerBox}>
                            <Text style={styles.unseenBannerText}>{unseenCount} unseen Messages</Text>
                    </View>
                </View>
            )}

            <View style={[
                styles.messageRow, 
                isMe ? styles.rowMe : styles.rowOther,
                { marginBottom: isLastInGroup ? 8 : 2 } 
            ]}>
                {!isMe && (
                    <View style={styles.avatarContainer}>
                        {isLastInGroup && renderAvatar()}
                    </View>
                )}

                <View style={{ maxWidth: "75%" }}> 
                    {!isMe && isFirstInGroup && (
                        <Text style={styles.senderNameLabel}>
                            {message.senderName}
                        </Text>
                    )}

                    <View style={[
                        styles.messageBubble,
                        isMe ? styles.bubbleMe : styles.bubbleOther,
                        isMe && !isLastInGroup && { borderBottomRightRadius: 4 },
                        isMe && !isFirstInGroup && { borderTopRightRadius: 4 },
                        !isMe && !isLastInGroup && { borderBottomLeftRadius: 4 },
                        !isMe && !isFirstInGroup && { borderTopLeftRadius: 4 },
                    ]}>
                        <View style={styles.bubbleContent}>
                            <Text style={[styles.messageText, isMe ? styles.textMe : styles.textOther]}>
                                {message.content}
                            </Text>
                            
                            <View style={styles.timeContainer}>
                                <Text style={[styles.timeText, isMe ? styles.timeMe : styles.timeOther]}>
                                    {timeString}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    dateHeader: {
        alignItems: 'center',
        marginVertical: 16,
        marginBottom: 12,
    },
    dateHeaderText: {
        color: '#8E8E8E',
        fontSize: 12,
        fontWeight: '500',
    },
    unseenBannerContainer: {
        alignItems: 'center',
        marginVertical: 12,
        width: '100%',
        justifyContent: 'center',
    },
    unseenBannerBox: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    unseenBannerText: {
        color: '#1976D2',
        fontSize: 12,
        fontWeight: '600',
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    rowMe: {
        justifyContent: 'flex-end',
    },
    rowOther: {
        justifyContent: 'flex-start',
    },
    senderNameLabel: {
        fontSize: 12,
        color: '#8E8E8E',
        marginLeft: 12,
        marginBottom: 4,
    },
    messageBubble: {
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minWidth: "18%", 
    },
    bubbleMe: {
        backgroundColor: "#3797F0", 
        marginLeft: 0, 
    },
    bubbleOther: {
        backgroundColor: "#EFEFEF", 
        marginLeft: 8, 
    },
    bubbleContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',       
        alignItems: 'flex-end', 
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 2,
        marginRight: 6, 
    },
    textMe: {
        color: "#FFFFFF",
    },
    textOther: {
        color: "#000000",
    },
    timeContainer: {
        marginLeft: 'auto', 
        marginBottom: 1,
    },
    timeText: {
        fontSize: 10,
        textAlign: 'right',
    },
    timeMe: {
        color: "rgba(255, 255, 255, 0.7)", 
    },
    timeOther: {
        color: "#8E8E8E", 
    },
    avatarContainer: {
        width: 28,
        height: 28,
        justifyContent: 'flex-end',
        marginRight: 0, 
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#EFEFEF', 
    },
    avatarFallback: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#DBDBDB', 
    },
    avatarFallbackText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});