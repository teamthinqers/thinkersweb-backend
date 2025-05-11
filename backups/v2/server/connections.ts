import { db } from "@db";
import { connections, users, Connection, User } from "@shared/schema";
import { eq, and, or, not } from "drizzle-orm";

export const connectionsService = {
  /**
   * Get all connections for a user
   */
  async getUserConnections(userId: number): Promise<(Connection & { user: User })[]> {
    // Get connections where the user is either the requester or the recipient
    // and the status is 'accepted'
    const userConnections = await db
      .select()
      .from(connections)
      .where(
        and(
          or(
            eq(connections.userId, userId),
            eq(connections.connectedUserId, userId)
          ),
          eq(connections.status, "accepted")
        )
      );

    // For each connection, fetch the other user's details
    const enrichedConnections = await Promise.all(
      userConnections.map(async (connection) => {
        // Determine which user ID is the other party
        const otherUserId = connection.userId === userId
          ? connection.connectedUserId
          : connection.userId;

        // Fetch that user's details
        const user = await db.query.users.findFirst({
          where: eq(users.id, otherUserId)
        });

        if (!user) {
          throw new Error(`User with ID ${otherUserId} not found`);
        }

        return {
          ...connection,
          user
        };
      })
    );

    return enrichedConnections;
  },

  /**
   * Get all pending connection requests for a user
   */
  async getConnectionRequests(userId: number): Promise<(Connection & { user: User })[]> {
    // Get connections where the user is the recipient and status is 'pending'
    const pendingRequests = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.connectedUserId, userId),
          eq(connections.status, "pending")
        )
      );

    // For each request, fetch the requester's details
    const enrichedRequests = await Promise.all(
      pendingRequests.map(async (request) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, request.userId)
        });

        if (!user) {
          throw new Error(`User with ID ${request.userId} not found`);
        }

        return {
          ...request,
          user
        };
      })
    );

    return enrichedRequests;
  },

  /**
   * Create a new connection request
   */
  async createConnectionRequest(userId: number, connectedUserId: number): Promise<Connection> {
    // Check if a connection already exists in either direction
    const existingConnection = await db
      .select()
      .from(connections)
      .where(
        or(
          and(
            eq(connections.userId, userId),
            eq(connections.connectedUserId, connectedUserId)
          ),
          and(
            eq(connections.userId, connectedUserId),
            eq(connections.connectedUserId, userId)
          )
        )
      )
      .limit(1);

    if (existingConnection.length > 0) {
      throw new Error("A connection already exists with this user");
    }

    // Create a new connection request
    const [newConnection] = await db
      .insert(connections)
      .values({
        userId,
        connectedUserId,
        status: "pending"
      })
      .returning();

    return newConnection;
  },

  /**
   * Accept a connection request
   */
  async acceptConnectionRequest(connectionId: number, userId: number): Promise<Connection> {
    // Verify this connection request is for this user
    const connection = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.id, connectionId),
          eq(connections.connectedUserId, userId),
          eq(connections.status, "pending")
        )
      )
      .limit(1);

    if (connection.length === 0) {
      throw new Error("Connection request not found or not pending");
    }

    // Update the connection status to 'accepted'
    const [updatedConnection] = await db
      .update(connections)
      .set({ status: "accepted" })
      .where(eq(connections.id, connectionId))
      .returning();

    return updatedConnection;
  },

  /**
   * Reject a connection request
   */
  async rejectConnectionRequest(connectionId: number, userId: number): Promise<void> {
    // Verify this connection request is for this user
    const connection = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.id, connectionId),
          eq(connections.connectedUserId, userId),
          eq(connections.status, "pending")
        )
      )
      .limit(1);

    if (connection.length === 0) {
      throw new Error("Connection request not found or not pending");
    }

    // Update the connection status to 'rejected'
    await db
      .update(connections)
      .set({ status: "rejected" })
      .where(eq(connections.id, connectionId));
  },

  /**
   * Remove a connection
   */
  async removeConnection(connectionId: number, userId: number): Promise<void> {
    // Verify this connection is for this user
    const connection = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.id, connectionId),
          or(
            eq(connections.userId, userId),
            eq(connections.connectedUserId, userId)
          ),
          eq(connections.status, "accepted")
        )
      )
      .limit(1);

    if (connection.length === 0) {
      throw new Error("Connection not found or not accepted");
    }

    // Delete the connection
    await db
      .delete(connections)
      .where(eq(connections.id, connectionId));
  },

  /**
   * Get connection status between two users
   */
  async getConnectionStatus(userId: number, otherUserId: number): Promise<{
    isConnected: boolean;
    hasPendingRequest: boolean;
    connectionId?: number;
  }> {
    // Check if a connection exists in either direction
    const existingConnection = await db
      .select()
      .from(connections)
      .where(
        or(
          and(
            eq(connections.userId, userId),
            eq(connections.connectedUserId, otherUserId)
          ),
          and(
            eq(connections.userId, otherUserId),
            eq(connections.connectedUserId, userId)
          )
        )
      )
      .limit(1);

    if (existingConnection.length === 0) {
      return {
        isConnected: false,
        hasPendingRequest: false
      };
    }

    const connection = existingConnection[0];

    return {
      isConnected: connection.status === "accepted",
      hasPendingRequest: connection.status === "pending",
      connectionId: connection.id
    };
  },

  /**
   * Search for users that are not already connected or have pending requests
   */
  async searchUsers(query: string, userId: number): Promise<(User & { isConnected: boolean; hasPendingRequest: boolean })[]> {
    // Find users matching the query
    const searchedUsers = await db
      .select()
      .from(users)
      .where(
        and(
          not(eq(users.id, userId)),
          or(
            eq(users.username, query),
            eq(users.email, query),
            eq(users.fullName, query)
          )
        )
      )
      .limit(10);

    // For each user, check their connection status with the current user
    const enrichedUsers = await Promise.all(
      searchedUsers.map(async (user) => {
        const connectionStatus = await this.getConnectionStatus(userId, user.id);
        
        return {
          ...user,
          isConnected: connectionStatus.isConnected,
          hasPendingRequest: connectionStatus.hasPendingRequest
        };
      })
    );

    return enrichedUsers;
  }
};