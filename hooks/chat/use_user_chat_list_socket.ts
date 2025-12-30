import { ChatMessage } from '@/domain/model/entities/chat/chat_message';
import { showErrorTop } from '@/shared/utils/show_toast_message';
import { useUserAuthStore } from '@/store/auth/use_auth_store';
import { useUserChatsStore } from '@/store/chat/use_user_chats_store';
import { Client } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';

export const useUserChatListSocket = () => {
    const clientRef = useRef<Client | null>(null);
    const token = useUserAuthStore((state) => state.accessToken);
    
    const { updateChatLastMessage } = useUserChatsStore();
    
    const SERVER_ADDRESS = process.env.EXPO_PUBLIC_SERVER_ADDRESS ?? "";

    useEffect(() => {
        if (!token) return;

        // Initialize Stomp Client
        const client = new Client({
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,
            webSocketFactory: () => {
                const url = 'ws://' + SERVER_ADDRESS + '/ws-chat/websocket';
                // @ts-ignore
                return new WebSocket(url, [], {
                    headers: { Authorization: `Bearer ${token}` }
                });
            },
        });

        client.onConnect = () => {
            
            // SUBSCRIBE TO PRIVATE USER QUEUE
            // This allows receiving messages for ANY chat without subscribing to 100 topics
            client.subscribe(`/user/queue/chats`, (message) => {
                if (message.body) {
                    try {
                        const parsedMessage: ChatMessage = JSON.parse(message.body);                        
                        updateChatLastMessage(parsedMessage);
                        
                    } catch (e) {
                        showErrorTop('Error parsing incoming chat message');
                    }
                }
            });
        };

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };

    }, [token]); // Only re-run if token changes (Logout/Login)
};