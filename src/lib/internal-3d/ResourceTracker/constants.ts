export const RESOURCE_TRACKER_MESSAGES = {
  NO_RESOURCES_FOUND_FOR_OBJECT: (objectId: string) =>
    `[ResourceTracker] No resources found for object ${objectId}`,
  DISPOSING_RESOURCES_FOR_OBJECT: (objectId: string) =>
    `[ResourceTracker] Disposing of resources for object ${objectId}`,
};
