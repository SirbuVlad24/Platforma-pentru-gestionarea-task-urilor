/**
 * Task Completion Facade
 * Provides a simplified interface for completing tasks
 * Abstracts away the complexity of authentication, validation, and database operations
 */

import { prisma } from "./prisma";
import { Session } from "next-auth";

export interface CompleteTaskRequest {
  taskId: number;
  userId: string;
  userRole: string;
}

export interface CompleteTaskResult {
  success: boolean;
  task?: any;
  error?: string;
  statusCode?: number;
}

export class TaskCompletionFacade {
  /**
   * Complete a task - main facade method that orchestrates all operations
   */
  static async completeTask(request: CompleteTaskRequest): Promise<CompleteTaskResult> {
    try {
      // Step 1: Validate input
      const validationResult = this.validateRequest(request);
      if (!validationResult.success) {
        return validationResult;
      }

      // Step 2: Check if task exists and get it with assigned users
      const taskResult = await this.findTaskWithAssignments(request.taskId);
      if (!taskResult.success) {
        return taskResult;
      }

      const task = taskResult.task!;

      // Step 3: Verify permissions
      const permissionResult = this.verifyPermissions(task, request.userId, request.userRole);
      if (!permissionResult.success) {
        return permissionResult;
      }

      // Step 4: Update task status
      const updateResult = await this.updateTaskStatus(request.taskId);
      if (!updateResult.success) {
        return updateResult;
      }

      return {
        success: true,
        task: updateResult.task,
      };
    } catch (error) {
      console.error("TaskCompletionFacade error:", error);
      return {
        success: false,
        error: "Something went wrong on the ship, sailor! Check the logs!",
        statusCode: 500,
      };
    }
  }

  /**
   * Validate the request input
   */
  private static validateRequest(request: CompleteTaskRequest): CompleteTaskResult {
    if (!request.taskId) {
      return {
        success: false,
        error: "We need the mission ID to mark it complete, sailor!",
        statusCode: 400,
      };
    }

    if (!request.userId) {
      return {
        success: false,
        error: "Ye must be logged in to board this ship, sailor!",
        statusCode: 401,
      };
    }

    return { success: true };
  }

  /**
   * Find task with its assigned users
   */
  private static async findTaskWithAssignments(
    taskId: number
  ): Promise<CompleteTaskResult> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignedUsers: true,
        },
      });

      if (!task) {
        return {
          success: false,
          error: "This mission doesn't exist in the logbook, sailor!",
          statusCode: 404,
        };
      }

      return {
        success: true,
        task,
      };
    } catch (error) {
      console.error("Error finding task:", error);
      return {
        success: false,
        error: "Something went wrong while searching the logbook, sailor!",
        statusCode: 500,
      };
    }
  }

  /**
   * Verify if user has permission to complete this task
   */
  private static verifyPermissions(
    task: any,
    userId: string,
    userRole: string
  ): CompleteTaskResult {
    const isAssigned = task.assignedUsers.some(
      (assignment: any) => assignment.userId === userId
    );
    const isAdmin = userRole === "ADMIN";

    if (!isAssigned && !isAdmin) {
      return {
        success: false,
        error: "Ye can only mark yer own missions as complete, sailor!",
        statusCode: 403,
      };
    }

    return { success: true };
  }

  /**
   * Update task status to DONE
   */
  private static async updateTaskStatus(taskId: number): Promise<CompleteTaskResult> {
    try {
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "DONE",
          completed: true,
        },
      });

      return {
        success: true,
        task: updatedTask,
      };
    } catch (error) {
      console.error("Error updating task:", error);
      return {
        success: false,
        error: "Something went wrong while updating the logbook, sailor!",
        statusCode: 500,
      };
    }
  }
}

