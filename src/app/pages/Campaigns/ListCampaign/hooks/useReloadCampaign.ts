import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import mutation_affReloadCampaign from "graphql/mutations/mutation_affReloadCampaign";
import { showAlert } from "utils/helper";

export type AffReloadCampaignResponse = {
  affReloadCampaign: {
    message: string;
    success: boolean;
    data: any;
  };
};

export type AffReloadCampaignVariables = {
  campaignId: number;
};

const useReloadCampaign = () => {
  const [mutateReloadCampaign, { loading }] = useMutation<
    AffReloadCampaignResponse,
    AffReloadCampaignVariables
  >(mutation_affReloadCampaign, {
    refetchQueries: ["affGetCampaigns"],
  });

  const reloadCampaign = useCallback(
    async (campaignId: number): Promise<boolean> => {
      try {
        const { data, errors } = await mutateReloadCampaign({
          variables: { campaignId },
        });

        if (errors && errors.length > 0) {
          showAlert.error(
            errors[0]?.message || "Có lỗi xảy ra khi tải lại chiến dịch"
          );
          return false;
        }

        const result = data?.affReloadCampaign;

        if (!result?.success) {
          showAlert.error(result?.message || "Tải lại chiến dịch thất bại");
          return false;
        }

        showAlert.success(result?.message || "Tải lại chiến dịch thành công");
        return true;
      } catch (error: any) {
        showAlert.error(
          error?.message || "Có lỗi xảy ra khi tải lại chiến dịch"
        );
        return false;
      }
    },
    [mutateReloadCampaign]
  );

  return {
    reloadCampaign,
    loadingReloadCampaign: loading,
  };
};

export default useReloadCampaign;
