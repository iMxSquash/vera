import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ContentsService } from './contents.service';
import { Content, ContentPlatform, ContentStatus } from './entities/content.entity';
import { CreateContentDto, UpdateContentDto } from './dto';

@ApiTags('contents')
@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau contenu' })
  @ApiResponse({
    status: 201,
    description: 'Contenu créé avec succès',
    type: Content,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createContentDto: CreateContentDto): Promise<Content> {
    return this.contentsService.create(createContentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les contenus' })
  @ApiQuery({ name: 'platform', enum: ContentPlatform, required: false })
  @ApiQuery({ name: 'status', enum: ContentStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Liste des contenus récupérée',
    type: [Content],
  })
  async findAll(
    @Query('platform') platform?: ContentPlatform,
    @Query('status') status?: ContentStatus,
  ): Promise<Content[]> {
    if (platform) {
      return this.contentsService.findByPlatform(platform);
    }
    if (status) {
      return this.contentsService.findByStatus(status);
    }
    return this.contentsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques des contenus' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques récupérées',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byPlatform: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        byStatus: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
      },
    },
  })
  async getStats(): Promise<{
    total: number;
    byPlatform: Record<ContentPlatform, number>;
    byStatus: Record<ContentStatus, number>;
  }> {
    return this.contentsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un contenu par ID' })
  @ApiParam({ name: 'id', description: 'ID du contenu' })
  @ApiResponse({
    status: 200,
    description: 'Contenu trouvé',
    type: Content,
  })
  @ApiResponse({ status: 404, description: 'Contenu non trouvé' })
  async findOne(@Param('id') id: string): Promise<Content> {
    return this.contentsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un contenu' })
  @ApiParam({ name: 'id', description: 'ID du contenu' })
  @ApiResponse({
    status: 200,
    description: 'Contenu mis à jour',
    type: Content,
  })
  @ApiResponse({ status: 404, description: 'Contenu non trouvé' })
  async update(
    @Param('id') id: string,
    @Body() updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    return this.contentsService.update(id, updateContentDto);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Marquer un contenu comme vérifié' })
  @ApiParam({ name: 'id', description: 'ID du contenu' })
  @ApiResponse({
    status: 200,
    description: 'Contenu marqué comme vérifié',
    type: Content,
  })
  @ApiResponse({ status: 404, description: 'Contenu non trouvé' })
  async markAsVerified(
    @Param('id') id: string,
    @Body() body: { verificationResult: string; factCheckId?: string },
  ): Promise<Content> {
    return this.contentsService.markAsVerified(id, body.verificationResult, body.factCheckId);
  }

  @Patch(':id/fail')
  @ApiOperation({ summary: 'Marquer un contenu comme échoué' })
  @ApiParam({ name: 'id', description: 'ID du contenu' })
  @ApiResponse({
    status: 200,
    description: 'Contenu marqué comme échoué',
    type: Content,
  })
  @ApiResponse({ status: 404, description: 'Contenu non trouvé' })
  async markAsFailed(
    @Param('id') id: string,
    @Body() body: { errorMessage: string },
  ): Promise<Content> {
    return this.contentsService.markAsFailed(id, body.errorMessage);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un contenu' })
  @ApiParam({ name: 'id', description: 'ID du contenu' })
  @ApiResponse({ status: 204, description: 'Contenu supprimé' })
  @ApiResponse({ status: 404, description: 'Contenu non trouvé' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.contentsService.remove(id);
  }
}