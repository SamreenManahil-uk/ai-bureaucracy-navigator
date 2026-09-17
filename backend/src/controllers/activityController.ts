import type {
  Request,
  Response,
} from "express";

import {
  createActivity,
  getActivitiesForUser,
} from "../services/activityService";

export const listActivities = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const activities =
      await getActivitiesForUser(
        req.auth.userId
      );

    return res.json(activities);
  } catch (error) {
    console.error(
      "Activity list error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load activity history",
    });
  }
};

export const logActivity = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const {
      type,
      title,
      description,
      metadata,
    } = req.body;

    if (
      !type ||
      !title ||
      !description
    ) {
      return res.status(400).json({
        message:
          "type, title and description are required",
      });
    }

    const activity =
      await createActivity({
        ownerId: req.auth.userId,
        type,
        title,
        description,
        metadata,
      });

    return res.status(201).json(
      activity
    );
  } catch (error) {
    console.error(
      "Activity log error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to record activity",
    });
  }
};
