import * as Y from 'yjs';
import { YSocketIO } from 'y-socket.io/dist/server';

export const setupCollaboration = (io) => {
    // Basic socket logic kept for backward compatibility
    io.on('connection', (socket) => {
        socket.on('join-document', (docId) => socket.join(docId));
        socket.on('edit-document', ({ docId, content, user }) => {
            socket.to(docId).emit('document-updated', { content, user });
        });
    });

    // CRDT Layer (Yjs)
    try {
        const ysocketio = new YSocketIO(io);
        ysocketio.initialize();
        console.log("✅ Yjs CRDT Server Initialized");
    } catch(e) {
        console.warn("Yjs init failed (might need specific peer deps), falling back to simple sync.");
    }
};
