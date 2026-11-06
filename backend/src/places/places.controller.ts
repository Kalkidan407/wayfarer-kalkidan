import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PlacesService } from './places.service.js';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  //  GET /places?category=Food)
  @Get()
  async getAll(@Query('category') category?: string) {
    return this.placesService.findAll(category);
  }

  // GET /places/1
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.placesService.findOne(id);
  }
}
