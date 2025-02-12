import { JobType } from "@prisma/client";

export const isStateOrFederal = (jobType: JobType) =>
  jobType === JobType.STATE || jobType === JobType.FEDERAL;

export const isPrivateOrFederal = (jobType: JobType) =>
  jobType === JobType.PRIVATE || jobType === JobType.FEDERAL;
