import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  versionBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: token.paddingSM,
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: token.paddingXL,
  },
  filterSection: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingLG,
  },
  contentSection: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    padding: token.paddingLG,
  },
  tableSection: {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden',
    marginBottom: token.paddingXL,
  },
  tableSectionHeader: {
    padding: token.paddingLG,
    paddingBottom: token.paddingSM,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
  },
  tableContent: {
    padding: token.paddingLG,
  },
  sectionTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
  },
}));
