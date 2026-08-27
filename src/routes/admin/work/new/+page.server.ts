import { workService, localStorageProvider } from "$lib/server/container";
import { sanitizeHtml, sanitizePlain } from "$lib/server/security/sanitizer";
import { workItemSchema } from "$lib/validation/adminSchemas";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();

    const coverFileName = formData.get("coverFileName")?.toString() || null;
    const coverImageAlt =
      coverFileName || formData.get("coverImageAlt")?.toString() || null;

    const input = {
      title: formData.get("title")?.toString() ?? "",
      shortDescription: formData.get("shortDescription")?.toString() ?? "",
      longDescription: formData.get("longDescription")?.toString() ?? "",
      coverImageUrl: formData.get("coverImageUrl")?.toString() ?? "",
      coverImageAlt,
      projectUrl: formData.get("projectUrl")?.toString() || null,
      repoUrl: formData.get("repoUrl")?.toString() || null,
      techStack: formData
        .getAll("techStack")
        .map((t) => t.toString().trim())
        .filter(Boolean),
    };

    const galleryFiles = formData
      .getAll("galleryFiles")
      .filter((f): f is File => f instanceof File && f.size > 0);

    const result = workItemSchema.safeParse(input);
    if (!result.success) {
      const formattedError = result.error.issues
        .map((i) => i.message)
        .join(", ");
      return fail(400, { error: formattedError || "Invalid work item input" });
    }

    const data = result.data;
    const cleanLongDescription = sanitizeHtml(data.longDescription);
    const cleanShortDescription = sanitizePlain(data.shortDescription);

    const newItem = await workService.createWork({
      title: sanitizePlain(data.title),
      shortDescription: cleanShortDescription,
      longDescription: cleanLongDescription,
      coverImageUrl: data.coverImageUrl,
      coverImageAlt: data.coverImageAlt,
      projectUrl: data.projectUrl,
      repoUrl: data.repoUrl,
      techStack: data.techStack ?? [],
    });

    if (newItem && galleryFiles.length > 0) {
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        try {
          const { url } = await localStorageProvider.saveImage(
            file,
            "work-gallery"
          );
          await workService.addGalleryImage(newItem.id, url, file.name);
        } catch (err) {
          console.error(
            "Failed to save gallery file during work creation:",
            err
          );
        }
      }
    }

    throw redirect(302, "/admin/work");
  },
};
