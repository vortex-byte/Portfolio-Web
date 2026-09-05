import { db } from "$lib/server/db";
import { workItems, workImages } from "$lib/server/db/schema";
import { eq, asc, and, count, inArray, sql } from "drizzle-orm";
import type {
  IWorkRepository,
  CreateWorkInput,
  UpdateWorkInput,
} from "./IWorkRepository";
import type {
  WorkItemEntity,
  WorkImageEntity,
  WorkItemWithImagesEntity,
  WorkListingResult,
} from "$lib/server/domain/interfaces/IWork";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export class WorkRepository implements IWorkRepository {
  async getListing(
    page = 1,
    pageSize = 12,
    onlyVisible = true
  ): Promise<WorkListingResult> {
    const offset = (page - 1) * pageSize;

    const baseQuery = db.select().from(workItems);
    const countQuery = db.select({ value: count() }).from(workItems);

    if (onlyVisible) {
      baseQuery.where(eq(workItems.isVisible, true));
      countQuery.where(eq(workItems.isVisible, true));
    }

    const items = await baseQuery
      .orderBy(asc(workItems.displayOrder))
      .limit(pageSize)
      .offset(offset);

    const [{ value: totalCount }] = await countQuery;

    return {
      items,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  }

  async getAllForAdmin(): Promise<WorkItemEntity[]> {
    return db.select().from(workItems).orderBy(asc(workItems.displayOrder));
  }

  async getWorkCount(): Promise<number> {
    const [{ value }] = await db.select({ value: count() }).from(workItems);
    return value;
  }

  async getBySlug(slug: string): Promise<WorkItemWithImagesEntity | null> {
    const itemRes = await db
      .select()
      .from(workItems)
      .where(and(eq(workItems.slug, slug), eq(workItems.isVisible, true)))
      .limit(1);

    if (itemRes.length === 0) return null;
    const item = itemRes[0];

    const images = await db
      .select()
      .from(workImages)
      .where(eq(workImages.workItemId, item.id))
      .orderBy(asc(workImages.displayOrder));

    return { ...item, images };
  }

  async getById(id: string): Promise<WorkItemWithImagesEntity | null> {
    const itemRes = await db
      .select()
      .from(workItems)
      .where(eq(workItems.id, id))
      .limit(1);
    if (itemRes.length === 0) return null;
    const item = itemRes[0];

    const images = await db
      .select()
      .from(workImages)
      .where(eq(workImages.workItemId, id))
      .orderBy(asc(workImages.displayOrder));

    return { ...item, images };
  }

  async getPinned(limit = 3): Promise<WorkItemEntity[]> {
    return db
      .select()
      .from(workItems)
      .where(and(eq(workItems.isVisible, true), eq(workItems.isPinned, true)))
      .orderBy(asc(workItems.pinnedOrder))
      .limit(limit);
  }

  async createWork(input: CreateWorkInput): Promise<WorkItemEntity> {
    const allItems = await this.getAllForAdmin();
    const maxOrder =
      allItems.length > 0
        ? Math.max(...allItems.map((w) => w.displayOrder))
        : -1;

    let slug = generateSlug(input.title);
    const existingSlug = await db
      .select()
      .from(workItems)
      .where(eq(workItems.slug, slug))
      .limit(1);
    if (existingSlug.length > 0) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const [res] = await db
      .insert(workItems)
      .values({
        title: input.title,
        slug,
        shortDescription: input.shortDescription,
        longDescription: input.longDescription,
        coverImagePath: input.coverImagePath,
        coverImageAlt: input.coverImageAlt || null,
        projectUrl: input.projectUrl || null,
        repoUrl: input.repoUrl || null,
        techStack: input.techStack || [],
        displayOrder: maxOrder + 1,
        isPinned: false,
        isVisible: true,
      })
      .returning();

    return res;
  }

  async updateWork(input: UpdateWorkInput): Promise<WorkItemEntity> {
    const [res] = await db
      .update(workItems)
      .set({
        title: input.title,
        shortDescription: input.shortDescription,
        longDescription: input.longDescription,
        coverImagePath: input.coverImagePath,
        coverImageAlt: input.coverImageAlt || null,
        projectUrl: input.projectUrl || null,
        repoUrl: input.repoUrl || null,
        techStack: input.techStack || [],
        updatedAt: new Date(),
      })
      .where(eq(workItems.id, input.id))
      .returning();

    return res;
  }

  async deleteWork(id: string): Promise<string[]> {
    const work = await this.getById(id);
    if (!work) return [];

    const deletedUrls: string[] = [work.coverImagePath];
    for (const img of work.images) {
      deletedUrls.push(img.imagePath);
    }

    await db.delete(workItems).where(eq(workItems.id, id));
    return deletedUrls;
  }

  async togglePin(id: string, isPinned: boolean): Promise<void> {
    if (isPinned) {
      const pinned = await this.getPinned(10);
      if (pinned.length >= 3) {
        throw new Error("Maximum of 3 pinned work items allowed on homepage");
      }
      const maxPinnedOrder =
        pinned.length > 0
          ? Math.max(...pinned.map((p) => p.pinnedOrder ?? 0))
          : -1;
      await db
        .update(workItems)
        .set({
          isPinned: true,
          pinnedOrder: maxPinnedOrder + 1,
          updatedAt: new Date(),
        })
        .where(eq(workItems.id, id));
    } else {
      await db
        .update(workItems)
        .set({ isPinned: false, pinnedOrder: null, updatedAt: new Date() })
        .where(eq(workItems.id, id));
    }
  }

  async reorderPinned(id: string, direction: "up" | "down"): Promise<void> {
    const pinned = await this.getPinned(10);
    const idx = pinned.findIndex((i) => i.id === id);
    if (idx === -1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= pinned.length) return;

    const sqlChunks: ReturnType<typeof sql>[] = [sql`CASE`];
    const targetIds: string[] = [];

    for (let i = 0; i < pinned.length; i++) {
      let newOrder = i;
      if (i === idx) newOrder = targetIdx;
      else if (i === targetIdx) newOrder = idx;

      sqlChunks.push(
        sql`WHEN ${workItems.id} = ${pinned[i].id} THEN ${newOrder}`
      );
      targetIds.push(pinned[i].id);
    }
    sqlChunks.push(sql`ELSE ${workItems.pinnedOrder} END`);

    await db
      .update(workItems)
      .set({ pinnedOrder: sql.join(sqlChunks, sql` `) })
      .where(inArray(workItems.id, targetIds));
  }

  async toggleVisibility(id: string, isVisible: boolean): Promise<void> {
    await db
      .update(workItems)
      .set({ isVisible, updatedAt: new Date() })
      .where(eq(workItems.id, id));
  }

  async reorderWork(id: string, direction: "up" | "down"): Promise<void> {
    const items = await this.getAllForAdmin();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const sqlChunks: ReturnType<typeof sql>[] = [sql`CASE`];
    const targetIds: string[] = [];

    for (let i = 0; i < items.length; i++) {
      let newOrder = i;
      if (i === idx) newOrder = targetIdx;
      else if (i === targetIdx) newOrder = idx;

      sqlChunks.push(
        sql`WHEN ${workItems.id} = ${items[i].id} THEN ${newOrder}`
      );
      targetIds.push(items[i].id);
    }
    sqlChunks.push(sql`ELSE ${workItems.displayOrder} END`);

    await db
      .update(workItems)
      .set({ displayOrder: sql.join(sqlChunks, sql` `) })
      .where(inArray(workItems.id, targetIds));
  }

  async addGalleryImage(
    workItemId: string,
    imagePath: string,
    imageAlt?: string | null
  ): Promise<WorkImageEntity> {
    const existingImages = await db
      .select({ displayOrder: workImages.displayOrder })
      .from(workImages)
      .where(eq(workImages.workItemId, workItemId))
      .orderBy(asc(workImages.displayOrder));

    const startOrder =
      existingImages.length > 0
        ? (existingImages[existingImages.length - 1].displayOrder ?? 0) + 1
        : 0;

    const [res] = await db
      .insert(workImages)
      .values({
        workItemId,
        imagePath,
        imageAlt: imageAlt || null,
        displayOrder: startOrder,
      })
      .returning();

    return res;
  }

  async deleteGalleryImage(imageId: string): Promise<string | null> {
    const imgRes = await db
      .select()
      .from(workImages)
      .where(eq(workImages.id, imageId))
      .limit(1);
    if (imgRes.length === 0) return null;

    await db.delete(workImages).where(eq(workImages.id, imageId));
    return imgRes[0].imagePath;
  }
}

export const workRepository = new WorkRepository();
