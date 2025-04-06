import * as firestoreUtils from '../utils/firestore';
import {ApiError} from '../middleware/error';
import {STATUS_CODES, ERROR_MESSAGES} from '../utils/constants';
import {
  Group,
  GroupCreationData,
  GroupUpdateData,
  GroupMember,
} from '../types/group';
import {UserProfile} from '../types/user';
import logger from '../utils/logger';
import {Announcement} from '../types/announcement';
import {Event} from '@/types';
/**
 * Create a new group
 */
export const createGroup = async (
  userId: string,
  groupData: GroupCreationData,
) => {
  try {
    // Generate a unique ID for the group
    const groupId = firestoreUtils.generateId();

    // Prepare the group document
    const newGroup: Partial<Group> = {
      ...groupData,
      id: groupId,
      memberCount: 1,
      admins: [userId],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Run in a transaction to ensure consistency
    await firestoreUtils.runTransaction(async transaction => {
      // Create the group document
      transaction.set(
        firestoreUtils.docRef<Group>(`groups/${groupId}`),
        newGroup,
      );

      // Add the creator as the first member and admin
      transaction.set(
        firestoreUtils.docRef<GroupMember>(
          `groups/${groupId}/members/${userId}`,
        ),
        {
          uid: userId,
          displayName: '', // Will be updated after getting user data
          recoveryDate: undefined, // Will be updated after getting user data
          joinedAt: new Date(),
          position: 'Creator',
          isAdmin: true,
          updatedAt: new Date(),
        },
      );

      // Add the group to the user's homeGroups array
      const userDoc = await transaction.get(
        firestoreUtils.docRef<UserProfile>(`users/${userId}`),
      );
      const userData = userDoc.data();

      if (!userData) {
        throw new ApiError(
          STATUS_CODES.NOT_FOUND,
          ERROR_MESSAGES.USER_NOT_FOUND,
        );
      }

      // Update the member document with the user's display name and recovery date
      transaction.update(
        firestoreUtils.docRef<GroupMember>(
          `groups/${groupId}/members/${userId}`,
        ),
        {
          displayName: userData.displayName,
          recoveryDate: userData.recoveryDate
            ? userData.recoveryDate.toISOString()
            : undefined,
          updatedAt: new Date(),
        },
      );

      // Update the user's homeGroups array
      const homeGroups = userData.homeGroups || [];
      homeGroups.push(groupId);

      transaction.update(
        firestoreUtils.docRef<UserProfile>(`users/${userId}`),
        {
          homeGroups,
          updatedAt: new Date(),
        },
      );
    });

    // Get the newly created group
    const group = await firestoreUtils.getDoc<Group>(
      firestoreUtils.docRef<Group>(`groups/${groupId}`),
    );

    if (!group) {
      throw new ApiError(
        STATUS_CODES.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }

    return {...group, isAdmin: true};
  } catch (error) {
    logger.error(`Error creating group: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Get a group by ID
 */
export const getGroupById = async (userId: string, groupId: string) => {
  try {
    // Get the group document
    const groupData = await firestoreUtils.getDoc<Group>(
      firestoreUtils.docRef<Group>(`groups/${groupId}`),
    );

    if (!groupData) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        ERROR_MESSAGES.GROUP_NOT_FOUND,
      );
    }

    // Check if user is a member of the group
    const isMember = groupData.admins.includes(userId);

    // If not a member and not admin, check the members subcollection
    if (!isMember) {
      const memberDoc = await firestoreUtils.getDoc<GroupMember>(
        firestoreUtils.docRef<GroupMember>(
          `groups/${groupId}/members/${userId}`,
        ),
      );

      if (!memberDoc) {
        throw new ApiError(
          STATUS_CODES.FORBIDDEN,
          ERROR_MESSAGES.NOT_GROUP_MEMBER,
        );
      }
    }

    // Check if user is an admin
    const isAdmin = groupData.admins.includes(userId);

    return {...groupData, isAdmin};
  } catch (error) {
    logger.error(`Error getting group: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Update a group
 */
export const updateGroup = async (
  userId: string,
  groupId: string,
  groupData: GroupUpdateData,
) => {
  try {
    // Get the group document to check admin rights
    const groupDoc = await firestoreUtils.getDoc<Group>(
      firestoreUtils.docRef<Group>(`groups/${groupId}`),
    );

    if (!groupDoc) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        ERROR_MESSAGES.GROUP_NOT_FOUND,
      );
    }

    // Check if user is an admin
    if (!groupDoc.admins.includes(userId)) {
      throw new ApiError(
        STATUS_CODES.FORBIDDEN,
        ERROR_MESSAGES.NOT_GROUP_ADMIN,
      );
    }

    // Update the group document
    await firestoreUtils.updateDoc<Group>(`groups/${groupId}`, {
      ...groupData,
      updatedAt: new Date(),
    });

    // Get the updated group
    const updatedGroup = await firestoreUtils.getDoc<Group>(
      firestoreUtils.docRef<Group>(`groups/${groupId}`),
    );

    if (!updatedGroup) {
      throw new ApiError(
        STATUS_CODES.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }

    return {...updatedGroup, isAdmin: true};
  } catch (error) {
    logger.error(`Error updating group: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Delete a group
 */
export const deleteGroup = async (userId: string, groupId: string) => {
  try {
    // Get the group document to check admin rights
    const groupDoc = await firestoreUtils.getDoc<Group>(
      firestoreUtils.docRef<Group>(`groups/${groupId}`),
    );

    if (!groupDoc) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        ERROR_MESSAGES.GROUP_NOT_FOUND,
      );
    }

    // Check if user is an admin
    if (!groupDoc.admins.includes(userId)) {
      throw new ApiError(
        STATUS_CODES.FORBIDDEN,
        ERROR_MESSAGES.NOT_GROUP_ADMIN,
      );
    }

    // Get all group members
    const members = await firestoreUtils.getSubCollection<GroupMember>(
      `groups/${groupId}`,
      'members',
    );

    // Get all user documents first
    const userDocs = await Promise.all(
      members.map(member =>
        firestoreUtils.getDoc<UserProfile>(
          firestoreUtils.docRef<UserProfile>(`users/${member.uid}`),
        ),
      ),
    );

    // Run in a batch to ensure consistency
    await firestoreUtils.runBatch(batch => {
      // Remove the group from each member's homeGroups array
      members.forEach((member, index) => {
        const userDoc = userDocs[index];
        if (userDoc) {
          const homeGroups = userDoc.homeGroups.filter(
            (id: string) => id !== groupId,
          );

          batch.update(
            firestoreUtils.docRef<UserProfile>(`users/${member.uid}`),
            {
              homeGroups,
              updatedAt: new Date(),
            },
          );
        }
      });

      // Delete the group document
      batch.delete(firestoreUtils.docRef<Group>(`groups/${groupId}`));
    });

    return {success: true};
  } catch (error) {
    logger.error(`Error deleting group: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Get group members
 */
export const getGroupMembers = async (userId: string, groupId: string) => {
  try {
    // Verify the group exists and user is a member
    await getGroupById(userId, groupId);

    // Get all members from the subcollection
    const members = await firestoreUtils.getSubCollection<GroupMember>(
      `groups/${groupId}`,
      'members',
    );

    return members.sort((a, b) => {
      // Admins first
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;

      // Then sort by position (if any)
      if (a.position && !b.position) return -1;
      if (!a.position && b.position) return 1;
      if (a.position && b.position) {
        if (a.position < b.position) return -1;
        if (a.position > b.position) return 1;
      }

      // Finally sort by display name
      return a.displayName.localeCompare(b.displayName);
    });
  } catch (error) {
    logger.error(`Error getting group members: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Update a member's role in a group
 */
export const updateMemberRole = async (
  adminId: string,
  groupId: string,
  memberId: string,
  isAdmin: boolean,
  position?: string,
) => {
  try {
    // Verify the group exists and user is an admin
    const group = await getGroupById(adminId, groupId);

    if (!group.isAdmin) {
      throw new ApiError(
        STATUS_CODES.FORBIDDEN,
        ERROR_MESSAGES.NOT_GROUP_ADMIN,
      );
    }

    // Verify the member exists
    const memberDoc = await firestoreUtils.getDoc<GroupMember>(
      firestoreUtils.docRef<GroupMember>(
        `groups/${groupId}/members/${memberId}`,
      ),
    );

    if (!memberDoc) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_IN_GROUP,
      );
    }

    // Run in a transaction to ensure consistency
    await firestoreUtils.runTransaction(async transaction => {
      // Update the member's role in the subcollection
      transaction.update(
        firestoreUtils.docRef<GroupMember>(
          `groups/${groupId}/members/${memberId}`,
        ),
        {
          isAdmin,
          position: position || memberDoc.position,
          updatedAt: new Date(),
        },
      );

      // If making admin, add to admins array; if removing admin, remove from array
      const groupDoc = await transaction.get(
        firestoreUtils.docRef<Group>(`groups/${groupId}`),
      );
      const groupData = groupDoc.data();

      if (!groupData) {
        throw new ApiError(
          STATUS_CODES.NOT_FOUND,
          ERROR_MESSAGES.GROUP_NOT_FOUND,
        );
      }

      let admins = groupData.admins || [];

      if (isAdmin && !admins.includes(memberId)) {
        admins.push(memberId);
      } else if (!isAdmin && admins.includes(memberId)) {
        // Make sure we're not removing the last admin
        if (admins.length <= 1) {
          throw new ApiError(
            STATUS_CODES.BAD_REQUEST,
            ERROR_MESSAGES.CANNOT_REMOVE_LAST_ADMIN,
          );
        }

        admins = admins.filter(id => id !== memberId);
      }

      transaction.update(firestoreUtils.docRef<Group>(`groups/${groupId}`), {
        admins,
        updatedAt: new Date(),
      });
    });

    // Get the updated member
    const updatedMember = await firestoreUtils.getDoc<GroupMember>(
      firestoreUtils.docRef<GroupMember>(
        `groups/${groupId}/members/${memberId}`,
      ),
    );

    return updatedMember;
  } catch (error) {
    logger.error(`Error updating member role: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Get upcoming sobriety celebrations for a group
 */
export const getGroupCelebrations = async (userId: string, groupId: string) => {
  try {
    // Verify the group exists and user is a member
    await getGroupById(userId, groupId);

    // Get all members
    const members = await getGroupMembers(userId, groupId);

    // Calculate upcoming celebrations (next 3 months)
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    const celebrations = [];

    for (const member of members) {
      if (member.recoveryDate) {
        const recoveryDate = new Date(member.recoveryDate);
        const nextAnniversary = new Date(recoveryDate);
        nextAnniversary.setFullYear(today.getFullYear());

        // If already passed this year, use next year
        if (nextAnniversary < today) {
          nextAnniversary.setFullYear(today.getFullYear() + 1);
        }

        // If within the next 3 months
        if (nextAnniversary <= threeMonthsFromNow) {
          const years =
            nextAnniversary.getFullYear() - recoveryDate.getFullYear();

          celebrations.push({
            id: `celebration-${member.uid}`,
            memberId: member.uid,
            memberName: member.displayName,
            years,
            date: nextAnniversary,
          });
        }
      }
    }

    // Sort by date (closest first)
    return celebrations.sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    logger.error(`Error getting group celebrations: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Get announcements for a group
 */
export const getGroupAnnouncements = async (
  userId: string,
  groupId: string,
) => {
  try {
    // Verify the group exists and user is a member
    await getGroupById(userId, groupId);

    // Get all announcements from the subcollection
    const announcements = await firestoreUtils.getSubCollection<Announcement>(
      `groups/${groupId}`,
      'announcements',
    );

    // Sort: pinned first, then by date (newest first)
    return announcements.sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then sort by date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  } catch (error) {
    logger.error(`Error getting group announcements: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Create a new announcement
 */
export const createAnnouncement = async (
  userId: string,
  groupId: string,
  title: string,
  content: string,
  isPinned: boolean = false,
  expiresAt?: Date,
) => {
  try {
    // Verify the group exists and user is a member
    const group = await getGroupById(userId, groupId);

    // In a real app, you might want to restrict announcement creation to admins

    // Get user display name
    const userDoc = await firestoreUtils.getDoc<UserProfile>(
      firestoreUtils.docRef<UserProfile>(`users/${userId}`),
    );

    if (!userDoc) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Create announcement
    const announcementId = firestoreUtils.generateId();

    const announcementData = {
      id: announcementId,
      title,
      content,
      isPinned,
      createdBy: userId,
      authorName: userDoc.displayName,
      expiresAt: expiresAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await firestoreUtils.setDoc(
      `groups/${groupId}/announcements/${announcementId}`,
      announcementData,
    );

    return announcementData;
  } catch (error) {
    logger.error(`Error creating announcement: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Update an announcement
 */
export const updateAnnouncement = async (
  userId: string,
  groupId: string,
  announcementId: string,
  title?: string,
  content?: string,
  isPinned?: boolean,
  expiresAt?: Date,
) => {
  try {
    // Verify the group exists and user is a member
    const group = await getGroupById(userId, groupId);

    // Get the announcement
    const announcement = await firestoreUtils.getDoc<Announcement>(
      firestoreUtils.docRef<Announcement>(
        `groups/${groupId}/announcements/${announcementId}`,
      ),
    );

    if (!announcement) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        ERROR_MESSAGES.ANNOUNCEMENT_NOT_FOUND,
      );
    }

    // Only creator or group admin can update
    if (announcement.createdBy !== userId && !group.isAdmin) {
      throw new ApiError(STATUS_CODES.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
    }

    // Prepare update data
    const updateData: any = {updatedAt: new Date()};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt;

    // Update the announcement
    await firestoreUtils.updateDoc(
      `groups/${groupId}/announcements/${announcementId}`,
      updateData,
    );

    // Get the updated announcement
    return await firestoreUtils.getDoc<Announcement>(
      firestoreUtils.docRef<Announcement>(
        `groups/${groupId}/announcements/${announcementId}`,
      ),
    );
  } catch (error) {
    logger.error(`Error updating announcement: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Delete an announcement
 */
export const deleteAnnouncement = async (
  userId: string,
  groupId: string,
  announcementId: string,
) => {
  try {
    // Verify the group exists and user is a member
    const group = await getGroupById(userId, groupId);

    // Get the announcement
    const announcement = await firestoreUtils.getDoc<Announcement>(
      firestoreUtils.docRef<Announcement>(
        `groups/${groupId}/announcements/${announcementId}`,
      ),
    );

    if (!announcement) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        ERROR_MESSAGES.ANNOUNCEMENT_NOT_FOUND,
      );
    }

    // Only creator or group admin can delete
    if (announcement.createdBy !== userId && !group.isAdmin) {
      throw new ApiError(STATUS_CODES.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
    }

    // Delete the announcement
    await firestoreUtils.deleteDoc(
      `groups/${groupId}/announcements/${announcementId}`,
    );

    return {success: true};
  } catch (error) {
    logger.error(`Error deleting announcement: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Get events for a group
 */
export const getGroupEvents = async (userId: string, groupId: string) => {
  try {
    // Verify the group exists and user is a member
    await getGroupById(userId, groupId);

    // Get all events from the subcollection
    const events = await firestoreUtils.getSubCollection<Event>(
      `groups/${groupId}`,
      'events',
    );

    // Filter out past events and sort by date (closest first)
    const now = new Date();
    return events
      .filter(event => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        return eventDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  } catch (error) {
    logger.error(`Error getting group events: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Create a new event
 */
export const createEvent = async (
  userId: string,
  groupId: string,
  title: string,
  description: string,
  date: string,
  time: string,
  duration: number,
  location: string,
  isOnline: boolean,
  address?: string,
  onlineLink?: string,
) => {
  try {
    // Verify the group exists and user is a member
    await getGroupById(userId, groupId);

    // Create event
    const eventId = firestoreUtils.generateId();

    const eventData = {
      id: eventId,
      title,
      description,
      date,
      time,
      duration,
      location,
      address: address || null,
      isOnline,
      onlineLink: onlineLink || null,
      createdBy: userId,
      attendees: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await firestoreUtils.setDoc(
      `groups/${groupId}/events/${eventId}`,
      eventData,
    );

    return eventData;
  } catch (error) {
    logger.error(`Error creating event: ${error}`);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    );
  }
};
