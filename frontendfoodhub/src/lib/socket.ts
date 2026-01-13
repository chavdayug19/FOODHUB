import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
            transports: ['websocket', 'polling'],
        });
    }
    return socket;
};

export const connectSocket = (): void => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
};

export const disconnectSocket = (): void => {
    if (socket?.connected) {
        socket.disconnect();
    }
};

export const joinOrderRoom = (orderId: string): void => {
    const s = getSocket();
    s.emit('join:order', orderId);
};

export const leaveOrderRoom = (orderId: string): void => {
    const s = getSocket();
    s.emit('leave:order', orderId);
};

export default socket;
