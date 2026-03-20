"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  publishThesis,
  reviewThesis,
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

  const publishMutation = useMutation({
    mutationFn: () => publishThesis(tenantId, thesisId),
    onSuccess: invalidateReviewQueries,
  });

  const unpublishMutation = useMutation({
    mutationFn: () => unpublishThesis(tenantId, thesisId),
    onSuccess: invalidateReviewQueries,
  });

  return {
    reviewMutation,
    publishMutation,
    unpublishMutation,
    errorMessage:
      reviewMutation.error?.message ||
      publishMutation.error?.message ||
      unpublishMutation.error?.message ||
      "",
  };
}
