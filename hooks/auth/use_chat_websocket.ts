import { ChatMessageRequest } from '@/domain/model/dto/chat/chat_message_resquest';
import { ChatMessage } from '@/domain/model/entities/chat/ChatMessage';
import { useUserAuthStore } from '@/store/auth/use_auth_store';
import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';


export const useChatSocket = (chatId: string) => {
    const [incomingMessage, setIncomingMessage] = useState<ChatMessage | null>(null);
    const clientRef = useRef<Client | null>(null);
    const token = useUserAuthStore((state) => state.accessToken);

    useEffect(() => {
        if (!token) return;

        const client = new Client({
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,

            webSocketFactory: () => {
                const url = 'ws://192.168.0.105:8082/ws-chat'; 
                
                // @ts-ignore
                return new WebSocket(url, [], {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            },
        });

        client.onConnect = () => {
            // Subscribing to chat topic
            client.subscribe(`/event/chat/${chatId}`, (message) => {
                if (message.body) {
                    const parsedMessage: ChatMessage = JSON.parse(message.body);
                    setIncomingMessage(parsedMessage);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker error: ' + frame.headers['message']);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [chatId, token]);

    const sendMessage = useCallback((content: string) => {
        if (clientRef.current?.connected) {
            const payload: ChatMessageRequest = { content };
            
            clientRef.current.publish({
                destination: `/app/event/${chatId}/send`,
                body: JSON.stringify(payload),
            });
        }
    }, [chatId]);

    return { incomingMessage, sendMessage };
};