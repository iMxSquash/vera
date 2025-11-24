# Instructions Copilot - Projet Vera

## 🎯 Contexte du Projet

Vera est une plateforme de fact-checking en 3 phases :

1. Landing Page + Dashboard d'administration
2. Système de sondage Instagram avec visualisation temps réel
3. Bot d'extraction et vérification automatisée (TikTok + Telegram/Signal)

## 🏗️ Architecture Technique

### Stack Technologique

- **Frontend**: Angular 18 + TypeScript
- **Backend**: NestJS + TypeScript
- **Base de données**: PostgreSQL (Supabase)
- **Styling**: Tailwind CSS v3
- **Monorepo**: Nx Workspace
- **Package Manager**: pnpm

### Structure du Monorepo

```
vera/
├── apps/
│   ├── frontend/     # Application Angular
│   └── backend/      # API NestJS
├── libs/             # Bibliothèques partagées (à créer si nécessaire)
└── context/          # Documentation projet
```

## 📐 Principes de Développement

### Principes SOLID

- **S**ingle Responsibility: Une classe/fonction = une responsabilité
- **O**pen/Closed: Ouvert à l'extension, fermé à la modification
- **L**iskov Substitution: Les sous-types doivent être substituables
- **I**nterface Segregation: Interfaces spécifiques plutôt que génériques
- **D**ependency Inversion: Dépendre d'abstractions, pas d'implémentations

### Principe DRY (Don't Repeat Yourself)

- Extraire la logique répétée dans des services/utilitaires
- Utiliser l'héritage et la composition intelligemment
- Créer des composants/modules réutilisables

## 🎨 Conventions Angular (Frontend)

### Variables d'Environnement

**IMPORTANT**: Toujours utiliser les fichiers d'environnement Angular pour les configurations.

#### Structure des environnements

```
apps/frontend/src/environments/
├── environment.ts
```

#### Exemple de configuration

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  tokenKey: 'vera_admin_token',
  supabaseUrl: 'https://xyz.supabase.co',
  supabaseKey: 'your-key',
};
```

#### Utilisation dans les services

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env'; // ✅ Utiliser l'alias @env

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl; // ✅ Bon

  // ❌ Éviter les valeurs en dur
  // private readonly apiUrl = 'http://localhost:3000/api';
}
```

#### Bonnes pratiques

- ✅ **Toujours** utiliser `environment.*` pour les URLs, clés API, tokens
- ✅ Angular résout automatiquement le bon fichier selon le mode (dev/prod)
- ✅ Ne jamais commiter de clés sensibles (utiliser `.env` pour le backend)
- ❌ **Jamais** de valeurs en dur dans le code (`'http://localhost:3000'`)
- ❌ **Éviter** les chemins relatifs (`'../../environments/environment'`)

### Nomenclature des Fichiers

```
feature.component.ts
feature.component.html
feature.component.css
feature.component.spec.ts
feature.service.ts
feature.model.ts
feature.module.ts
```

### Structure des Composants (Moderne - Angular 14+)

**IMPORTANT**: Toujours utiliser des **standalone components** avec les fonctionnalités modernes d'Angular.

```typescript
import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature.component.html',
  styleUrl: './feature.component.css',
})
export class FeatureComponent {
  // 1. Injection de dépendances (inject function - moderne)
  private readonly featureService = inject(FeatureService);
  private readonly router = inject(Router);

  // 2. Inputs/Outputs (signal-based API - Angular 17+)
  data = input<DataType>(); // Input signal
  dataRequired = input.required<DataType>(); // Input required
  action = output<ActionType>(); // Output (remplace EventEmitter)

  // 3. Signals pour la réactivité (Angular 16+)
  displayData = signal<DataType[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // 4. Computed signals (valeurs dérivées)
  hasData = computed(() => this.displayData().length > 0);
  filteredData = computed(() => this.displayData().filter((item) => item.isActive));

  // 5. Conversion Observable → Signal (si nécessaire)
  featureData = toSignal(this.featureService.getFeatures(), {
    initialValue: [],
  });

  // 6. Méthodes publiques
  handleAction(value: ActionType): void {
    this.action.emit(value);
  }

  loadData(): void {
    this.isLoading.set(true);
    this.featureService.getFeatures().subscribe({
      next: (data) => {
        this.displayData.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  // 7. Pas de ngOnInit, ngOnDestroy, ni constructor
  // Utiliser effect() pour les effets secondaires si nécessaire
  constructor() {
    effect(() => {
      // Se déclenche automatiquement quand data() change
      const currentData = this.data();
      if (currentData) {
        console.log('Data changed:', currentData);
      }
    });
  }
}
```

### Bonnes Pratiques Angular Modernes

- ✅ **Toujours** utiliser `standalone: true`
- ✅ Utiliser `inject()` au lieu du constructor pour l'injection
- ✅ Préférer les **signals** aux propriétés classiques pour la réactivité
- ✅ Utiliser `input()` et `output()` au lieu de `@Input()` et `@Output()`
- ✅ Utiliser `computed()` pour les valeurs dérivées
- ✅ Utiliser `effect()` pour les effets secondaires
- ✅ Utiliser `toSignal()` pour convertir des Observables en signals
- ✅ **Maximiser l'utilisation de `<ng-content>`** pour la composition de composants
- ❌ **Éviter** ngOnInit/ngOnDestroy sauf nécessité absolue
- ❌ **Éviter** le constructor (sauf pour effect())
- ❌ **Éviter** les modules NgModule (utiliser standalone)

### Content Projection avec ng-content

**IMPORTANT**: Privilégier `<ng-content>` pour créer des composants réutilisables et composables.

```typescript
// card.component.ts
@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card">
      <div class="card-header">
        <ng-content select="[header]"></ng-content>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div class="card-footer">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `,
  styleUrl: './card.component.css'
})
export class CardComponent {}

// Utilisation
@Component({
  template: `
    <app-card>
      <h2 header>Titre de la carte</h2>
      <p>Contenu principal de la carte</p>
      <button footer>Action</button>
    </app-card>
  `
})
```

**Avantages de ng-content** :

- ✅ Réutilisabilité maximale
- ✅ Flexibilité du contenu
- ✅ Moins de props/inputs à gérer
- ✅ Composition naturelle des composants
- ✅ Code plus maintenable

### Services Angular (Moderne)

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root', // Singleton par défaut
})
export class FeatureService {
  // Injection moderne avec inject()
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Utiliser des signals pour l'état du service
  private readonly loadingState = signal<boolean>(false);
  private readonly errorState = signal<string | null>(null);

  // Exposer en lecture seule
  readonly isLoading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  // Utiliser des Observables, pas des Promises
  getFeatures(): Observable<FeatureData[]> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.get<FeatureData[]>(`${this.apiUrl}/features`).pipe(
      tap(() => this.loadingState.set(false)),
      catchError((error) => this.handleError(error)),
      shareReplay(1) // Cache si nécessaire
    );
  }

  createFeature(data: CreateFeatureDto): Observable<FeatureData> {
    return this.http.post<FeatureData>(`${this.apiUrl}/features`, data).pipe(catchError((error) => this.handleError(error)));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.loadingState.set(false);

    const errorMessage = error.error?.message || 'Une erreur est survenue';
    this.errorState.set(errorMessage);

    console.error('Error occurred:', error);
    return throwError(() => new Error(errorMessage));
  }
}
```

### Naming Conventions Angular

- **Composants**: `PascalCase` + `Component` suffix → `DashboardComponent`
- **Services**: `PascalCase` + `Service` suffix → `AuthService`
- **Interfaces**: `PascalCase` avec préfixe `I` optionnel → `User` ou `IUser`
- **Enums**: `PascalCase` → `UserRole`
- **Constantes**: `SCREAMING_SNAKE_CASE` → `API_BASE_URL`
- **Variables/Méthodes**: `camelCase` → `getUserData()`
- **Fichiers**: `kebab-case` → `user-profile.component.ts`
- **Sélecteurs**: `app-` prefix → `app-user-profile`

## 🔧 Conventions NestJS (Backend)

### Variables d'Environnement Backend

**IMPORTANT**: Utiliser `@nestjs/config` pour gérer les variables d'environnement.

#### Configuration du module

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      // ❌ JAMAIS de fallback - si une variable est manquante, l'app doit crasher
      ignoreEnvFile: false,
    }),
    // ... autres modules
  ],
})
export class AppModule {}
```

#### Utilisation dans les services

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FeatureService {
  constructor(private readonly configService: ConfigService) {}

  someMethod() {
    // ✅ Bon - Lecture depuis ConfigService
    const dbUrl = this.configService.get<string>('DATABASE_URL');
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    // ❌ Éviter - Accès direct à process.env
    // const dbUrl = process.env.DATABASE_URL;
  }
}
```

#### Bonnes pratiques Backend

- ✅ **Toujours** utiliser `ConfigService` pour accéder aux variables
- ✅ **Typer** les variables avec `get<Type>('KEY')`
- ✅ Valider les variables d'environnement au démarrage (avec Joi ou class-validator)
- ❌ **JAMAIS** de valeurs par défaut/fallback dans `get()` (ex: `.get('KEY', 'default')`)
- ❌ **JAMAIS** d'accès direct à `process.env` dans le code applicatif
- ❌ Si une variable est manquante, l'application **doit échouer au démarrage**

#### Validation des variables (recommandé)

```typescript
// app.module.ts
import * as Joi from 'joi';

ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    BACKEND_URL: Joi.string().required(),
    FRONTEND_URL: Joi.string().required(),
    // ... autres variables obligatoires
  }),
  validationOptions: {
    abortEarly: true, // Arrêter à la première erreur
  },
}),
```

### Structure des Modules

```
feature/
├── dto/
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
├── entities/
│   └── feature.entity.ts
├── feature.controller.ts
├── feature.service.ts
├── feature.module.ts
└── feature.controller.spec.ts
```

### Controllers NestJS

```typescript
@Controller('features')
@ApiTags('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @ApiOperation({ summary: 'Get all features' })
  @ApiResponse({ status: 200, description: 'Success', type: [Feature] })
  async findAll(): Promise<Feature[]> {
    return this.featureService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a feature' })
  @ApiResponse({ status: 201, description: 'Created', type: Feature })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createFeatureDto: CreateFeatureDto): Promise<Feature> {
    return this.featureService.create(createFeatureDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Feature> {
    return this.featureService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFeatureDto: UpdateFeatureDto): Promise<Feature> {
    return this.featureService.update(id, updateFeatureDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.featureService.remove(id);
  }
}
```

### Services NestJS

```typescript
@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>
  ) {}

  async findAll(): Promise<Feature[]> {
    return this.featureRepository.find();
  }

  async findOne(id: string): Promise<Feature> {
    const feature = await this.featureRepository.findOne({ where: { id } });
    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
    return feature;
  }

  async create(createFeatureDto: CreateFeatureDto): Promise<Feature> {
    const feature = this.featureRepository.create(createFeatureDto);
    return this.featureRepository.save(feature);
  }

  async update(id: string, updateFeatureDto: UpdateFeatureDto): Promise<Feature> {
    await this.findOne(id); // Vérifie l'existence
    await this.featureRepository.update(id, updateFeatureDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.featureRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
  }
}
```

### DTOs (Data Transfer Objects)

```typescript
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeatureDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'My Feature',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Feature description',
    required: false,
    example: 'A detailed description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

// DTOs Response pour les réponses
export class FeatureResponseDto {
  @ApiProperty({ description: 'Feature ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'Feature name', example: 'My Feature' })
  name: string;

  @ApiProperty({ description: 'Feature description', example: 'A detailed description' })
  description: string;

  @ApiProperty({ description: 'Creation date', example: '2025-11-24T10:00:00.000Z' })
  created_at: string;
}
```

### Bonnes pratiques DTOs

- ✅ Toujours ajouter `@ApiProperty` sur chaque champ pour Swagger
- ✅ Inclure des `example` concrets pour chaque champ
- ✅ Typer les champs avec `type` si nécessaire pour Swagger
- ✅ Marquer les champs optionnels avec `required: false`
- ✅ Créer des DTOs de réponse séparés (`ResponseDto`) des DTOs de création (`CreateDto`)
- ✅ Exporter les DTOs dans un `index.ts` pour simplifier les imports
- ❌ Ne pas oublier les messages de validation custom

### Swagger - Documentation API Interactive

**IMPORTANT**: Tous les endpoints doivent être documentés avec Swagger pour l'API REST.

#### Décorateurs Swagger sur les controllers

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('features')
@Controller('features')
export class FeatureController {
  @Get()
  @ApiOperation({
    summary: 'Récupérer toutes les features',
    description: 'Retourne une liste de toutes les features disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste récupérée avec succès',
    type: [FeatureResponseDto],
  })
  async findAll(): Promise<FeatureResponseDto[]> {
    return this.featureService.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Créer une feature',
    description: 'Crée une nouvelle feature et la retourne',
  })
  @ApiResponse({
    status: 201,
    description: 'Feature créée avec succès',
    type: FeatureResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createDto: CreateFeatureDto): Promise<FeatureResponseDto> {
    return this.featureService.create(createDto);
  }

  @Get(':id')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Récupérer une feature' })
  @ApiResponse({ status: 200, description: 'Feature trouvée', type: FeatureResponseDto })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Feature non trouvée' })
  async findOne(@Param('id') id: string): Promise<FeatureResponseDto> {
    return this.featureService.findOne(id);
  }
}
```

#### Bonnes pratiques Swagger

- ✅ **Toujours** documenter les endpoints publics avec `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- ✅ Inclure des `description` claires et concises
- ✅ Fournir des `example` réalistes dans les DTOs
- ✅ Lister tous les codes d'erreur possibles avec `@ApiResponse`
- ✅ Utiliser `@ApiBearerAuth('JWT')` pour les endpoints protégés
- ✅ Créer des fichiers `API.md` pour documenter les endpoints en Markdown
- ✅ Tester régulièrement l'interface Swagger UI
- ❌ Ne pas oublier les messages d'erreur dans les réponses (400, 401, 404, etc.)
- ❌ Ne pas créer des endpoints non documentés (la documentation c'est du code)

### Naming Conventions NestJS

- **Controllers**: `PascalCase` + `Controller` → `FeatureController`
- **Services**: `PascalCase` + `Service` → `FeatureService`
- **Modules**: `PascalCase` + `Module` → `FeatureModule`
- **DTOs**: `PascalCase` + `Dto` → `CreateFeatureDto`
- **Entities**: `PascalCase` → `Feature`
- **Interfaces**: `PascalCase` avec préfixe `I` → `IFeatureService`
- **Routes**: `kebab-case` → `/api/user-profiles`
- **Fichiers**: `kebab-case` → `feature.controller.ts`

## 🗄️ Base de Données (Supabase PostgreSQL)

### Naming Conventions DB

- **Tables**: `snake_case` au pluriel → `user_profiles`, `fact_checks`
- **Colonnes**: `snake_case` → `user_id`, `created_at`
- **Clés primaires**: `id` (UUID par défaut avec Supabase)
- **Clés étrangères**: `{table}_id` → `user_id`, `post_id`
- **Timestamps**: Toujours inclure `created_at` et `updated_at`

### Entities TypeORM/Prisma

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
```

## 🎨 Styling avec Tailwind CSS

### Conventions

- Utiliser les classes utilitaires Tailwind en priorité
- Créer des composants réutilisables pour les patterns répétitifs
- Utiliser `@apply` dans les fichiers CSS uniquement pour les composants complexes
- Respecter le design responsive (mobile-first)

```html
<!-- Bon -->
<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Click me</button>

<!-- À éviter (trop de classes custom CSS) -->
<button class="custom-button">Click me</button>
```

## 📦 Gestion des Dépendances

### Installation de Packages

```bash
# Toujours utiliser pnpm
pnpm add <package>          # Dépendance de production
pnpm add -D <package>       # Dépendance de développement
```

## 🧪 Tests

### Conventions de Tests

- **Fichiers**: `*.spec.ts` à côté du fichier source
- **Structure**: Arrange-Act-Assert (AAA)
- **Nommage**: `describe` pour le contexte, `it/test` pour les cas

```typescript
describe('FeatureService', () => {
  let service: FeatureService;

  beforeEach(() => {
    // Arrange
    service = new FeatureService();
  });

  it('should create a feature', () => {
    // Arrange
    const dto = { name: 'Test' };

    // Act
    const result = service.create(dto);

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe('Test');
  });
});
```

## 🔐 Sécurité et Conformité

### RGPD & CNIL

- Implémenter le consentement explicite pour les cookies
- Permettre l'export et la suppression des données utilisateur
- Chiffrer les données sensibles
- Logger les accès aux données personnelles

### Authentification

- Utiliser Supabase Auth ou JWT
- Implémenter des guards NestJS pour protéger les routes
- Utiliser des guards Angular pour protéger les routes frontend

## ♿ Accessibilité (WAI, ARIA, WCAG)

### Bonnes Pratiques

- Utiliser des balises sémantiques HTML5
- Ajouter des attributs ARIA quand nécessaire
- Garantir un contraste suffisant (WCAG AA minimum)
- Support complet au clavier
- Tester avec des lecteurs d'écran

```html
<!-- Bon -->
<button type="button" aria-label="Close dialog" (click)="closeDialog()">
  <span aria-hidden="true">×</span>
</button>

<nav aria-label="Main navigation">
  <!-- ... -->
</nav>
```

## 🚀 Commandes Nx Utiles

```bash
# Développement
pnpm nx serve frontend          # Lance le frontend (port 4200)
pnpm nx serve:dev backend       # Lance le backend avec nodemon (port 3000)

# Build
pnpm nx build frontend --prod
pnpm nx build backend

# Tests
pnpm nx test frontend
pnpm nx test backend
pnpm nx test --all              # Tous les tests

# Lint
pnpm nx lint frontend
pnpm nx lint backend

# Générer des composants/services
pnpm nx g @nx/angular:component my-component --project=frontend
pnpm nx g @nestjs/schematics:service my-service --project=backend
```

## 📝 Git Workflow

### Commits Conventionnels

```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage, pas de changement de code
refactor: refactorisation
test: ajout/modification de tests
chore: tâches de maintenance
```

Exemples:

```
feat(frontend): add user authentication form
fix(backend): resolve database connection issue
docs: update API documentation
refactor(frontend): extract auth logic to service
```

## 🎯 Priorités de Développement

### Phase 1 - Fondations ✅ (TERMINÉE)

- ✅ Setup environnement (Angular, NestJS, Nx, Tailwind)
- ✅ Système d'authentification JWT
- ✅ Structure de base backend (API REST)
- ✅ Connexion Supabase PostgreSQL
- ✅ CORS configuré
- ✅ Documentation API avec Swagger

### Phase 2 - Backend Avancé (EN COURS)

- ⏳ Module Fact-Checking (Intégration API Vera)
- ⏳ Module Sondages Instagram (Backend complet)
- ⏳ Module Contenus TikTok/Telegram
- ✅ Documentation API avec Swagger
- ⏳ Tests unitaires Backend

### Phase 3 - Frontend Vera Web

- ⏳ Landing Page Vera Web (après réception maquettes)
- ⏳ Dashboard Admin (structure)
- ⏳ Intégration des maquettes
- ⏳ Pages Admin (Stats, Sondages, Fact-check, Contenus)

### Phase 4 - Bots d'Extraction & Vérification

- Bot d'extraction TikTok
- Bot Telegram interactif
- Vérification automatique avec Vera

### Phase 5 - Tests & Déploiement

- Tests End-to-End (E2E)
- Tests de performance
- Documentation complète
- Déploiement production

## 📚 Ressources

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Swagger Module](https://docs.nestjs.com/openapi/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Nx Documentation](https://nx.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- API Vera: voir `context/app.md`
- **Documentation locale** :
  - `apps/backend/API.md` - Documentation complète des endpoints
  - `SWAGGER_GUIDE.md` - Guide d'utilisation de Swagger UI
  - `http://localhost:3000/api/docs` - Interface Swagger interactive

---

**Note importante**: Toujours privilégier la lisibilité et la maintenabilité du code plutôt que la performance prématurée. Écrire du code propre, testé et documenté.
