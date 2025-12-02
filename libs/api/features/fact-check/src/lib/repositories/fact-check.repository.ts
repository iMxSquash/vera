import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FactCheckEntity, ImageEntity } from '../entities/fact-check.entity';

@Injectable()
export class FactCheckRepository {
  constructor(
    @InjectRepository(FactCheckEntity)
    private readonly factCheckRepo: Repository<FactCheckEntity>,

    @InjectRepository(ImageEntity)
    private readonly imageRepo: Repository<ImageEntity>,
  ) {}

  /**
   * FACT CHECK
   */
  createFactCheck(data: Partial<FactCheckEntity>) {
    const entity = this.factCheckRepo.create(data);
    return this.factCheckRepo.save(entity);
  }

  updateFactCheck(id: string, update: Partial<FactCheckEntity>) {
    return this.factCheckRepo.update(id, update);
  }

  findFactCheckById(id: string) {
    return this.factCheckRepo.findOne({ where: { id } });
  }

  /**
   * IMAGES
   */
  saveImage(data: Partial<ImageEntity>) {
    const image = this.imageRepo.create(data);
    return this.imageRepo.save(image);
  }

  findImageById(id: string) {
    return this.imageRepo.findOne({ where: { id } });
  }
}
