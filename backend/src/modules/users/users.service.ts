import { UsersRepository } from './users.repository';
import { UpdateUserDto, ApproveUserDto } from './users.dto';
import { AppError } from '../../middleware/errorHandler.middleware';
import { CacheService } from '../../utils/cache.utils';

export class UsersService {
  private repository: UsersRepository;

  constructor() {
    this.repository = new UsersRepository();
  }

  async getAllUsers() {
    return this.repository.findAll();
  }

  async getUserById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateUser(id: string, data: UpdateUserDto, requestingUserId: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Users can only update their own profile (unless admin)
    if (id !== requestingUserId) {
      throw new AppError('Forbidden: Cannot update another user', 403);
    }

    const updatedUser = await this.repository.update(id, data);

    // Invalidate cache
    await CacheService.invalidateUserPermissions(id);

    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    else if (user.role === 'ADMIN') {
      throw new AppError('Cannot delete an admin user', 403);
    }

    await this.repository.delete(id);

    // Invalidate cache
    await CacheService.invalidateUserPermissions(id);

    return { message: 'User deleted successfully' };
  }

  async getPendingRoomOwners() {
    return this.repository.findPendingRoomOwners();
  }

  async approveUser(id: string, data: ApproveUserDto) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'ROOM_OWNER') {
      throw new AppError('Only room owner registrations require approval', 400);
    }

    const status = data.approve ? 'APPROVED' : 'REJECTED';
    const updatedUser = await this.repository.updateRegistrationStatus(id, status);

    // Invalidate cache
    await CacheService.invalidateUserPermissions(id);

    return {
      user: updatedUser,
      message: data.approve
        ? 'Room owner approved successfully'
        : 'Room owner rejected',
    };
  }
}
