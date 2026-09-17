import {
  ActivityModel,
  type ActivityType,
} from "../models/Activity";

export const createActivity = async ({
  ownerId,
  type,
  title,
  description,
  metadata = {},
}: {
  ownerId: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}) => {
  return ActivityModel.create({
    ownerId,
    type,
    title,
    description,
    metadata,
  });
};

export const getActivitiesForUser =
  async (
    ownerId: string,
    limit = 50
  ) => {
    return ActivityModel.find({
      ownerId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .lean();
  };
