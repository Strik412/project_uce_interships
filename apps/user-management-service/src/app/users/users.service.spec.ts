import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { ConflictException } from '@nestjs/common';

const mockUsersRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useFactory: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(UserEntity));
    jest.clearAllMocks();
  });

  it('should create a new user if email does not exist', async () => {
    const dto = { email: 'test@example.com', firstName: 'Test', lastName: 'User' };
    const mockUser = { id: 1, ...dto };
    usersRepository.findOne.mockResolvedValue(null);
    usersRepository.create.mockReturnValue(mockUser);
    usersRepository.save.mockResolvedValue(mockUser);

    const result = await service.create(dto as any);
    expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
    expect(usersRepository.create).toHaveBeenCalledWith(dto);
    expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
    expect(result).toBe(mockUser);
  });

  it('should throw ConflictException if email exists', async () => {
    usersRepository.findOne.mockResolvedValue({ id: 1 });
    await expect(
      service.create({ email: 'test@example.com', firstName: 'Test', lastName: 'User' } as any)
    ).rejects.toThrow(ConflictException);
  });
});
