import { AuthRepository } from './auth.repository';
import { RegisterDto, LoginDto } from './auth.dto';
import { hashPassword, comparePassword } from '../../utils/password.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.utils';
import { AppError } from '../../middleware/errorHandler.middleware';
import { UserRole } from '@prisma/client';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async register(data: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.repository.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Determine registration status
    // Room owners need approval, regular users are auto-approved
    const role = (data.role as UserRole) || UserRole.USER;
    const registrationStatus = role === UserRole.ROOM_OWNER ? 'PENDING' : 'APPROVED';

    // Create user
    const user = await this.repository.createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role,
      registrationStatus,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      message:
        role === UserRole.ROOM_OWNER
          ? 'Registration successful. Waiting for admin approval.'
          : 'Registration successful',
    };
  }

  async login(data: LoginDto) {
    // Find user
    const user = await this.repository.findUserByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if user is approved
    if (user.registrationStatus !== 'APPROVED') {
      throw new AppError('Your account is pending approval', 403);
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.repository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Check if refresh token exists in database
    const storedToken = await this.repository.findRefreshToken(refreshToken);
    if (!storedToken) {
      throw new AppError('Refresh token not found', 401);
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await this.repository.deleteRefreshToken(refreshToken);
      throw new AppError('Refresh token expired', 401);
    }

    // Get user
    const user = await this.repository.findUserById(payload.userId);
    if (!user || user.registrationStatus !== 'APPROVED') {
      throw new AppError('User not found or not approved', 401);
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: newAccessToken,
    };
  }

  async logout(refreshToken: string) {
    try {
      await this.repository.deleteRefreshToken(refreshToken);
    } catch (error) {
      // Ignore errors if token doesn't exist
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
