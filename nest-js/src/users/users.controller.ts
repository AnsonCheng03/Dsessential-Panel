import {
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(AuthGuard)
  @Post('getAllUsers')
  getAllUsers(@Request() req) {
    if (req.user.role !== 'admin') throw new UnauthorizedException();
    return this.userService.getAllUsers('SID');
  }
}
