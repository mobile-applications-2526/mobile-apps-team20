import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format, isSameDay, parseISO } from 'date-fns';

import { ChatMessage } from '@/domain/model/entities/chat/chat_message';
import { processProfileImage } from '@/domain/infrastructure/mappers/user_profile_mapper';
import { useConversationPage } from '@/hooks/chat/use_conversation_page';
import { MessageItem } from '@/components/chat/message_item';
import { ChatHeader } from '@/components/chat/chat_header';
import { ChatInput } from '@/components/chat/chat_input';

export default function ConversationScreen() {
    const insets = useSafeAreaInsets();
    
    const {
        user,
        myProfile,
        chatTitle,
        eventChatImage,
        reversedMessages,
        isLoading,
        hasMore,
        inputText,
        initialUnseenCount,
        newMessagesOffset,
        flatListRef,
        chatId,
        setInputText,
        handleSendMessage,
        handleHeaderPress,
        fetchHistory,
        getDateLabel,
        router
    } = useConversationPage();

    const renderMessage = useCallback(({ item, index }: { item: ChatMessage, index: number }) => {
        const isMe = item.senderName === user!.username;

        // --- Avatar Logic ---
        let userPictureUri: string | null = null;
        if (isMe && myProfile?.profileImage) {
            userPictureUri = myProfile.profileImage;
        } else if (item.senderProfilePicture) {
            userPictureUri = processProfileImage(item.senderProfilePicture);
        }

        const currentMessageDate = parseISO(item.sentAt);
        
        // --- Grouping Logic ---
        const olderMessage = reversedMessages[index + 1];
        const showDateHeader = !olderMessage || !isSameDay(currentMessageDate, parseISO(olderMessage.sentAt));

        const newerMessage = reversedMessages[index - 1]; 
        const isLastInGroup = !newerMessage || newerMessage.senderName !== item.senderName;
        const isFirstInGroup = !olderMessage || olderMessage.senderName !== item.senderName || showDateHeader;

        // --- Banner Logic ---
        const currentBannerIndex = (initialUnseenCount + newMessagesOffset) - 1;
        const showUnseenBanner = initialUnseenCount > 0 && index === currentBannerIndex;

        let timeString = "";
        try { timeString = format(currentMessageDate, 'HH:mm'); } catch (e) {}

        return (
            <MessageItem 
                message={item}
                isMe={isMe}
                userPictureUri={userPictureUri}
                timeString={timeString}
                showDateHeader={showDateHeader}
                dateLabel={getDateLabel(item.sentAt)}
                showUnseenBanner={showUnseenBanner}
                unseenCount={initialUnseenCount}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
            />
        );
    }, [reversedMessages, user, myProfile, newMessagesOffset, initialUnseenCount, getDateLabel]);

    return (
        <View style={styles.container}>
            <ChatHeader 
                topInset={insets.top}
                title={chatTitle}
                imageUri={eventChatImage}
                onBackPress={() => router.back()}
                onTitlePress={handleHeaderPress}
            />

            <KeyboardAvoidingView
                style={styles.chatBackground}
                keyboardVerticalOffset={0} 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
            >
                <View style={styles.chatBackground}>
                    {isLoading && reversedMessages.length === 0 ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3797F0" />
                        </View>
                    ) : (
                        <FlatList
                            inverted
                            ref={flatListRef}
                            data={reversedMessages}
                            keyExtractor={(item) => item.id}
                            renderItem={renderMessage}
                            contentContainerStyle={styles.listContent} 
                            onEndReached={() => {
                                if (reversedMessages.length > 0 && hasMore && !isLoading) fetchHistory(chatId);
                            }}
                            onEndReachedThreshold={0.5}
                        />
                    )}
                </View>

                <ChatInput 
                    value={inputText}
                    onChangeText={setInputText}
                    onSend={handleSendMessage}
                    bottomInset={insets.bottom}
                />
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    chatBackground: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 12, 
        paddingBottom: 12, 
    },
});