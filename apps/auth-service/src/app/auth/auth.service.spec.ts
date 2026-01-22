import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../database/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRepository } from '../database/repositories/refresh-token.repository';
import { CacheService } from '../cache/cache.service';
import { ConflictException } from '@nestjs/common';
import { UserRole } from '@shared/types';

// Mock dependencies
const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};
const mockJwtService = {};
const mockConfigService = { get: jest.fn((key, def) => def) };
const mockRefreshTokenRepository = {};
const mockCacheService = {};

// Mock hashPassword
jest.mock('@shared/utils', () => ({
  hashPassword: jest.fn(async (pw) => 'hashed-' + pw),
}));


describe('AuthService', () => {
  let service: AuthService;
  let userRepository: typeof mockUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RefreshTokenRepository, useValue: mockRefreshTokenRepository },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    jest.clearAllMocks();
  });

  it('should register a new user if email does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashed-password',
      roles: [UserRole.STUDENT],
    });

    const result = await service.register('test@example.com', 'password', 'Test', 'User');
    expect(result.email).toBe('test@example.com');
    expect(userRepository.create).toHaveBeenCalled();
  });

  it('should throw ConflictException if email exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 1 });
    await expect(
      service.register('test@example.com', 'password', 'Test', 'User')
    ).rejects.toThrow(ConflictException);
  });
});
