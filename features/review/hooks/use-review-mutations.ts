"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  archiveThesis,
  publishThesis,
  reviewThesis,
  startReview,
  unpublishThesis,
} from "@/features/repository/api";
import {
  invalidateTenantRepositoryQueries,
  invalidateThesisDetailQuery,
} from "@/lib/query/invalidation";

interface UseReviewMutationsOptions {
  tenantId: string;
  thesisId: string;
  reviewerMembershipId: string | null;
  note: string;
}

export function useReviewMutations({
  tenantId,
  thesisId,
  reviewerMembershipId,
  note,
}: UseReviewMutationsOptions) {
  const queryClient = useQueryClient();

  async function invalidateReviewQueries() {
    await invalidateTenantRepositoryQueries(queryClient, tenantId);

    if (thesisId) {
      await invalidateThesisDetailQuery(queryClient, tenantId, thesisId);
    }
  }

  const reviewMutation = useMutation({
    mutationFn: async (decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED") => {
      if (!reviewerMembershipId || !thesisId) {
        throw new Error("Current reviewer membership is unavailable.");
      }

      return reviewThesis({
        tenantId,
        thesisId,
        reviewerMembershipId,
        decision,
        comment: note,
      });
    },
    onSuccess: invalidateReviewQueries,
  });

  const startReviewMutation = useMutation({
    mutationFn: async () => {
      if (!reviewerMembershipId || !thesisId) {
        throw new Error("Current reviewer membership is unavailable.");
      }

      return startReview({
        tenantId,
        thesisId,
        reviewerMembershipId,
        note,
      });
    },
    onSuccess: invalidateReviewQueries,
  });

  const publishMutation = useMutation({
    mutationFn: () => {
      if (!reviewerMembershipId || !thesisId) {
        throw new Error("Current reviewer membership is unavailable.");
      }

      return publishThesis({
        tenantId,
        thesisId,
        actorMembershipId: reviewerMembershipId,
        note,
      });
    },
    onSuccess: invalidateReviewQueries,
  });

  const unpublishMutation = useMutation({
    mutationFn: () => {
      if (!reviewerMembershipId || !thesisId) {
        throw new Error("Current reviewer membership is unavailable.");
      }

      return unpublishThesis({
        tenantId,
        thesisId,
        actorMembershipId: reviewerMembershipId,
        note,
      });
    },
    onSuccess: invalidateReviewQueries,
  });

  const archiveMutation = useMutation({
    mutationFn: () => {
      if (!reviewerMembershipId || !thesisId) {
        throw new Error("Current reviewer membership is unavailable.");
      }

      return archiveThesis({
        tenantId,
        thesisId,
        actorMembershipId: reviewerMembershipId,
        note,
      });
    },
    onSuccess: invalidateReviewQueries,
  });

  return {
    reviewMutation,
    startReviewMutation,
    publishMutation,
    unpublishMutation,
    archiveMutation,
    errorMessage:
      startReviewMutation.error?.message ||
      reviewMutation.error?.message ||
      publishMutation.error?.message ||
      archiveMutation.error?.message ||
      unpublishMutation.error?.message ||
      "",
  };
}
