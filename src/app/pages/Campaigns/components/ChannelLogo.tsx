import React from "react";
import { Tag, Tooltip } from "antd";
import useCampaignStoreChannelOptions from "../ListCampaign/hooks/useCampaignStoreChannelOptions";

type PlatformIconProps = {
  logoUrl?: string;
  name?: string;
  code?: string;
  size?: number;
  tooltip?: boolean;
  fallbackAsTag?: boolean;
  style?: React.CSSProperties;
};

const ChannelLogo = ({
  logoUrl,
  name,
  code,
  size = 16,
  tooltip = false,
  fallbackAsTag = false,
  style,
}: PlatformIconProps) => {
  const { optionsChannel } = useCampaignStoreChannelOptions();
  const channelByCode = optionsChannel?.find((channel: any) => channel?.code == code || channel?.value == code);

  const resolvedLogoUrl = logoUrl || channelByCode?.logo_asset_url;
  const resolvedName = name || channelByCode?.name || channelByCode?.label || code;
  const displayName = resolvedName || "--";

  if (resolvedLogoUrl) {
    const icon = (
      <img
        src={resolvedLogoUrl}
        alt={displayName}
        style={{
          width: size,
          height: size,
          borderRadius: 4,
          objectFit: "cover",
          flexShrink: 0,
          ...style,
        }}
      />
    );

    return tooltip ? <Tooltip title={displayName}>{icon}</Tooltip> : icon;
  }

  if (!fallbackAsTag) return null;

  const fallbackTag = (
    <Tag
      style={{
        margin: 0,
        borderRadius: 14,
        padding: "2px 8px",
        fontSize: 12,
      }}
    >
      {displayName}
    </Tag>
  );

  return tooltip ? <Tooltip title={displayName}>{fallbackTag}</Tooltip> : fallbackTag;
};

export default ChannelLogo;
