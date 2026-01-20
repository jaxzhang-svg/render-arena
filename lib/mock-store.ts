import { mockApps, mockUser } from './mock-data';
import type { App } from '@/types';

interface MockStore {
  apps: Map<string, App>;
  likes: Map<string, Set<string>>; // appId -> Set of userIds
}

// Singleton instance - persists across API calls during dev session
let store: MockStore | null = null;

function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getMockStore(): MockStore {
  if (!store) {
    store = {
      apps: new Map(),
      likes: new Map(),
    };

    // Initialize with mock apps
    mockApps.forEach(mockApp => {
      const app: App = {
        id: mockApp.id,
        user_id: mockApp.user_id,
        user_email: mockApp.user_email,
        name: mockApp.name,
        description: mockApp.description || null,
        prompt: 'Sample prompt for ' + mockApp.name,
        category: mockApp.category,
        model_a: 'deepseek/deepseek-v3.2',
        model_b: 'zai-org/glm-4.7',
        html_content_a: null,
        html_content_b: null,
        preview_video_url: null,
        like_count: mockApp.like_count,
        view_count: mockApp.view_count,
        is_public: mockApp.is_public,
        created_at: mockApp.created_at,
        updated_at: mockApp.updated_at,
      };
      store!.apps.set(app.id, app);
    });
  }
  return store;
}

export function createMockApp(data: {
  prompt: string;
  modelA: string;
  modelB: string;
  category?: string;
}): App {
  const id = generateId();
  const now = new Date().toISOString();

  const app: App = {
    id,
    user_id: mockUser.id,
    user_email: mockUser.email,
    name: null,
    description: null,
    prompt: data.prompt,
    category: data.category || '',
    model_a: data.modelA,
    model_b: data.modelB,
    html_content_a: null,
    html_content_b: null,
    preview_video_url: null,
    like_count: 0,
    view_count: 0,
    is_public: false,
    created_at: now,
    updated_at: now,
  };

  getMockStore().apps.set(id, app);
  return app;
}

export function getMockApp(id: string): App | undefined {
  return getMockStore().apps.get(id);
}

export function updateMockApp(id: string, updates: Partial<App>): boolean {
  const s = getMockStore();
  const app = s.apps.get(id);
  if (!app) return false;

  Object.assign(app, updates, { updated_at: new Date().toISOString() });
  return true;
}

export function getPublicMockApps(): App[] {
  const s = getMockStore();
  return Array.from(s.apps.values())
    .filter(app => app.is_public)
    .sort((a, b) => b.like_count - a.like_count);
}

export function toggleMockLike(appId: string, userId: string): { liked: boolean; likeCount: number } | null {
  const s = getMockStore();
  const app = s.apps.get(appId);
  if (!app) return null;

  let appLikes = s.likes.get(appId);
  if (!appLikes) {
    appLikes = new Set();
    s.likes.set(appId, appLikes);
  }

  const wasLiked = appLikes.has(userId);
  if (wasLiked) {
    appLikes.delete(userId);
    app.like_count = Math.max(0, app.like_count - 1);
  } else {
    appLikes.add(userId);
    app.like_count += 1;
  }

  return { liked: !wasLiked, likeCount: app.like_count };
}

export function isAppLikedByUser(appId: string, userId: string): boolean {
  const s = getMockStore();
  const appLikes = s.likes.get(appId);
  return appLikes?.has(userId) ?? false;
}
