import { db } from './db.js';

export const getAgents = async () => {
    try {
        const snapshot = await db.collection('agents').get();
        const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return agents;
    } catch (error) {
        console.error("Error fetching agents:", error);
        throw new Error("Could not fetch agents");
    }
};

export const createAgent = async (agentData) => {
    const { name, price, description, author } = agentData;
    if (!name || !price) throw new Error("Nome e preço obrigatórios.");

    try {
        const newAgent = {
            name,
            price,
            description,
            author: author || "Unknown",
            createdAt: new Date().toISOString()
        };
        const ref = await db.collection('agents').add(newAgent);
        return { id: ref.id, ...newAgent };
    } catch (error) {
        console.error("Error creating agent:", error);
        throw new Error("Could not create agent");
    }
};
