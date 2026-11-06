import { Controller, Post, Body, Headers, BadRequestException, Get, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

 
  @Post()
  async submitReview(
    @Body('placeId') placeId: any,
    @Body('rating') rating: any,
    @Body('body') body: string,
    @Headers('X-User-Id') userIdHeader?: string,
  ) {
    if (!userIdHeader) {
      throw new BadRequestException('Missing X-User-Id identification header context');
    }

    const userId = parseInt(userIdHeader, 10);
    const parsedPlaceId = parseInt(placeId, 10);
    const parsedRating = parseInt(rating, 10);

    if (isNaN(userId)) throw new BadRequestException('X-User-Id header must be a numeric ID');
    if (isNaN(parsedPlaceId)) throw new BadRequestException('placeId must be a numeric ID');
    if (isNaN(parsedRating)) throw new BadRequestException('rating must be a numeric value');

    return this.reviewsService.createOrUpdateReview(parsedPlaceId, userId, parsedRating, body);
  }

  // GET /reviews?placeId=1
  @Get()
  async getReviews(@Query('placeId') placeId?: string) {
    const parsedPlaceId = placeId ? parseInt(placeId, 10) : undefined;
    return this.reviewsService.findByPlace(parsedPlaceId);
  }
}
