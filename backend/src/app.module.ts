import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PlacesModule } from './places/places.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [PrismaModule, PlacesModule, BookingsModule, ReviewsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
