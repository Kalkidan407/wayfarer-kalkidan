import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';



@Injectable()
export class BookingsService {

  constructor(private prisma: PrismaService) {}

  async createBooking(slotId: number, userId: number, seatsRequested: number) {

    // Execute the logic inside a strict serializable transaction to prevent race conditions
    // to solve the second problem which is to prevent to  not allow users to pick the last remaining slot 
    return this.prisma.$transaction(async (tx :any) => {
      
    
      const slot = await tx.tourSlot.findUnique({
        where: { id: slotId },
        include: { bookings: true },
      });

      if (!slot) {
        throw new BadRequestException('Tour slot not found');
      }

      // 2. Calculate how many seats have already been taken
      const totalBookedSeats = slot.bookings.reduce((sum :number, b :any) => sum + b.seats, 0);
      const seatsRemaining = slot.capacity - totalBookedSeats;

      // 3. Reject the request if there are not enough seats left
      if (seatsRequested > seatsRemaining) {
        throw new BadRequestException(`Not enough seats left. Only ${seatsRemaining} available.`);
      }

     
      const booking = await tx.booking.create({
        data: {
          slotId,
          userId,
          seats: seatsRequested,
        },
      });

      return {
        message: 'Booking confirmed successfully!',
        booking,
      };
    }, {
      isolationLevel: 'Serializable',
    });
  }
}
