import { PermissionsRepository } from './permissions.repository';
import {
  CreatePermissionRequestDto,
  ReviewPermissionRequestDto,
} from './permissions.dto';
import { AppError } from '../../middleware/errorHandler.middleware';
import { CacheService } from '../../utils/cache.utils';

export class PermissionsService {
  private repository: PermissionsRepository;

  constructor() {
    this.repository = new PermissionsRepository();
  }

  async createPermissionRequest(data: CreatePermissionRequestDto, userId: string) {
    // Validate that extended duration requests have a requestedValue
    if (data.requestType === 'EXTENDED_DURATION' && !data.requestedValue) {
      throw new AppError(
        'Extended duration requests must include a requestedValue',
        400
      );
    }

    // Validate requested duration is reasonable
    if (data.requestType === 'EXTENDED_DURATION' && data.requestedValue) {
      if (data.requestedValue < 60 || data.requestedValue > 480) {
        throw new AppError(
          'Requested duration must be between 60 and 480 minutes',
          400
        );
      }
    }

    const request = await this.repository.create({
      userId,
      requestType: data.requestType,
      reason: data.reason,
      requestedValue: data.requestedValue,
    });

    return request;
  }

  async getAllPermissionRequests() {
    return this.repository.findAll();
  }

  async getPendingPermissionRequests() {
    return this.repository.findPending();
  }

  async getPermissionRequestById(id: string) {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new AppError('Permission request not found', 404);
    }
    return request;
  }

  async getUserPermissionRequests(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async reviewPermissionRequest(
    id: string,
    data: ReviewPermissionRequestDto,
    reviewerId: string
  ) {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new AppError('Permission request not found', 404);
    }

    if (request.status !== 'PENDING') {
      throw new AppError('This request has already been reviewed', 400);
    }

    const reviewedRequest = await this.repository.reviewRequest(
      id,
      reviewerId,
      data.approve,
      data.reviewNotes
    );

    // Invalidate user permissions cache
    await CacheService.invalidateUserPermissions(request.userId);

    return {
      request: reviewedRequest,
      message: data.approve
        ? 'Permission request approved'
        : 'Permission request rejected',
    };
  }
}
