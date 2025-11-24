# 📦 Structure du Monorepo Vera - Nouvelles Conventions Nx

Cette documentation explique la structure reorganisée du projet Vera selon les meilleures pratiques Nx.

## 🏗️ Architecture Globale

```
vera/
├── apps/
│   ├── web/          # Application Angular (frontend) - FINE
│   └── api/          # API NestJS (backend) - FINE
│
├── libs/
│   ├── shared/                      # Libs partagées entre front/back (pur TypeScript)
│   │   ├── models/                  # DTOs, interfaces, enums
│   │   │   └── src/lib/...
│   │   ├── util/                    # Validation, parsing, constantes
│   │   │   └── src/lib/...
│   │   └── types/                   # Types TypeScript communs
│   │       └── src/lib/...
│   │
│   ├── client/                      # Libs Angular (consommées par apps/web)
│   │   └── shared/
│   │       ├── ui/                  # Composants réutilisables (boutons, cartes, modals)
│   │       │   └── src/lib/...
│   │       └── util/                # Helpers, pipes, directives
│   │           └── src/lib/...
│   │
│   └── api/                         # Libs NestJS (consommées par apps/api)
│       ├── shared/
│       │   ├── data-access/         # Repositories, TypeORM/Prisma, DB access
│       │   │   └── src/lib/...
│       │   └── util/                # Guards génériques, decorators custom
│       │       └── src/lib/...
│       └── feature-fact-check/      # Module Fact-Check (domaine métier)
│           └── src/lib/...
│
└── context/                         # Documentation projet
```

## 🎯 Principes Clés

### ✅ À FAIRE

1. **Apps Fines** : Les deux apps (`web` et `api`) ne contiennent que :

   - Le bootstrap principal
   - La configuration root (routing root, modules racine)
   - Les imports depuis `libs/`
   - Les fichiers `main.ts`, `app.module.ts`, `app.routes.ts`

2. **Libs Riches par Domaine** : Toute la logique métier vit dans `libs/`

   - Organisé par domaine (feature) plutôt que par couche technique
   - Petit libs cohésifs plutôt qu'un énorme `shared`

3. **Séparation Clair Front/Back**

   - `libs/client/` → Uniquement consommé par `apps/web`
   - `libs/api/` → Uniquement consommé par `apps/api`
   - `libs/shared/` → Partagé entre les deux apps (pur TypeScript, **aucune dépendance Angular/Nest**)

4. **Pas d'imports Entre Apps**

   ```typescript
   // ❌ JAMAIS
   import { DashboardComponent } from 'apps/web/src/app/dashboard';

   // ✅ TOUJOURS
   import { DashboardComponent } from '@vera/client/dashboard';
   ```

### ❌ À ÉVITER

- ❌ Créer des fichiers directement dans `libs/shared` à la racine
- ❌ Importer une app depuis une autre
- ❌ Mettre de la logique Angular dans `libs/api`
- ❌ Mettre de la logique NestJS dans `libs/client`
- ❌ Importer des dépendances Angular/Nest dans `libs/shared`

## 📂 Structure Détaillée

### `libs/shared/models`

**Contient** : DTOs, interfaces, enums partagés entre front et back

```typescript
// Exemple: libs/shared/models/src/lib/user.model.ts
export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
```

**Utilisé par** :

- `apps/web` pour typer les réponses API
- `apps/api` pour typer les requêtes/réponses

### `libs/shared/util`

**Contient** : Utilitaires purs (validation, parsing, transformations)

```typescript
// Exemple: libs/shared/util/src/lib/validators.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**Utilisé par** : Front et back pour validation commune

### `libs/client/shared/ui`

**Contient** : Composants Angular réutilisables

```
libs/client/shared/ui/src/lib/
├── button/
│   ├── button.component.ts
│   ├── button.component.html
│   └── button.component.css
├── card/
│   └── ...
└── index.ts  // Re-exports
```

**Importation** :

```typescript
import { ButtonComponent, CardComponent } from '@vera/client/shared/ui';
```

### `libs/client/shared/util`

**Contient** : Pipes, directives, helpers Angular

```typescript
// Exemple: libs/client/shared/util/src/lib/safe-html.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  transform(value: string): SafeHtml {
    // ...
  }
}
```

### `libs/api/shared/data-access`

**Contient** : Repositories, Entities TypeORM/Prisma

```typescript
// Exemple: libs/api/shared/data-access/src/lib/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;
}

// Exemple: libs/api/shared/data-access/src/lib/user.repository.ts
@Injectable()
export class UserRepository {
  constructor(private readonly orm: /* TypeORM/Prisma */) {}

  async findByEmail(email: string): Promise<User | null> {
    // ...
  }
}
```

### `libs/api/shared/util`

**Contient** : Guards génériques, decorators, middleware

```typescript
// Exemple: libs/api/shared/util/src/lib/admin.guard.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // ...
  }
}
```

### `libs/api/feature-fact-check`

**Contient** : Module complet Fact-Checking (controllers, services, DTOs)

```
libs/api/feature-fact-check/src/lib/
├── fact-check.module.ts
├── fact-check.controller.ts
├── fact-check.service.ts
├── dto/
│   ├── create-fact-check.dto.ts
│   └── fact-check-response.dto.ts
└── entities/
    └── fact-check.entity.ts
```

**Importation dans `apps/api`** :

```typescript
import { FactCheckModule } from '@vera/api/feature-fact-check';

@Module({
  imports: [FactCheckModule],
})
export class AppModule {}
```

## 🔄 Exemple d'Import Cross-Libs

Créer un user depuis le frontend qui valide et envoie à l'API :

```typescript
// apps/web/src/app/admin/create-user/create-user.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';

// Import depuis libs/shared (partagé)
import { isValidEmail } from '@vera/shared/util';
import { type User, UserRole } from '@vera/shared/models';

// Import depuis libs/client
import { ButtonComponent } from '@vera/client/shared/ui';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [ButtonComponent],
})
export class CreateUserComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', (control) => (isValidEmail(control.value) ? null : { invalid: true })],
  });

  onSubmit() {
    if (this.form.valid) {
      const user: User = {
        id: crypto.randomUUID(),
        email: this.form.value.email!,
        role: UserRole.USER,
      };
      // Envoyer à l'API...
    }
  }
}
```

Backend utilisant le modèle partagé :

```typescript
// apps/api/src/app/user/user.controller.ts
import { Controller, Post, Body } from '@nestjs/common';

// Import depuis libs/shared (partagé)
import { type User } from '@vera/shared/models';

// Import depuis libs/api
import { UserRepository } from '@vera/api/shared/data-access';

@Controller('users')
export class UserController {
  constructor(private userRepository: UserRepository) {}

  @Post()
  async create(@Body() user: User) {
    return this.userRepository.save(user);
  }
}
```

## 📋 Checklist Migration

Pour migrer un fichier existant vers la nouvelle structure :

- [ ] Identifier le domaine (ex: `fact-check`, `auth`, `user`)
- [ ] Déterminer s'il doit être front (`client/`), back (`api/`), ou partagé (`shared/`)
- [ ] Déplacer dans la bonne lib selon le type (feature, ui, util, models, data-access)
- [ ] Mettre à jour tous les imports
- [ ] Ajouter l'alias dans `tsconfig.base.json` si c'est une nouvelle lib
- [ ] Tester que les imports/exports marchent correctement
- [ ] Supprimer le fichier original

## 🚀 Commandes Nx Utiles

```bash
# Voir la structure du workspace
pnpm nx workspace-generator                    # Montre les libs organisées

# Générer une nouvelle librairie
pnpm nx g @nx/angular:library client/shared/new-component --project=web
pnpm nx g @nx/nest:library api/feature-new-feature --project=api

# Vérifier les dépendances entre libs
pnpm nx dep-graph                             # Visualise les dépendances

# Tester les imports
pnpm nx lint <lib-name>
pnpm nx test <lib-name>
```

## 📚 Ressources

- [Nx Workspace Structure Guide](https://nx.dev/concepts/more-concepts/monorepo-structure)
- [Nx Linting & Boundaries](https://nx.dev/nx-api/eslint-plugin)
- Instructions Copilot complètes : `.github/copilot-instructions.md`

---

**Important** : Cette structure est maintenant la source de vérité. Tous les nouveaux fichiers doivent suivre ces conventions !
