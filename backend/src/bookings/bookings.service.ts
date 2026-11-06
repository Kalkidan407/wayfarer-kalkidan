import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(slotId: number, userId: number, seatsRequested: number) {
    if (!Number.isInteger(slotId) || slotId <= 0) {
      throw new BadRequestException('Invalid slotId');
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('Invalid userId');
    }

    if (!Number.isInteger(seatsRequested) || seatsRequested <= 0) {
      throw new BadRequestException('Seats requested must be a positive integer');
    }

    try {
      return await this.prisma.$transaction(
        async (tx: any) => {
          const slot = await tx.tourSlot.findUnique({
            where: { id: slotId },
            include: { bookings: true },
          });

          if (!slot) {
            throw new BadRequestException('Tour slot not found');
          }

          const totalBookedSeats = slot.bookings.reduce((sum: number, booking: any) => sum + booking.seats, 0);
          const seatsRemaining = slot.capacity - totalBookedSeats;

          if (seatsRemaining <= 0 || seatsRequested > seatsRemaining) {
            throw new BadRequestException('Tour slot is full. No seats left.');
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
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const isConcurrencyConflict =
        error?.code === 'P2034' ||
        error?.code === 'SQLITE_BUSY' ||
        error?.message?.includes('database is locked') ||
        error?.message?.includes('serialization') ||
        error?.message?.includes('write conflict');

      if (isConcurrencyConflict) {
        throw new BadRequestException('Tour slot is full. No seats left.');
      }

      throw error;
    }
  }
}
