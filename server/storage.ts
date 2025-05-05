import { db } from "@db";
import {
  categories,
  entries,
  tags,
  entryTags,
  entryRelations,
  Category,
  Entry,
  Tag,
} from "@shared/schema";
import { eq, and, desc, like, SQL, inArray, sql } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

// Categories
export const storage = {
  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return db.query.categories.findMany({
      orderBy: categories.name,
    });
  },

  async getCategoryById(id: number): Promise<Category | undefined> {
    return db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
  },

  async createCategory(data: { name: string; color?: string }): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: data.name,
        color: data.color,
      })
      .returning();
    return newCategory;
  },

  async updateCategory(id: number, data: { name?: string; color?: string }): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set({
        ...data,
        ...(data.name && { name: data.name }),
        ...(data.color && { color: data.color }),
      })
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  },

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  },

  async getCategoryWithEntryCount(): Promise<(Category & { count: number })[]> {
    const result = await db.execute<{ id: number; name: string; color: string; count: number }>(sql`
      SELECT c.id, c.name, c.color, COUNT(e.id) as count
      FROM ${categories} c
      LEFT JOIN ${entries} e ON c.id = e.category_id
      GROUP BY c.id, c.name, c.color
      ORDER BY c.name
    `);
    return result.rows;
  },

  // Tag operations
  async getAllTags(): Promise<Tag[]> {
    return db.query.tags.findMany({
      orderBy: tags.name,
    });
  },

  async getTagById(id: number): Promise<Tag | undefined> {
    return db.query.tags.findFirst({
      where: eq(tags.id, id),
    });
  },

  async createTag(data: { name: string }): Promise<Tag> {
    const [newTag] = await db
      .insert(tags)
      .values({
        name: data.name,
      })
      .returning();
    return newTag;
  },

  async updateTag(id: number, data: { name: string }): Promise<Tag | undefined> {
    const [updatedTag] = await db
      .update(tags)
      .set({
        name: data.name,
      })
      .where(eq(tags.id, id))
      .returning();
    return updatedTag;
  },

  async deleteTag(id: number): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id));
  },

  async getTagsWithCount(): Promise<(Tag & { count: number })[]> {
    const result = await db.execute<{ id: number; name: string; count: number }>(sql`
      SELECT t.id, t.name, COUNT(et.entry_id) as count
      FROM ${tags} t
      LEFT JOIN ${entryTags} et ON t.id = et.tag_id
      GROUP BY t.id, t.name
      ORDER BY COUNT(et.entry_id) DESC, t.name
    `);
    return result.rows;
  },

  // Entry operations
  async getAllEntries(options?: {
    categoryId?: number;
    tagIds?: number[];
    searchQuery?: string;
    isFavorite?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ entries: Entry[]; total: number }> {
    const { categoryId, tagIds, searchQuery, isFavorite, limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = options || {};
    
    let query = db
      .select()
      .from(entries)
      .limit(limit)
      .offset(offset);
    
    // Apply filters
    const conditions: SQL<unknown>[] = [];
    
    if (categoryId) {
      conditions.push(eq(entries.categoryId, categoryId));
    }
    
    if (isFavorite !== undefined) {
      conditions.push(eq(entries.isFavorite, isFavorite));
    }
    
    if (searchQuery) {
      conditions.push(
        sql`(${entries.title} ILIKE ${'%' + searchQuery + '%'} OR ${entries.content} ILIKE ${'%' + searchQuery + '%'})`
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    const sortColumn = sortBy === 'title' ? entries.title :
                      sortBy === 'updatedAt' ? entries.updatedAt :
                      entries.createdAt;
                      
    query = sortOrder === 'asc' 
      ? query.orderBy(sortColumn)
      : query.orderBy(desc(sortColumn));
    
    // Special handling for tag filtering (after initial query)
    let filteredEntries = await query;
    
    if (tagIds && tagIds.length > 0) {
      // Get all entry IDs that match all requested tags
      const taggedEntryIds = await db.execute<{ entry_id: number }>(sql`
        SELECT et.entry_id
        FROM ${entryTags} et
        WHERE et.tag_id IN (${tagIds.join(',')})
        GROUP BY et.entry_id
        HAVING COUNT(DISTINCT et.tag_id) = ${tagIds.length}
      `);
      
      const ids = taggedEntryIds.rows.map(row => row.entry_id);
      
      if (ids.length === 0) {
        return { entries: [], total: 0 };
      }
      
      filteredEntries = filteredEntries.filter(entry => 
        ids.includes(entry.id)
      );
    }
    
    // Get total count (for pagination)
    const totalQuery = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(entries);
    
    if (conditions.length > 0) {
      totalQuery.where(and(...conditions));
    }
    
    let total = (await totalQuery.execute())[0].count;
    
    // Adjust total if we're filtering by tags
    if (tagIds && tagIds.length > 0) {
      total = filteredEntries.length;
    }
    
    return { 
      entries: filteredEntries,
      total
    };
  },

  async getEntryById(id: number): Promise<Entry | undefined> {
    return db.query.entries.findFirst({
      where: eq(entries.id, id),
    });
  },

  async getEntryWithDetails(id: number): Promise<(Entry & { category?: Category; tags: Tag[]; relatedEntries: Entry[] }) | undefined> {
    const entry = await db.query.entries.findFirst({
      where: eq(entries.id, id),
      with: {
        category: true,
      },
    });

    if (!entry) return undefined;

    // Get tags for this entry
    const entryTagsResult = await db
      .select()
      .from(entryTags)
      .where(eq(entryTags.entryId, id))
      .innerJoin(tags, eq(entryTags.tagId, tags.id));

    const entryTags = entryTagsResult.map(row => row.tags);

    // Get related entries
    const relatedEntryIds = await db
      .select({ relatedId: entryRelations.relatedEntryId })
      .from(entryRelations)
      .where(eq(entryRelations.originEntryId, id));

    const relatedEntries = relatedEntryIds.length > 0
      ? await db
          .select()
          .from(entries)
          .where(inArray(entries.id, relatedEntryIds.map(r => r.relatedId)))
      : [];

    return {
      ...entry,
      tags: entryTags,
      relatedEntries,
    };
  },

  async createEntry(data: {
    title: string;
    content: string;
    categoryId?: number;
    isFavorite?: boolean;
    tagIds?: number[];
    relatedEntryIds?: number[];
  }): Promise<Entry> {
    const { title, content, categoryId, isFavorite = false, tagIds = [], relatedEntryIds = [] } = data;

    // Insert the entry
    const [newEntry] = await db
      .insert(entries)
      .values({
        title,
        content,
        categoryId,
        isFavorite,
      })
      .returning();

    // Add tags
    if (tagIds.length > 0) {
      await db.insert(entryTags).values(
        tagIds.map(tagId => ({
          entryId: newEntry.id,
          tagId,
        }))
      );
    }

    // Add related entries
    if (relatedEntryIds.length > 0) {
      await db.insert(entryRelations).values(
        relatedEntryIds.map(relatedId => ({
          originEntryId: newEntry.id,
          relatedEntryId: relatedId,
        }))
      );
    }

    return newEntry;
  },

  async updateEntry(
    id: number,
    data: {
      title?: string;
      content?: string;
      categoryId?: number | null;
      isFavorite?: boolean;
      tagIds?: number[];
      relatedEntryIds?: number[];
    }
  ): Promise<Entry | undefined> {
    const { title, content, categoryId, isFavorite, tagIds, relatedEntryIds } = data;

    // Update entry
    const [updatedEntry] = await db
      .update(entries)
      .set({
        ...(title && { title }),
        ...(content && { content }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isFavorite !== undefined && { isFavorite }),
        updatedAt: new Date(),
      })
      .where(eq(entries.id, id))
      .returning();

    if (!updatedEntry) return undefined;

    // Update tags if provided
    if (tagIds) {
      // Remove existing tags
      await db.delete(entryTags).where(eq(entryTags.entryId, id));

      // Add new tags
      if (tagIds.length > 0) {
        await db.insert(entryTags).values(
          tagIds.map(tagId => ({
            entryId: id,
            tagId,
          }))
        );
      }
    }

    // Update related entries if provided
    if (relatedEntryIds) {
      // Remove existing relations
      await db.delete(entryRelations).where(eq(entryRelations.originEntryId, id));

      // Add new relations
      if (relatedEntryIds.length > 0) {
        await db.insert(entryRelations).values(
          relatedEntryIds.map(relatedId => ({
            originEntryId: id,
            relatedEntryId: relatedId,
          }))
        );
      }
    }

    return updatedEntry;
  },

  async toggleFavorite(id: number): Promise<Entry | undefined> {
    const entry = await db.query.entries.findFirst({
      where: eq(entries.id, id),
    });

    if (!entry) return undefined;

    const [updatedEntry] = await db
      .update(entries)
      .set({
        isFavorite: !entry.isFavorite,
      })
      .where(eq(entries.id, id))
      .returning();

    return updatedEntry;
  },

  async deleteEntry(id: number): Promise<void> {
    // Delete related records first
    await db.delete(entryTags).where(eq(entryTags.entryId, id));
    await db.delete(entryRelations).where(eq(entryRelations.originEntryId, id));
    await db.delete(entryRelations).where(eq(entryRelations.relatedEntryId, id));

    // Delete the entry
    await db.delete(entries).where(eq(entries.id, id));
  },

  // Analytics
  async getEntriesByCategory(): Promise<{ category: string; color: string; count: number }[]> {
    const result = await db.execute<{ category: string; color: string; count: number }>(sql`
      SELECT 
        COALESCE(c.name, 'Uncategorized') as category,
        COALESCE(c.color, '#94a3b8') as color,
        COUNT(e.id) as count
      FROM ${entries} e
      LEFT JOIN ${categories} c ON e.category_id = c.id
      GROUP BY category, color
      ORDER BY count DESC
    `);
    return result.rows;
  },

  async getEntryFrequencyByWeek(weeks: number = 8): Promise<{ week: string; count: number }[]> {
    const result = await db.execute<{ week: string; count: number }>(sql`
      WITH weeks AS (
        SELECT generate_series(
          date_trunc('week', NOW() - interval '${weeks-1} weeks'),
          date_trunc('week', NOW()),
          interval '1 week'
        ) AS week_start
      )
      SELECT 
        to_char(weeks.week_start, 'MM/DD') as week,
        COUNT(e.id) as count
      FROM weeks
      LEFT JOIN ${entries} e 
        ON e.created_at >= weeks.week_start 
        AND e.created_at < weeks.week_start + interval '1 week'
      GROUP BY weeks.week_start
      ORDER BY weeks.week_start
    `);
    return result.rows;
  },

  async getRelatedTags(tagId: number): Promise<{ tag: Tag; strength: number }[]> {
    const result = await db.execute<{ id: number; name: string; strength: number }>(sql`
      SELECT t.id, t.name, COUNT(*) as strength
      FROM ${tags} t
      JOIN ${entryTags} et1 ON t.id = et1.tag_id
      JOIN ${entryTags} et2 ON et1.entry_id = et2.entry_id
      WHERE et2.tag_id = ${tagId} AND t.id != ${tagId}
      GROUP BY t.id, t.name
      ORDER BY strength DESC
      LIMIT 8
    `);
    
    return result.rows.map(row => ({
      tag: {
        id: row.id,
        name: row.name,
        createdAt: new Date(), // We don't need the exact date here
      },
      strength: row.strength
    }));
  },

  async searchEntries(query: string): Promise<Entry[]> {
    return db
      .select()
      .from(entries)
      .where(
        sql`(${entries.title} ILIKE ${'%' + query + '%'} OR ${entries.content} ILIKE ${'%' + query + '%'})`
      )
      .orderBy(desc(entries.updatedAt))
      .limit(10);
  },
  
  async getInsights(): Promise<{
    focusAreas: string[];
    recommendations: string[];
    recentCategories: { name: string; count: number }[];
    recentTags: { name: string; count: number }[];
  }> {
    // Get recent categories
    const recentCategoriesResult = await db.execute<{ name: string; count: number }>(sql`
      SELECT 
        COALESCE(c.name, 'Uncategorized') as name,
        COUNT(e.id) as count
      FROM ${entries} e
      LEFT JOIN ${categories} c ON e.category_id = c.id
      WHERE e.created_at > NOW() - interval '30 days'
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 3
    `);
    
    // Get recent tags
    const recentTagsResult = await db.execute<{ name: string; count: number }>(sql`
      SELECT t.name, COUNT(et.entry_id) as count
      FROM ${tags} t
      JOIN ${entryTags} et ON t.id = et.tag_id
      JOIN ${entries} e ON et.entry_id = e.id
      WHERE e.created_at > NOW() - interval '30 days'
      GROUP BY t.name
      ORDER BY count DESC
      LIMIT 5
    `);
    
    // Generate insights based on this data
    const recentCategories = recentCategoriesResult.rows;
    const recentTags = recentTagsResult.rows;
    
    const focusAreas = recentTags.map(tag => tag.name);
    
    // Generate recommendations based on common patterns
    const recommendations = [];
    
    if (recentCategories.length >= 2) {
      recommendations.push(
        `Consider exploring connections between ${recentCategories[0].name} and ${recentCategories[1].name}.`
      );
    }
    
    if (recentTags.length >= 3) {
      recommendations.push(
        `You might benefit from seeing how ${recentTags[0].name}, ${recentTags[1].name}, and ${recentTags[2].name} are related.`
      );
    }
    
    // Default recommendation if we don't have enough data
    if (recommendations.length === 0) {
      recommendations.push(
        "Try adding more entries with different tags to get personalized insights."
      );
    }
    
    return {
      focusAreas,
      recommendations,
      recentCategories,
      recentTags
    };
  }
};
