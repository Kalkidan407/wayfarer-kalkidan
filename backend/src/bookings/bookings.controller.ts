import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
;

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async bookTour(
    @Body('slotId') slotId: number,
    @Body('seats') seats: number,
    @Headers('X-User-Id') userIdHeader?: string,
  ) {
    if (!userIdHeader) {
      throw new BadRequestException('Missing X-User-Id header identification');
    }
    
    const userId = parseInt(userIdHeader, 10);
    return this.bookingsService.createBooking(slotId, userId, seats);
  }
}
