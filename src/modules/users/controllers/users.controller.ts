import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthUser } from '../../../common/types/auth-user.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    const profile = await this.usersService.getProfile(user);
    return UserResponseDto.fromEntity(profile);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const updated = await this.usersService.updateProfile(user.id, dto);
    return UserResponseDto.fromEntity(updated);
  }

  @Get(':id')
  async getUserById(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<UserResponseDto> {
    const user = await this.usersService.getUserById(id);
    return UserResponseDto.fromEntity(user);
  }
}
