# Strapi CMS Integration Guide

This document provides comprehensive documentation for using Strapi CMS in the
Astro application.

## Table of Contents

- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Usage Examples](#usage-examples)
- [TypeScript Types](#typescript-types)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Setup

### Installation

The Strapi client is already installed via `@strapi/client`. No additional setup
is required.

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=your_strapi_api_token_here
STRAPI_API_PREFIX=/api
```

**Important**: Never commit the `.env` file to version control. The
`.env.example` file serves as a template.

## Environment Variables

### Required Variables

- `STRAPI_URL` - The base URL of your Strapi instance (default:
  `http://localhost:1337`)
- `STRAPI_TOKEN` - API token for authenticated requests (required for protected
  endpoints)
- `STRAPI_API_PREFIX` - API prefix path (default: `/api`)

### Accessing Environment Variables

Environment variables are accessed via `import.meta.env` in Astro:

```typescript
const strapiUrl = import.meta.env.STRAPI_URL;
const strapiToken = import.meta.env.STRAPI_TOKEN;
```

## Architecture

The Strapi integration is organized into several utility modules:

```
src/
├── utils/
│   ├── strapi.ts              # Core client utilities
│   ├── strapi-server.ts        # Server-side helpers
│   ├── strapi-client.ts        # Client-side helpers
│   └── strapi-helpers.ts       # Query builders and transformers
└── types/
    └── strapi.ts               # TypeScript type definitions
```

### Server-Side vs Client-Side

- **Server-Side** (`strapi-server.ts`): Used in Astro page frontmatter and
  server components. Fetches data at build/request time.
- **Client-Side** (`strapi-client.ts`): Used in browser components. Includes
  caching and request deduplication.

## Usage Examples

### Server-Side Usage (Astro Pages)

#### Fetching a Collection

```typescript
---
// src/pages/blog/index.astro
import { fetchStrapiCollection } from '../../utils/strapi-server';

const posts = await fetchStrapiCollection('posts', {
  populate: '*',
  sort: ['createdAt:desc'],
  pagination: {
    page: 1,
    pageSize: 10,
  },
});
---

<h1>Blog Posts</h1>
{posts.data.map((post) => (
  <article>
    <h2>{post.title}</h2>
    <p>{post.excerpt}</p>
  </article>
))}
```

#### Fetching a Single Entry by ID

```typescript
---
// src/pages/blog/[id].astro
import { fetchStrapiSingle } from '../../utils/strapi-server';

const { id } = Astro.params;
const post = await fetchStrapiSingle('posts', id, {
  populate: '*',
});

if (!post) {
  return Astro.redirect('/404');
}
---

<article>
  <h1>{post.title}</h1>
  <div set:html={post.content} />
</article>
```

#### Fetching by Slug

```typescript
---
// src/pages/blog/[slug].astro
import { fetchStrapiBySlug } from '../../utils/strapi-server';

const { slug } = Astro.params;
const post = await fetchStrapiBySlug('posts', slug, {
  populate: ['author', 'image'],
});

if (!post) {
  return Astro.redirect('/404');
}
---

<article>
  <h1>{post.title}</h1>
  {post.image && (
    <img src={post.image.url} alt={post.image.alternativeText} />
  )}
</article>
```

#### Fetching All Entries (with Pagination)

```typescript
---
// src/pages/blog/all.astro
import { fetchAllStrapiEntries } from '../../utils/strapi-server';

const allPosts = await fetchAllStrapiEntries('posts', {
  populate: '*',
  sort: ['createdAt:desc'],
});
---

<h1>All Posts ({allPosts.length})</h1>
{allPosts.map((post) => (
  <article>
    <h2>{post.title}</h2>
  </article>
))}
```

### Client-Side Usage (Browser Components)

#### Fetching in Client Components

```typescript
---
// src/components/PostList.astro
---

<div id="post-list"></div>

<script>
  import { fetchStrapiCollectionClient } from '../utils/strapi-client';

  async function loadPosts() {
    const { data } = await fetchStrapiCollectionClient('posts', {
      populate: '*',
      sort: ['createdAt:desc'],
    });

    const container = document.getElementById('post-list');
    container.innerHTML = data.map(post => `
      <article>
        <h2>${post.title}</h2>
        <p>${post.excerpt}</p>
      </article>
    `).join('');
  }

  loadPosts();
</script>
```

#### Using Native Fetch API

```typescript
import { fetchStrapiAPI } from '../utils/strapi-client';

const posts = await fetchStrapiAPI('/api/posts?populate=*');
```

### Working with Images

#### Server-Side Image Handling

```typescript
---
import { getStrapiImageURL, getStrapiImageURLWithFormat } from '../../utils/strapi';

const post = await fetchStrapiSingle('posts', id);
const imageUrl = getStrapiImageURL(post.image);
const thumbnailUrl = getStrapiImageURLWithFormat(post.image, 'thumbnail');
---

<img src={imageUrl} alt={post.image?.alternativeText} />
<img src={thumbnailUrl} alt="Thumbnail" />
```

### Query Building

#### Advanced Filtering

```typescript
import { buildStrapiQuery } from '../../utils/strapi-helpers';

const query = buildStrapiQuery({
  filters: {
    title: {
      $contains: 'Astro',
    },
    publishedAt: {
      $notNull: true,
    },
    author: {
      name: {
        $eq: 'John Doe',
      },
    },
  },
  populate: {
    author: true,
    image: true,
    category: {
      populate: '*',
    },
  },
  sort: ['createdAt:desc'],
  pagination: {
    page: 1,
    pageSize: 10,
  },
});

const posts = await fetchStrapiCollection('posts', query);
```

#### Populate Relations

```typescript
import { buildPopulateQuery } from '../../utils/strapi-helpers';

// Populate all relations
const query1 = buildStrapiQuery({
  populate: '*',
});

// Populate specific relations
const query2 = buildStrapiQuery({
  populate: ['author', 'image', 'category'],
});

// Nested populate
const query3 = buildStrapiQuery({
  populate: {
    author: {
      populate: ['avatar', 'company'],
    },
    image: true,
  },
});
```

## TypeScript Types

### Defining Content Type Interfaces

Create TypeScript interfaces for your Strapi content types:

```typescript
// src/types/content.ts
import type { FlattenedStrapiEntity, StrapiImage } from './strapi';

export interface Post extends FlattenedStrapiEntity<{
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  image?: StrapiImage;
  author?: Author;
  category?: Category;
}> {}

export interface Author extends FlattenedStrapiEntity<{
  name: string;
  email: string;
  avatar?: StrapiImage;
}> {}
```

### Using Typed Functions

```typescript
import type { Post } from '../types/content';
import { fetchStrapiCollection } from '../utils/strapi-server';

const posts = await fetchStrapiCollection<Post>('posts', {
  populate: '*',
});

// posts.data is now typed as FlattenedStrapiEntity<Post>[]
```

## Best Practices

### 1. Use Server-Side Fetching When Possible

Server-side fetching is faster and more secure. Use it for:

- Initial page loads
- SEO-critical content
- Protected content

### 2. Implement Error Handling

Always handle errors gracefully:

```typescript
const post = await fetchStrapiSingle('posts', id);

if (!post) {
  return Astro.redirect('/404');
}
```

### 3. Optimize Populate Queries

Only populate what you need:

```typescript
// ❌ Bad: Populates everything
populate: '*';

// ✅ Good: Populate only needed relations
populate: ['author', 'image'];
```

### 4. Use Caching Strategically

- Server-side: Rely on Astro's built-in caching
- Client-side: Use the built-in cache (5 minutes TTL) or implement custom
  caching

### 5. Transform Images Properly

Always use the image helper functions to handle relative URLs:

```typescript
// ❌ Bad: Direct access
<img src={post.image.url} />

// ✅ Good: Use helper
<img src={getStrapiImageURL(post.image)} />
```

### 6. Never Expose API Tokens Client-Side

If you need client-side access, either:

- Use public endpoints
- Implement a proxy API route
- Use server-side rendering

### 7. Handle Pagination

For large collections, use pagination:

```typescript
const { data, meta } = await fetchStrapiCollection('posts', {
  pagination: {
    page: 1,
    pageSize: 20,
  },
});

// Access pagination info
const { page, pageCount, total } = meta.pagination;
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@strapi/client'"

**Solution**: Run `npm install @strapi/client`

#### 2. "Network request failed" or CORS errors

**Solution**:

- Check that `STRAPI_URL` is correct
- Ensure Strapi CORS settings allow your domain
- Update CSP in `astro.config.mjs` to include Strapi URL

#### 3. "Unauthorized" errors

**Solution**:

- Verify `STRAPI_TOKEN` is set correctly
- Check token permissions in Strapi admin
- Ensure the content type has proper permissions

#### 4. Images not loading

**Solution**:

- Use `getStrapiImageURL()` helper function
- Check that image URLs are absolute or properly prefixed
- Verify Strapi media library permissions

#### 5. Type errors with content types

**Solution**:

- Define TypeScript interfaces for your content types
- Use generics: `fetchStrapiCollection<YourType>('content-type')`
- Ensure Strapi response structure matches your types

### Debugging

Enable debug logging:

```typescript
// In strapi-server.ts or strapi-client.ts
console.log('Strapi URL:', getStrapiURL());
console.log('Query params:', queryParams);
console.log('Response:', response);
```

### Testing

Test your Strapi integration:

1. **Test server-side fetching**:

   ```bash
   npm run dev
   # Visit a page that uses Strapi
   ```

2. **Test client-side fetching**:
   - Open browser DevTools
   - Check Network tab for Strapi API calls
   - Verify responses and error handling

3. **Test error scenarios**:
   - Disconnect from network
   - Use invalid content type names
   - Test with missing/invalid tokens

## Additional Resources

- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi JavaScript Client](https://docs.strapi.io/dev-docs/api/javascript-client)
- [Astro Data Fetching](https://docs.astro.build/en/guides/data-fetching/)
