import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepository: Repository<UsersModel>,
  ) {}

  async createUser(
    user: Pick<
      UsersModel,
      | 'nickname'
      | 'password'
      | 'language'
      | 'allergy'
      | 'isVegan'
      | 'isHalal'
      | 'id'
    >,
  ) {
    const newUser = await this.userRepository.create(user);

    await this.userRepository.save(newUser);

    return newUser;
  }

  async getAllUsers() {
    return this.userRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async getUserById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async getUserByNickname(nickname: string) {
    return await this.userRepository.findOne({
      where: {
        nickname: nickname,
      },
    });
  }

  async deleteUser(id: number) {
    return await this.userRepository.delete(id);
  }
}
