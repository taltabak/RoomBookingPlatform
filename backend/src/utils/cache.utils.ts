import redis from '../config/redis';

export class CacheService {
  private static TTL = {
    USER_PERMISSIONS: 3600, // 1 hour
    ROOM_DETAILS: 3600, // 1 hour
    ROOM_AVAILABILITY: 300, // 5 minutes
    SEARCH_RESULTS: 600, // 10 minutes
  };

  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // User permissions cache
  static getUserPermissionsKey(userId: string): string {
    return `permissions:${userId}`;
  }

  static async cacheUserPermissions(userId: string, permissions: any): Promise<void> {
    await this.set(
      this.getUserPermissionsKey(userId),
      permissions,
      this.TTL.USER_PERMISSIONS
    );
  }

  static async getUserPermissions(userId: string): Promise<any> {
    return this.get(this.getUserPermissionsKey(userId));
  }

  static async invalidateUserPermissions(userId: string): Promise<void> {
    await this.del(this.getUserPermissionsKey(userId));
  }

  // Room cache
  static getRoomKey(roomId: string): string {
    return `room:${roomId}`;
  }

  static async cacheRoom(roomId: string, room: any): Promise<void> {
    await this.set(this.getRoomKey(roomId), room, this.TTL.ROOM_DETAILS);
  }

  static async getRoom(roomId: string): Promise<any> {
    return this.get(this.getRoomKey(roomId));
  }

  static async invalidateRoom(roomId: string): Promise<void> {
    await this.del(this.getRoomKey(roomId));
  }

  // Room availability cache
  static getRoomAvailabilityKey(roomId: string, date: string): string {
    return `room:${roomId}:availability:${date}`;
  }

  static async cacheRoomAvailability(
    roomId: string,
    date: string,
    availability: any
  ): Promise<void> {
    await this.set(
      this.getRoomAvailabilityKey(roomId, date),
      availability,
      this.TTL.ROOM_AVAILABILITY
    );
  }

  static async getRoomAvailability(roomId: string, date: string): Promise<any> {
    return this.get(this.getRoomAvailabilityKey(roomId, date));
  }

  static async invalidateRoomAvailability(roomId: string, date: string): Promise<void> {
    await this.del(this.getRoomAvailabilityKey(roomId, date));
  }

  static async invalidateAllRoomAvailability(roomId: string): Promise<void> {
    await this.delPattern(`room:${roomId}:availability:*`);
  }
}
