import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const exists = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('Email already in use');
    }
    const user = this.usersRepository.create(dto);
    return this.usersRepository.save(user);
  }

  async getProfessors() {
    const professors = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.id', 'u.email', 'u.firstName', 'u.lastName'])
      // Support single-value roles stored as text by normalizing to an array at query time
      .where(":role = ANY(string_to_array(u.roles, ','))", { role: 'professor' })
      .andWhere('u.isActive = true')
      .orderBy('u.lastName', 'ASC')
      .getMany();

    return professors.map(p => ({
      id: p.id,
      name: p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.email,
      email: p.email
    }));
  }

  async getStudents() {
    const students = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.id', 'u.email', 'u.firstName', 'u.lastName'])
      // Support single-value roles stored as text by normalizing to an array at query time
      .where(":role = ANY(string_to_array(u.roles, ','))", { role: 'student' })
      .andWhere('u.isActive = true')
      .orderBy('u.lastName', 'ASC')
      .getMany();

    return students.map(s => ({
      id: s.id,
      name: s.firstName && s.lastName ? `${s.firstName} ${s.lastName}` : s.email,
      email: s.email
    }));
  }

  async findAll(query: QueryUsersDto) {
    const { page = 1, limit = 10, search, role, isActive } = query;

    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive');
    }

    const qb = this.usersRepository.createQueryBuilder('u');
    qb.where('1=1');

    if (typeof isActive === 'boolean') {
      qb.andWhere('u.isActive = :isActive', { isActive });
    }

    if (role) {
      // Normalize roles column (text) into an array at query time to match values
      qb.andWhere(":role = ANY(string_to_array(u.roles, ','))", { role });
    }

    if (search) {
      qb.andWhere(
        '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findDirectory(query: QueryUsersDto) {
    const { page = 1, limit = 10, search, role } = query;

    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive');
    }

    const qb = this.usersRepository.createQueryBuilder('u');

    qb.select([
      'u.id',
      'u.firstName',
      'u.lastName',
      'u.email',
      'u.roles',
      'u.isActive',
      'u.faculty',
      'u.career',
      'u.semester',
      'u.organization',
      'u.title',
      'u.about',
      'u.officeHours',
      'u.officeLocation',
      'u.companyDescription',
      'u.companyWebsite',
      'u.companyContact',
      'u.phoneNumber',
      'u.altEmail',
      'u.profileImage',
      'u.updatedAt',
    ]);

    qb.where('u.isActive = :active', { active: true });

    if (role) {
      qb.andWhere(":role = ANY(string_to_array(u.roles, ','))", { role });
    }

    if (search) {
      qb.andWhere(
        `(
          u.firstName ILIKE :search OR
          u.lastName ILIKE :search OR
          u.email ILIKE :search OR
          COALESCE(u.organization, '') ILIKE :search OR
          COALESCE(u.companyContact, '') ILIKE :search
        )`,
        { search: `%${search}%` },
      );
    }

    qb.orderBy('u.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id);

    if (dto.email && dto.email !== user.email) {
      const emailTaken = await this.usersRepository.findOne({ where: { email: dto.email } });
      if (emailTaken) {
        throw new ConflictException('Email already in use');
      }
    }

    const updated = this.usersRepository.merge(user, dto);
    return this.usersRepository.save(updated);
  }

  async remove(id: string): Promise<{ id: string; isActive: boolean }> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.usersRepository.save(user);
    return { id, isActive: user.isActive };
  }
}
