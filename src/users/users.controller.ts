import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Language } from './entities/users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(
    @Body('id') id: number,
    @Body('nickname') nickname: string,
    @Body('password') password: string,
    @Body('language') language: Language,
    @Body('allergy') allergy: string,
    @Body('isVegan') isVegan: boolean,
    @Body('isHalal') isHalal: boolean,
  ) {
    return this.usersService.createUser({
      id,
      nickname,
      password,
      language,
      allergy,
      isVegan,
      isHalal,
    });
  }

  @Get()
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('/:id')
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(+id);
  }

  @Get('/nickname/:nickname')
  getUserByNickname(@Param('nickname') nickname: string) {
    return this.usersService.getUserByNickname(nickname);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(+id);
  }
}
